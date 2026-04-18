import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/db/mongoose";
import House from "@/models/House";
import User from "@/models/User";
import Membership from "@/models/Membership";

// GET /api/houses/[id] — get single house details
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

  const house = await House.findOne({ _id: id, deletedAt: null });
  if (!house)
    return Response.json(
      { success: false, error: "House not found" },
      { status: 404 }
    );

  return Response.json({
    success: true,
    data: {
      ...house.toObject(),
      role: membership.role,
      membershipId: membership._id,
    },
  });
}

// PATCH /api/houses/[id] — update house settings (manager only)
export async function PATCH(req, { params }) {
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

  const body = await req.json();
  const allowed = [
    "name",
    "address",
    "currency",
    "rentDueDay",
    "rules",
    "avatarUrl",
    "type",
  ];
  const update = {};
  allowed.forEach((k) => {
    if (body[k] !== undefined) update[k] = body[k];
  });

  const house = await House.findByIdAndUpdate(
    id,
    { $set: update },
    { new: true }
  );
  return Response.json({ success: true, data: house });
}

// DELETE /api/houses/[id] — soft delete (manager only)
export async function DELETE(req, { params }) {
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

  // Soft delete house
  await House.findByIdAndUpdate(id, { $set: { deletedAt: new Date() } });

  // Deactivate all memberships
  await Membership.updateMany({ houseId: id }, { $set: { isActive: false } });

  return Response.json({ success: true });
}
