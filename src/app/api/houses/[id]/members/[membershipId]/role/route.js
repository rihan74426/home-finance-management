import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/db/mongoose";
import User from "@/models/User";
import Membership from "@/models/Membership";
import { ROLES } from "@/lib/constants";

// PATCH /api/houses/[id]/members/[membershipId]/role
export async function PATCH(req, { params }) {
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

  const { role } = body;
  const validRoles = [ROLES.MANAGER, ROLES.MEMBER, ROLES.GUEST];
  if (!role || !validRoles.includes(role))
    return Response.json(
      { success: false, error: "Invalid role" },
      { status: 400 }
    );

  // Prevent demoting yourself
  const requesterMembership = await Membership.findOne({
    userId: user._id,
    houseId: id,
    isActive: true,
  });
  if (
    String(requesterMembership._id) === String(membershipId) &&
    role !== ROLES.MANAGER
  )
    return Response.json(
      { success: false, error: "Cannot demote yourself" },
      { status: 400 }
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

  target.role = role;
  await target.save();

  // If promoting to manager, update House.managerId
  if (role === ROLES.MANAGER) {
    const House = (await import("@/models/House")).default;
    await House.findByIdAndUpdate(id, { $set: { managerId: target.userId } });
    // Demote previous manager to member
    await Membership.updateMany(
      { houseId: id, role: ROLES.MANAGER, _id: { $ne: target._id } },
      { $set: { role: ROLES.MEMBER } }
    );
  }

  return Response.json({ success: true, data: { membershipId, role } });
}
