import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/db/mongoose";
import User from "@/models/User";
import Membership from "@/models/Membership";
import Invite from "@/models/Invite";
import House from "@/models/House";
import { Thread } from "@/models/Thread";
import { INVITE_STATUS } from "@/lib/constants";

// GET /api/invites/[token] — look up invite details (public, for the landing page)
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

  // Don't expose token in response body
  const { token: _t, ...safe } = invite;
  return Response.json({ success: true, data: safe });
}

// POST /api/invites/[token] — accept invite (requires auth)
export async function POST(req, { params }) {
  const { userId: clerkId } = await auth();
  if (!clerkId)
    return Response.json(
      { success: false, error: "Sign in to accept invite" },
      { status: 401 }
    );

  await connectDB();
  const { token } = await params;

  const user = await User.findOne({ clerkId, deletedAt: null });
  if (!user)
    return Response.json(
      { success: false, error: "User not found" },
      { status: 404 }
    );

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

  // Check not already a member
  const existing = await Membership.findOne({
    userId: user._id,
    houseId: invite.houseId,
  });
  if (existing?.isActive)
    return Response.json(
      { success: false, error: "You are already a member of this house" },
      { status: 409 }
    );

  // Create membership
  const membership = await Membership.create({
    userId: user._id,
    houseId: invite.houseId,
    role: invite.role,
    joinedAt: new Date(),
    isActive: true,
  });

  // Mark invite accepted
  await Invite.findByIdAndUpdate(invite._id, {
    $set: {
      status: INVITE_STATUS.ACCEPTED,
      acceptedBy: user._id,
      acceptedAt: new Date(),
    },
  });

  return Response.json({
    success: true,
    data: {
      membershipId: membership._id,
      houseId: invite.houseId,
      role: invite.role,
    },
  });
}
