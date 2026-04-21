import mongoose, { Schema } from "mongoose";

/**
 * MoveOutChecklist
 *
 * When a member initiates move-out, a checklist is created.
 * Default items are auto-populated. Member checks items off.
 * Manager reviews and approves — only then is the membership deactivated.
 *
 * The membership remains active (isActive=true) until the manager approves.
 * This preserves ledger history and prevents accidental removal.
 */

export const CHECKLIST_ITEM_STATUS = {
  PENDING: "pending",
  DONE: "done",
  WAIVED: "waived", // Manager can waive an item
};

export const MOVEOUT_STATUS = {
  DRAFT: "draft", // Member hasn't submitted yet
  PENDING_REVIEW: "pending_review", // Member submitted, awaiting manager
  APPROVED: "approved", // Manager approved — membership will be deactivated
  REJECTED: "rejected", // Manager sent back with notes
};

const ChecklistItemSchema = new Schema(
  {
    label: { type: String, required: true, trim: true, maxlength: 200 },
    status: {
      type: String,
      enum: Object.values(CHECKLIST_ITEM_STATUS),
      default: CHECKLIST_ITEM_STATUS.PENDING,
    },
    completedAt: { type: Date, default: null },
    note: { type: String, maxlength: 300, default: "" },
    isRequired: { type: Boolean, default: true },
  },
  { _id: true }
);

const MoveOutChecklistSchema = new Schema(
  {
    houseId: {
      type: Schema.Types.ObjectId,
      ref: "House",
      required: true,
      index: true,
    },
    membershipId: {
      type: Schema.Types.ObjectId,
      ref: "Membership",
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    status: {
      type: String,
      enum: Object.values(MOVEOUT_STATUS),
      default: MOVEOUT_STATUS.DRAFT,
      index: true,
    },

    // Target move-out date
    moveOutDate: { type: Date, required: true },

    items: [ChecklistItemSchema],

    // Member notes on submission
    memberNote: { type: String, maxlength: 500, default: "" },

    // Manager decision
    reviewedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    reviewedAt: { type: Date, default: null },
    managerNote: { type: String, maxlength: 500, default: "" },

    submittedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

MoveOutChecklistSchema.index({ membershipId: 1 }, { unique: true });

export default mongoose.models.MoveOutChecklist ||
  mongoose.model("MoveOutChecklist", MoveOutChecklistSchema);

// Default checklist items every house gets
export const DEFAULT_CHECKLIST_ITEMS = [
  { label: "Return all keys and access cards", isRequired: true },
  { label: "Clear all personal belongings from room", isRequired: true },
  { label: "Clean room to move-in condition", isRequired: true },
  { label: "Clean shared areas used", isRequired: true },
  { label: "Settle all outstanding rent payments", isRequired: true },
  { label: "Settle all outstanding bill splits", isRequired: true },
  { label: "Return any shared items borrowed", isRequired: true },
  { label: "Provide forwarding address", isRequired: false },
  { label: "Final meter reading recorded", isRequired: false },
  { label: "Hand over parking space / storage", isRequired: false },
];
