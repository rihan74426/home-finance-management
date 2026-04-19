import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/db/mongoose";
import User from "@/models/User";
import Membership from "@/models/Membership";
import Meeting, { RSVP_STATUS } from "@/models/Meeting";
import Notification from "@/models/Notification";
import { NOTIFICATION_TYPE } from "@/lib/constants";

// PATCH /api/meetings/[meetingId]
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

  const meeting = await Meeting.findOne({ _id: meetingId, cancelledAt: null });
  if (!meeting)
    return Response.json(
      { success: false, error: "Meeting not found" },
      { status: 404 }
    );

  const membership = await Membership.findOne({
    userId: user._id,
    houseId: meeting.houseId,
    isActive: true,
  });
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

  // RSVP — any member
  if (action === "rsvp") {
    const { status, note } = body;
    if (!Object.values(RSVP_STATUS).includes(status))
      return Response.json(
        { success: false, error: "Invalid RSVP status" },
        { status: 400 }
      );

    const rsvpIndex = meeting.rsvps.findIndex(
      (r) => String(r.userId) === String(user._id)
    );
    if (rsvpIndex >= 0) {
      meeting.rsvps[rsvpIndex].status = status;
      meeting.rsvps[rsvpIndex].respondedAt = new Date();
      if (note) meeting.rsvps[rsvpIndex].note = note;
    } else {
      meeting.rsvps.push({
        userId: user._id,
        status,
        respondedAt: new Date(),
        note: note || "",
      });
    }
    await meeting.save();
    return Response.json({
      success: true,
      data: {
        rsvp: meeting.rsvps[
          rsvpIndex >= 0 ? rsvpIndex : meeting.rsvps.length - 1
        ],
      },
    });
  }

  // Update meeting details — creator or manager
  if (action === "update") {
    if (!isCreator && !isManager)
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
    if (agenda !== undefined) meeting.agenda = agenda;
    if (scheduledAt) meeting.scheduledAt = new Date(scheduledAt);
    if (durationMinutes) meeting.durationMinutes = durationMinutes;
    if (meetingLink !== undefined) meeting.meetingLink = meetingLink;
    if (platform !== undefined) meeting.platform = platform;
    if (passcode !== undefined) meeting.passcode = passcode;
    if (location) meeting.location = { ...meeting.location, ...location };
    if (notes !== undefined) meeting.notes = notes;
    if (typeof isCompleted === "boolean") meeting.isCompleted = isCompleted;

    await meeting.save();

    // Notify if rescheduled
    if (scheduledAt) {
      const memberships = await Membership.find({
        houseId: meeting.houseId,
        isActive: true,
      })
        .populate("userId", "_id")
        .lean();
      await Promise.all(
        memberships
          .filter((m) => String(m.userId._id) !== String(user._id))
          .map((m) =>
            Notification.create({
              userId: m.userId._id,
              houseId: meeting.houseId,
              type: NOTIFICATION_TYPE.MEETING_SCHEDULED,
              title: `Meeting rescheduled: ${meeting.title}`,
              body: `New time: ${new Date(scheduledAt).toLocaleString()}`,
              meta: { meetingId: meeting._id },
            }).catch(() => {})
          )
      );
    }

    return Response.json({ success: true, data: meeting });
  }

  // Cancel — creator or manager
  if (action === "cancel") {
    if (!isCreator && !isManager)
      return Response.json(
        { success: false, error: "Not authorized" },
        { status: 403 }
      );

    meeting.cancelledAt = new Date();
    meeting.cancellationReason = body.reason?.trim() || "";
    await meeting.save();

    // Notify all members
    const memberships = await Membership.find({
      houseId: meeting.houseId,
      isActive: true,
    })
      .populate("userId", "_id")
      .lean();
    await Promise.all(
      memberships
        .filter((m) => String(m.userId._id) !== String(user._id))
        .map((m) =>
          Notification.create({
            userId: m.userId._id,
            houseId: meeting.houseId,
            type: NOTIFICATION_TYPE.ANNOUNCEMENT,
            title: `Meeting cancelled: ${meeting.title}`,
            body: body.reason?.trim() || "No reason provided.",
            meta: { meetingId: meeting._id },
          }).catch(() => {})
        )
    );

    return Response.json({ success: true, data: meeting });
  }

  return Response.json(
    { success: false, error: "Invalid action" },
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
  });
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
