import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/db/mongoose";
import User from "@/models/User";
import Membership from "@/models/Membership";
import { Thread } from "@/models/Thread";
import { ROLES } from "@/lib/constants";

// GET /api/houses/[id]/threads — list all threads for a house
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

  const threads = await Thread.find({
    houseId: id,
    deletedAt: null,
    isArchived: false,
  })
    .sort({ type: 1, lastMessageAt: -1 })
    .lean();

  return Response.json({ success: true, data: threads });
}

// POST /api/houses/[id]/threads — create a new thread (manager only on free plan)
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

  const { name, description } = await req.json();
  if (!name?.trim())
    return Response.json(
      { success: false, error: "Thread name required" },
      { status: 400 }
    );

  const thread = await Thread.create({
    houseId: id,
    createdBy: user._id,
    name: name.trim(),
    description: description?.trim() || "",
    type: "custom",
  });

  return Response.json({ success: true, data: thread }, { status: 201 });
}
