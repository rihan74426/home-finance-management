import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/db/mongoose";
import User from "@/models/User";
import Membership from "@/models/Membership";
import House from "@/models/House";
import { ROLES } from "@/lib/constants";

// POST /api/houses/[id]/transfer
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

  const { newManagerMembershipId } = body;
  if (!newManagerMembershipId)
    return Response.json(
      { success: false, error: "newManagerMembershipId required" },
      { status: 400 }
    );

  const newManagerMembership = await Membership.findOne({
    _id: newManagerMembershipId,
    houseId: id,
    isActive: true,
  });
  if (!newManagerMembership)
    return Response.json(
      { success: false, error: "Target membership not found" },
      { status: 404 }
    );

  // Demote current manager → member
  await Membership.updateMany(
    { houseId: id, role: ROLES.MANAGER },
    { $set: { role: ROLES.MEMBER } }
  );

  // Promote new manager
  await Membership.findByIdAndUpdate(newManagerMembershipId, {
    $set: { role: ROLES.MANAGER },
  });

  // Update house.managerId
  await House.findByIdAndUpdate(id, {
    $set: { managerId: newManagerMembership.userId },
  });

  return Response.json({ success: true });
}
