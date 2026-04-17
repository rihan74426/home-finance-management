import { auth, clerkClient } from "@clerk/nextjs/server";
import connectDB from "@/lib/db/mongoose";
import User from "@/models/User";
import Membership from "@/models/Membership";
import Invite from "@/models/Invite";
import House from "@/models/House";
import { INVITE_STATUS, NOTIFICATION_TYPE } from "@/lib/constants";
import { createNotification } from "@/lib/notifications";

export async function GET(req, { params }) {
  await connectDB();
  const { token } = await params;

  const invite = await Invite.findOne({ token, status: INVITE_STATUS.PENDING })
    .populate("houseId", "name type address avatarUrl")
    .populate("invitedBy", "name avatarUrl")
    .lean();

  if (!invite)
    return Response.json(
      { success: false, error: "Invite not found or expired" },
      { status: 404 }
    );

  if (invite.expiresAt < new Date()) {
    await Invite.findByIdAndUpdate(invite._id, {
      $set: { status: INVITE_STATUS.EXPIRED },
    });
    return Response.json(
      { success: false, error: "Invite has expired" },
      { status: 410 }
    );
  }

  const { token: _t, ...safe } = invite;
  return Response.json({ success: true, data: safe });
}

export async function POST(req, { params }) {
  const { userId: clerkId } = await auth();
  if (!clerkId)
    return Response.json(
      { success: false, error: "Sign in to accept invite" },
      { status: 401 }
    );

  await connectDB();
  const { token } = await params;

  let user = await User.findOne({ clerkId, deletedAt: null });
  if (!user) {
    const clerkUser = await (await clerkClient()).users.getUser(clerkId);
    const email =
      clerkUser.emailAddresses.find(
        (e) => e.id === clerkUser.primaryEmailAddressId
      )?.emailAddress ?? `${clerkId}@placeholder.homy`;
    user = await User.create({
      clerkId,
      email,
      name:
        [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") ||
        clerkUser.username ||
        "New User",
      avatarUrl: clerkUser.imageUrl ?? null,
    });
  }

  const invite = await Invite.findOne({ token, status: INVITE_STATUS.PENDING });
  if (!invite)
    return Response.json(
      { success: false, error: "Invite not found or already used" },
      { status: 404 }
    );

  if (invite.expiresAt < new Date()) {
    await Invite.findByIdAndUpdate(invite._id, {
      $set: { status: INVITE_STATUS.EXPIRED },
    });
    return Response.json(
      { success: false, error: "Invite has expired" },
      { status: 410 }
    );
  }

  const existing = await Membership.findOne({
    userId: user._id,
    houseId: invite.houseId,
  });
  if (existing?.isActive)
    return Response.json(
      { success: false, error: "You are already a member of this house" },
      { status: 409 }
    );

  const membership = await Membership.create({
    userId: user._id,
    houseId: invite.houseId,
    role: invite.role,
    joinedAt: new Date(),
    isActive: true,
  });

  await Invite.findByIdAndUpdate(invite._id, {
    $set: {
      status: INVITE_STATUS.ACCEPTED,
      acceptedBy: user._id,
      acceptedAt: new Date(),
    },
  });

  // Notify the manager who sent the invite
  const house = await House.findById(invite.houseId).lean();
  if (house) {
    await createNotification({
      userId: invite.invitedBy,
      houseId: invite.houseId,
      type: NOTIFICATION_TYPE.MEMBER_JOINED,
      title: `${user.name} joined ${house.name}`,
      body: `They accepted your invite as ${invite.role}.`,
      meta: { membershipId: membership._id },
    });
  }

  return Response.json({
    success: true,
    data: {
      membershipId: membership._id,
      houseId: invite.houseId,
      role: invite.role,
    },
  });
}
