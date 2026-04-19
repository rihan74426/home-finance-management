import mongoose, { Schema } from "mongoose";

/**
 * Meeting
 *
 * Scheduled house meetings — online or offline.
 * Online: Zoom or Google Meet link provided or auto-generated.
 * Offline: date, time, and physical location required.
 *
 * All members are notified on creation.
 * RSVP: attending / not_attending / maybe / no_response
 */

export const MEETING_TYPE = {
  ONLINE: "online",
  OFFLINE: "offline",
};

export const MEETING_PLATFORM = {
  ZOOM: "zoom",
  GOOGLE_MEET: "google_meet",
  TEAMS: "teams",
  OTHER_ONLINE: "other_online",
};

export const RSVP_STATUS = {
  ATTENDING: "attending",
  NOT_ATTENDING: "not_attending",
  MAYBE: "maybe",
  NO_RESPONSE: "no_response",
};

const RSVPSchema = new Schema({
  _id: false,
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  status: {
    type: String,
    enum: Object.values(RSVP_STATUS),
    default: RSVP_STATUS.NO_RESPONSE,
  },
  respondedAt: { type: Date, default: null },
  note: { type: String, maxlength: 200, default: "" },
});

const MeetingSchema = new Schema(
  {
    houseId: {
      type: Schema.Types.ObjectId,
      ref: "House",
      required: true,
      index: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },
    agenda: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: "",
    },

    type: {
      type: String,
      enum: Object.values(MEETING_TYPE),
      required: true,
    },

    // Scheduling
    scheduledAt: { type: Date, required: true },
    durationMinutes: { type: Number, default: 60, min: 5, max: 480 },

    // Online meeting
    platform: {
      type: String,
      enum: [...Object.values(MEETING_PLATFORM), null],
      default: null,
    },
    meetingLink: { type: String, trim: true, default: null },
    meetingId: { type: String, trim: true, default: null }, // Zoom meeting ID etc.
    passcode: { type: String, trim: true, default: null },

    // Offline meeting
    location: {
      name: { type: String, trim: true, default: "" }, // "Living room", "Café name"
      address: { type: String, trim: true, default: "" },
      mapLink: { type: String, trim: true, default: "" }, // Google Maps URL
    },

    // RSVPs — pre-populated with all active members on creation
    rsvps: [RSVPSchema],

    // Post-meeting
    notes: { type: String, maxlength: 3000, default: "" }, // Meeting minutes
    isCompleted: { type: Boolean, default: false },
    cancelledAt: { type: Date, default: null },
    cancellationReason: { type: String, maxlength: 300, default: "" },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

MeetingSchema.index({ houseId: 1, scheduledAt: -1 });
MeetingSchema.index({ houseId: 1, isCompleted: 1 });

MeetingSchema.virtual("isPast").get(function () {
  return this.scheduledAt < new Date();
});

MeetingSchema.virtual("isCancelled").get(function () {
  return this.cancelledAt !== null;
});

export default mongoose.models.Meeting ||
  mongoose.model("Meeting", MeetingSchema);
