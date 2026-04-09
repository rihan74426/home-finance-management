import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/db/mongoose";
import User from "@/models/User";
import Membership from "@/models/Membership";
import { ROLES } from "@/lib/constants";

// GET /api/houses/[id]/members
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

  const memberships = await Membership.find({ houseId: id, isActive: true })
    .populate("userId", "name email avatarUrl phone")
    .sort({ createdAt: 1 });

  const isManager = requester.role === ROLES.MANAGER;

  const members = memberships.map((m) => {
    const base = {
      membershipId: m._id,
      userId: m.userId?._id,
      name: m.userId?.name,
      avatarUrl: m.userId?.avatarUrl,
      role: m.role,
      roomLabel: m.roomLabel,
      joinedAt: m.joinedAt,
      moveInDate: m.moveInDate,
    };
    // Only managers see rent amounts and contact details of others
    if (isManager || String(m.userId?._id) === String(user._id)) {
      base.rentAmount = m.rentAmount;
      base.preferredPaymentMethod = m.preferredPaymentMethod;
      base.email = m.userId?.email;
      base.phone = m.userId?.phone;
    }
    return base;
  });

  return Response.json({ success: true, data: members });
}
