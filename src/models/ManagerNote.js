import mongoose, { Schema } from "mongoose";

/**
 * ManagerNote
 *
 * Personal and public notes the manager writes on their dashboard.
 * Private notes are only visible to the manager.
 * Public notes are visible to all members (like announcements but less formal).
 *
 * Notes are pinnable and categorized.
 */

const ManagerNoteSchema = new Schema(
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
      trim: true,
      maxlength: 150,
      default: "",
    },
    body: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    isPrivate: { type: Boolean, default: true },
    isPinned: { type: Boolean, default: false },
    category: {
      type: String,
      enum: [
        "general",
        "maintenance",
        "finance",
        "reminder",
        "tenant",
        "other",
      ],
      default: "general",
    },
    // For public notes — notify members on create?
    notifyMembers: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

ManagerNoteSchema.index({ houseId: 1, isPrivate: 1, deletedAt: 1 });
ManagerNoteSchema.index({ houseId: 1, isPinned: 1 });

export default mongoose.models.ManagerNote ||
  mongoose.model("ManagerNote", ManagerNoteSchema);
