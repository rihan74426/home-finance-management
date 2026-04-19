import mongoose, { Schema } from "mongoose";

/**
 * HouseRule
 *
 * Individual house rules set by the manager. Each rule is a separate
 * document so members can reference the exact rule number when reporting
 * a violation. Not a freeform text block.
 *
 * RuleAlert: when a member reports a rule violation, it creates an alert
 * that notifies the manager and optionally all members.
 */

const HouseRuleSchema = new Schema(
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
    // Rule number shown in UI — auto-set to next available
    ruleNumber: { type: Number, required: true },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },
    category: {
      type: String,
      enum: [
        "quiet_hours",
        "cleanliness",
        "guests",
        "payments",
        "kitchen",
        "common_areas",
        "security",
        "other",
      ],
      default: "other",
    },
    isActive: { type: Boolean, default: true },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

HouseRuleSchema.index({ houseId: 1, ruleNumber: 1 }, { unique: true });
HouseRuleSchema.index({ houseId: 1, isActive: 1 });

export const HouseRule =
  mongoose.models.HouseRule || mongoose.model("HouseRule", HouseRuleSchema);

// ── RuleAlert ─────────────────────────────────────────────────────────────────

const RuleAlertSchema = new Schema(
  {
    houseId: {
      type: Schema.Types.ObjectId,
      ref: "House",
      required: true,
      index: true,
    },
    ruleId: {
      type: Schema.Types.ObjectId,
      ref: "HouseRule",
      required: true,
    },
    reportedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Who allegedly broke the rule (optional — can be anonymous/general)
    reportedAgainst: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    description: {
      type: String,
      maxlength: 500,
      default: "",
    },
    status: {
      type: String,
      enum: ["open", "acknowledged", "resolved", "dismissed"],
      default: "open",
      index: true,
    },
    resolvedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    resolvedAt: { type: Date, default: null },
    managerNote: { type: String, maxlength: 500, default: "" },
  },
  { timestamps: true }
);

RuleAlertSchema.index({ houseId: 1, status: 1 });

export const RuleAlert =
  mongoose.models.RuleAlert || mongoose.model("RuleAlert", RuleAlertSchema);
