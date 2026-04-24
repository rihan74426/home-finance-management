import { auth, clerkClient } from "@clerk/nextjs/server";
import connectDB from "@/lib/db/mongoose";
import User from "@/models/User";
import Membership from "@/models/Membership";
import Invite from "@/models/Invite";
import House from "@/models/House";
import { ROLES, INVITE_STATUS, HOUSE_TYPE } from "@/lib/constants";
import { getRequestIdentifier, limitApi } from "@/lib/rateLimit";
import { sendInviteEmail } from "@/lib/email";
import { sendInviteSMS } from "@/lib/sms";

const HOUSE_TYPE_LABELS = {
  [HOUSE_TYPE.FLAT]: "Flat",
  [HOUSE_TYPE.VILLA]: "Villa",
  [HOUSE_TYPE.FAMILY]: "Family Home",
  [HOUSE_TYPE.CO_LIVING]: "Co-Living",
  [HOUSE_TYPE.DORMITORY]: "Dormitory",
  [HOUSE_TYPE.OTHER]: "House",
};

// POST /api/houses/[id]/invites — manager creates an invite link
export async function POST(req, { params }) {
  const identifier = getRequestIdentifier(req) || (params?.id ?? "anon");
  const maybeBlocked = limitApi(identifier, "invite");
  if (maybeBlocked) return maybeBlocked;

  const { userId: clerkId } = await auth();
  if (!clerkId)
    return Response.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );

  await connectDB();
  const { id } = await params;

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
        "User",
      avatarUrl: clerkUser.imageUrl ?? null,
    });
  }

  const isManager = await Membership.isManager(user._id, id);
  if (!isManager)
    return Response.json(
      { success: false, error: "Manager only" },
      { status: 403 }
    );

  const house = await House.findOne({ _id: id, deletedAt: null });
  if (!house)
    return Response.json(
      { success: false, error: "House not found" },
      { status: 404 }
    );

  const { email, phone, name, role } = await req.json();
  if (!email && !phone)
    return Response.json(
      { success: false, error: "Email or phone required" },
      { status: 400 }
    );

  // Cancel existing pending invites for same contact
  if (email)
    await Invite.updateMany(
      { houseId: id, email, status: INVITE_STATUS.PENDING },
      { $set: { status: INVITE_STATUS.EXPIRED } }
    );
  if (phone)
    await Invite.updateMany(
      { houseId: id, phone, status: INVITE_STATUS.PENDING },
      { $set: { status: INVITE_STATUS.EXPIRED } }
    );

  const invite = await Invite.createInvite({
    houseId: id,
    invitedBy: user._id,
    email: email || null,
    phone: phone || null,
    name: name || "",
    role: role === ROLES.GUEST ? ROLES.GUEST : ROLES.MEMBER,
  });

  const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/invite/${invite.token}`;

  // Send email invite (fire-and-forget — don't fail the request if email fails)
  if (email) {
    sendInviteEmail({
      to: email,
      name: name || undefined,
      inviterName: user.name,
      houseName: house.name,
      houseType: HOUSE_TYPE_LABELS[house.type] || "House",
      houseCity: house.address?.city || null,
      role: invite.role,
      inviteUrl,
      expiresAt: invite.expiresAt,
    }).catch((err) =>
      console.error("[invite] Email send failed:", err.message)
    );
  }

  // Send SMS invite (fire-and-forget)
  if (phone) {
    sendInviteSMS({
      to: phone,
      inviterName: user.name,
      houseName: house.name,
      inviteUrl,
    }).catch((err) => console.error("[invite] SMS send failed:", err.message));
  }

  return Response.json(
    { success: true, data: { invite, inviteUrl } },
    { status: 201 }
  );
}

// GET /api/houses/[id]/invites — list pending invites (manager only)
export async function GET(req, { params }) {
  const identifier = getRequestIdentifier(req) || (params?.id ?? "anon");
  const maybeBlocked = limitApi(identifier, "read");
  if (maybeBlocked) return maybeBlocked;

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

  const invites = await Invite.find({
    houseId: id,
    status: INVITE_STATUS.PENDING,
  })
    .sort({ createdAt: -1 })
    .lean();
  return Response.json({ success: true, data: invites });
}
