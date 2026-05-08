import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/db/mongoose";
import User from "@/models/User";
import Membership from "@/models/Membership";
import ManagerNote from "@/models/ManagerNote";

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
