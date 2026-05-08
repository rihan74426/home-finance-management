import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/db/mongoose";
import User from "@/models/User";
import Membership from "@/models/Membership";
import Meeting from "@/models/Meeting";
import Notification from "@/models/Notification";
import { NOTIFICATION_TYPE } from "@/lib/constants";

// PATCH /api/meetings/[meetingId]
// Handles: rsvp, cancel, add_notes
export async function PATCH(req, { params }) {
  const { userId: clerkId } = await auth();
  if (!clerkId)
    return Response.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );

  await connectDB();
  const { meetingId } = await params;

  const user = await User.findOne({ clerkId, deletedAt: null });
  if (!user)
    return Response.json(
      { success: false, error: "User not found" },
      { status: 404 }
    );

  const meeting = await Meeting.findById(meetingId);
  if (!meeting)
    return Response.json(
      { success: false, error: "Meeting not found" },
      { status: 404 }
    );

  const membership = await Membership.findOne({
    userId: user._id,
    houseId: meeting.houseId,
    isActive: true,
  }).lean();
  if (!membership)
    return Response.json(
      { success: false, error: "Not a member" },
      { status: 403 }
    );

  const isManager = membership.role === "manager";
  const isCreator = String(meeting.createdBy) === String(user._id);

  let body;
  try {
    body = await req.json();
  } catch {
    return Response.json(
      { success: false, error: "Invalid JSON" },
      { status: 400 }
    );
  }

  const { action } = body;

  // ── RSVP ─────────────────────────────────────────────────────────────────
  if (action === "rsvp") {
    const { status, note } = body;
    const validStatuses = [
      "attending",
      "not_attending",
      "maybe",
      "no_response",
    ];
    if (!validStatuses.includes(status))
      return Response.json(
        { success: false, error: "Invalid RSVP status" },
        { status: 400 }
      );

    const idx = meeting.rsvps.findIndex(
      (r) => String(r.userId) === String(user._id)
    );
    if (idx >= 0) {
      meeting.rsvps[idx].status = status;
      meeting.rsvps[idx].respondedAt = new Date();
      if (note !== undefined) meeting.rsvps[idx].note = note;
    } else {
      meeting.rsvps.push({
        userId: user._id,
        status,
        respondedAt: new Date(),
        note: note || "",
      });
    }
    await meeting.save();
    return Response.json({ success: true, data: { rsvp: { status } } });
  }

  // ── Cancel ────────────────────────────────────────────────────────────────
  if (action === "cancel") {
    if (!isManager && !isCreator)
      return Response.json(
        { success: false, error: "Not authorized to cancel" },
        { status: 403 }
      );

    meeting.cancelledAt = new Date();
    meeting.cancellationReason = body.reason?.trim() || "";
    await meeting.save();

    // Notify all members
    const memberships = await Membership.find({
      houseId: meeting.houseId,
      isActive: true,
    }).lean();
    for (const m of memberships) {
      if (String(m.userId) === String(user._id)) continue;
      Notification.create({
        userId: m.userId,
        houseId: meeting.houseId,
        type: NOTIFICATION_TYPE.ANNOUNCEMENT,
        title: `Meeting cancelled: ${meeting.title}`,
        body: body.reason?.trim() || "No reason provided.",
        meta: { meetingId: meeting._id },
      }).catch(() => {});
    }

    return Response.json({ success: true, data: meeting });
  }

  // ── Update details (reschedule, add notes, etc.) ──────────────────────────
  if (action === "update") {
    if (!isManager && !isCreator)
      return Response.json(
        { success: false, error: "Not authorized" },
        { status: 403 }
      );

    const {
      title,
      agenda,
      scheduledAt,
      durationMinutes,
      meetingLink,
      platform,
      passcode,
      location,
      notes,
      isCompleted,
    } = body;

    if (title?.trim()) meeting.title = title.trim();
    if (agenda !== undefined) meeting.agenda = agenda?.trim() || "";
    if (scheduledAt) meeting.scheduledAt = new Date(scheduledAt);
    if (durationMinutes) meeting.durationMinutes = durationMinutes;
    if (meetingLink !== undefined)
      meeting.meetingLink = meetingLink?.trim() || null;
    if (platform !== undefined) meeting.platform = platform;
    if (passcode !== undefined) meeting.passcode = passcode?.trim() || null;
    if (location) meeting.location = { ...meeting.location, ...location };
    if (notes !== undefined) meeting.notes = notes?.trim() || "";
    if (typeof isCompleted === "boolean") meeting.isCompleted = isCompleted;

    await meeting.save();

    // Notify if rescheduled
    if (scheduledAt) {
      const memberships = await Membership.find({
        houseId: meeting.houseId,
        isActive: true,
      }).lean();
      for (const m of memberships) {
        if (String(m.userId) === String(user._id)) continue;
        Notification.create({
          userId: m.userId,
          houseId: meeting.houseId,
          type: NOTIFICATION_TYPE.MEETING_SCHEDULED,
          title: `Meeting rescheduled: ${meeting.title}`,
          body: `New time: ${new Date(scheduledAt).toLocaleString()}`,
          meta: { meetingId: meeting._id },
        }).catch(() => {});
      }
    }

    return Response.json({ success: true, data: meeting });
  }

  return Response.json(
    { success: false, error: "Unknown action" },
    { status: 400 }
  );
}

// GET /api/meetings/[meetingId]
export async function GET(req, { params }) {
  const { userId: clerkId } = await auth();
  if (!clerkId)
    return Response.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );

  await connectDB();
  const { meetingId } = await params;

  const user = await User.findOne({ clerkId, deletedAt: null });
  if (!user)
    return Response.json(
      { success: false, error: "User not found" },
      { status: 404 }
    );

  const meeting = await Meeting.findById(meetingId)
    .populate("createdBy", "name avatarUrl")
    .populate("rsvps.userId", "name avatarUrl")
    .lean();
  if (!meeting)
    return Response.json(
      { success: false, error: "Meeting not found" },
      { status: 404 }
    );

  const membership = await Membership.findOne({
    userId: user._id,
    houseId: meeting.houseId,
    isActive: true,
  }).lean();
  if (!membership)
    return Response.json(
      { success: false, error: "Not a member" },
      { status: 403 }
    );

  const myRsvp =
    meeting.rsvps.find(
      (r) => String(r.userId?._id || r.userId) === String(user._id)
    )?.status || "no_response";

  return Response.json({
    success: true,
    data: { ...meeting, myRsvp },
    isManager: membership.role === "manager",
  });
}
