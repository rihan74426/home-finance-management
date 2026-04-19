import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/db/mongoose";
import User from "@/models/User";
import Membership from "@/models/Membership";
import Meeting, { RSVP_STATUS, MEETING_TYPE } from "@/models/Meeting";
import Notification from "@/models/Notification";
import { NOTIFICATION_TYPE } from "@/lib/constants";

// GET /api/houses/[id]/meetings
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

  const { searchParams } = new URL(req.url);
  const upcoming = searchParams.get("upcoming") !== "false";

  const query = { houseId: id, cancelledAt: null };
  if (upcoming) {
    query.scheduledAt = { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }; // include today
  }

  const meetings = await Meeting.find(query)
    .populate("createdBy", "name avatarUrl")
    .populate("rsvps.userId", "name avatarUrl")
    .sort({ scheduledAt: upcoming ? 1 : -1 })
    .lean();

  // Attach current user's RSVP to each meeting
  const enriched = meetings.map((m) => ({
    ...m,
    myRsvp:
      m.rsvps.find(
        (r) => String(r.userId?._id || r.userId) === String(user._id)
      )?.status || RSVP_STATUS.NO_RESPONSE,
  }));

  return Response.json({
    success: true,
    data: enriched,
    isManager: membership.role === "manager",
  });
}

// POST /api/houses/[id]/meetings — any member can create (or manager-only, depending on permissions)
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

  let body;
  try {
    body = await req.json();
  } catch {
    return Response.json(
      { success: false, error: "Invalid JSON" },
      { status: 400 }
    );
  }

  const {
    title,
    agenda,
    type,
    scheduledAt,
    durationMinutes,
    platform,
    meetingLink,
    meetingId,
    passcode,
    location,
  } = body;

  if (!title?.trim())
    return Response.json(
      { success: false, error: "Title required" },
      { status: 400 }
    );
  if (!scheduledAt)
    return Response.json(
      { success: false, error: "scheduledAt required" },
      { status: 400 }
    );
  if (!Object.values(MEETING_TYPE).includes(type))
    return Response.json(
      { success: false, error: "type must be 'online' or 'offline'" },
      { status: 400 }
    );

  if (type === MEETING_TYPE.ONLINE && !meetingLink)
    return Response.json(
      { success: false, error: "meetingLink required for online meetings" },
      { status: 400 }
    );

  if (type === MEETING_TYPE.OFFLINE && !location?.name)
    return Response.json(
      { success: false, error: "location.name required for offline meetings" },
      { status: 400 }
    );

  // Get all active members to pre-populate RSVPs
  const memberships = await Membership.find({ houseId: id, isActive: true })
    .populate("userId", "_id")
    .lean();
  const rsvps = memberships.map((m) => ({
    userId: m.userId._id,
    status: RSVP_STATUS.NO_RESPONSE,
  }));

  const meeting = await Meeting.create({
    houseId: id,
    createdBy: user._id,
    title: title.trim(),
    agenda: agenda?.trim() || "",
    type,
    scheduledAt: new Date(scheduledAt),
    durationMinutes: durationMinutes || 60,
    platform: platform || null,
    meetingLink: meetingLink || null,
    meetingId: meetingId || null,
    passcode: passcode || null,
    location:
      type === MEETING_TYPE.OFFLINE
        ? {
            name: location?.name || "",
            address: location?.address || "",
            mapLink: location?.mapLink || "",
          }
        : {},
    rsvps,
  });

  // Notify all members
  const notifyUsers = memberships
    .map((m) => m.userId._id)
    .filter((uid) => String(uid) !== String(user._id));

  const locationText =
    type === MEETING_TYPE.ONLINE
      ? `Online — ${platform || "link provided"}`
      : location?.name || "Location TBD";

  await Promise.all(
    notifyUsers.map((uid) =>
      Notification.create({
        userId: uid,
        houseId: id,
        type: NOTIFICATION_TYPE.MEETING_SCHEDULED,
        title: `Meeting scheduled: ${title.trim()}`,
        body: `${new Date(scheduledAt).toLocaleString()} — ${locationText}`,
        meta: { meetingId: meeting._id },
      }).catch(() => {})
    )
  );

  await meeting.populate("createdBy", "name avatarUrl");
  return Response.json({ success: true, data: meeting }, { status: 201 });
}
