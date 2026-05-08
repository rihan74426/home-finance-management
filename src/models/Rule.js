import mongoose from "mongoose";

const RuleSchema = new mongoose.Schema(
  {
    houseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "House",
      required: true,
    },
    ruleNumber: { type: Number, required: true },
    title: { type: String, required: true, maxlength: 120 },
    description: { type: String, maxlength: 500 },
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
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

RuleSchema.index({ houseId: 1, isActive: 1 });

const RuleAlertSchema = new mongoose.Schema(
  {
    ruleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Rule",
      required: true,
    },
    houseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "House",
      required: true,
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    description: { type: String, maxlength: 500 },
    status: {
      type: String,
      enum: ["open", "acknowledged", "resolved", "dismissed"],
      default: "open",
    },
    resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    resolvedAt: Date,
  },
  { timestamps: true }
);

RuleAlertSchema.index({ houseId: 1, status: 1 });

export const Rule = mongoose.models.Rule || mongoose.model("Rule", RuleSchema);
export const RuleAlert =
  mongoose.models.RuleAlert || mongoose.model("RuleAlert", RuleAlertSchema);
