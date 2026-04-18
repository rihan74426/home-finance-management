import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/db/mongoose";
import User from "@/models/User";
import Membership from "@/models/Membership";
import { ROLES } from "@/lib/constants";

// DELETE /api/houses/[id]/members/[membershipId]
// Manager removes a member, or a member removes themselves (leave)
export async function DELETE(req, { params }) {
  const { userId: clerkId } = await auth();
  if (!clerkId)
    return Response.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );

  await connectDB();
  const { id, membershipId } = await params;

  const user = await User.findOne({ clerkId, deletedAt: null });
  if (!user)
    return Response.json(
      { success: false, error: "User not found" },
      { status: 404 }
    );

  const requester = await Membership.findOne({
    userId: user._id,
    houseId: id,
    isActive: true,
  });
  if (!requester)
    return Response.json(
      { success: false, error: "Not a member" },
      { status: 403 }
    );

  const target = await Membership.findOne({
    _id: membershipId,
    houseId: id,
    isActive: true,
  });
  if (!target)
    return Response.json(
      { success: false, error: "Membership not found" },
      { status: 404 }
    );

  const isSelf = String(requester._id) === String(target._id);
  const isManager = requester.role === ROLES.MANAGER;

  // Only manager can remove others; anyone can remove themselves
  if (!isSelf && !isManager)
    return Response.json(
      { success: false, error: "Not authorized" },
      { status: 403 }
    );

  // Manager cannot remove themselves if they're the only manager
  if (isSelf && isManager) {
    const otherManagers = await Membership.countDocuments({
      houseId: id,
      role: ROLES.MANAGER,
      isActive: true,
      _id: { $ne: target._id },
    });
    if (otherManagers === 0)
      return Response.json(
        {
          success: false,
          error: "Transfer ownership to another member before leaving.",
        },
        { status: 400 }
      );
  }

  // Soft-deactivate (preserve for ledger history)
  await Membership.findByIdAndUpdate(membershipId, {
    $set: { isActive: false, moveOutDate: new Date() },
  });

  return Response.json({ success: true });
}
