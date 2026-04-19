import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/db/mongoose";
import User from "@/models/User";
import Membership from "@/models/Membership";
import ManagerNote from "@/models/ManagerNote";

// PATCH /api/notes/[noteId]
export async function PATCH(req, { params }) {
  const { userId: clerkId } = await auth();
  if (!clerkId)
    return Response.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );

  await connectDB();
  const { noteId } = await params;

  const user = await User.findOne({ clerkId, deletedAt: null });
  if (!user)
    return Response.json(
      { success: false, error: "User not found" },
      { status: 404 }
    );

  const note = await ManagerNote.findOne({ _id: noteId, deletedAt: null });
  if (!note)
    return Response.json(
      { success: false, error: "Note not found" },
      { status: 404 }
    );

  const isManager = await Membership.isManager(user._id, note.houseId);
  if (!isManager || String(note.createdBy) !== String(user._id))
    return Response.json(
      { success: false, error: "Not authorized" },
      { status: 403 }
    );

  const { title, body, isPrivate, category, isPinned } = await req.json();
  if (title !== undefined) note.title = title.trim();
  if (body?.trim()) note.body = body.trim();
  if (typeof isPrivate === "boolean") note.isPrivate = isPrivate;
  if (category) note.category = category;
  if (typeof isPinned === "boolean") note.isPinned = isPinned;

  await note.save();
  return Response.json({ success: true, data: note });
}

// DELETE /api/notes/[noteId]
export async function DELETE(req, { params }) {
  const { userId: clerkId } = await auth();
  if (!clerkId)
    return Response.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );

  await connectDB();
  const { noteId } = await params;

  const user = await User.findOne({ clerkId, deletedAt: null });
  if (!user)
    return Response.json(
      { success: false, error: "User not found" },
      { status: 404 }
    );

  const note = await ManagerNote.findOne({ _id: noteId, deletedAt: null });
  if (!note)
    return Response.json(
      { success: false, error: "Note not found" },
      { status: 404 }
    );

  const isManager = await Membership.isManager(user._id, note.houseId);
  if (!isManager)
    return Response.json(
      { success: false, error: "Manager only" },
      { status: 403 }
    );

  await ManagerNote.findByIdAndUpdate(noteId, {
    $set: { deletedAt: new Date() },
  });
  return Response.json({ success: true });
}
