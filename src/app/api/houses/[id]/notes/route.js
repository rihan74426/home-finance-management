import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/db/mongoose";
import User from "@/models/User";
import Membership from "@/models/Membership";
import ManagerNote from "@/models/ManagerNote";
import Notification from "@/models/Notification";
import { NOTIFICATION_TYPE } from "@/lib/constants";

// GET /api/houses/[id]/notes
export async function GET(req, { params }) {
  const { userId: clerkId } = await auth();
  if (!clerkId)
    return Response.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );

  await connectDB();
  const { id } = await params;

  const user = await User.findOne({ clerkId, deletedAt: null });
  if (!user)
    return Response.json(
      { success: false, error: "User not found" },
      { status: 404 }
    );

  const membership = await Membership.findOne({
    userId: user._id,
    houseId: id,
    isActive: true,
  });
  if (!membership)
    return Response.json(
      { success: false, error: "Not a member" },
      { status: 403 }
    );

  const isManager = membership.role === "manager";

  let query = { houseId: id, deletedAt: null };
  if (!isManager) query.isPrivate = false; // Members only see public notes

  const notes = await ManagerNote.find(query)
    .populate("createdBy", "name avatarUrl")
    .sort({ isPinned: -1, createdAt: -1 })
    .lean();

  return Response.json({ success: true, data: notes, isManager });
}

// POST /api/houses/[id]/notes
export async function POST(req, { params }) {
  const { userId: clerkId } = await auth();
  if (!clerkId)
    return Response.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );

  await connectDB();
  const { id } = await params;

  const user = await User.findOne({ clerkId, deletedAt: null });
  if (!user)
    return Response.json(
      { success: false, error: "User not found" },
      { status: 404 }
    );

  const isManager = await Membership.isManager(user._id, id);
  if (!isManager)
    return Response.json(
      { success: false, error: "Manager only" },
      { status: 403 }
    );

  let body;
  try {
    body = await req.json();
  } catch {
    return Response.json(
      { success: false, error: "Invalid JSON" },
      { status: 400 }
    );
  }

  const {
    title,
    body: noteBody,
    isPrivate,
    category,
    isPinned,
    notifyMembers,
  } = body;
  if (!noteBody?.trim())
    return Response.json(
      { success: false, error: "Note body required" },
      { status: 400 }
    );

  const note = await ManagerNote.create({
    houseId: id,
    createdBy: user._id,
    title: title?.trim() || "",
    body: noteBody.trim(),
    isPrivate: isPrivate !== false, // default private
    category: category || "general",
    isPinned: !!isPinned,
    notifyMembers: !!notifyMembers,
  });

  // If public and notifyMembers, notify all members
  if (!note.isPrivate && note.notifyMembers) {
    const memberships = await Membership.find({
      houseId: id,
      isActive: true,
      role: { $ne: "manager" },
    })
      .populate("userId", "_id")
      .lean();

    await Promise.all(
      memberships.map((m) =>
        Notification.create({
          userId: m.userId._id,
          houseId: id,
          type: NOTIFICATION_TYPE.ANNOUNCEMENT,
          title: note.title || "New announcement from your manager",
          body: note.body.slice(0, 200),
          meta: { noteId: note._id },
        }).catch(() => {})
      )
    );
  }

  return Response.json({ success: true, data: note }, { status: 201 });
}
