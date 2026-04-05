import mongoose, { Schema } from "mongoose";
import { PLAN } from "@/lib/constants";

/**
 * User
 *
 * Synced from Clerk via webhook (user.created / user.updated / user.deleted).
 * We never store passwords — Clerk owns all authentication.
 * clerkId is the primary link between Clerk sessions and our DB records.
 */
const UserSchema = new Schema(
  {
    // ── Identity (from Clerk) ────────────────────────────────────────────────
    clerkId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
      default: null, // optional — Clerk supports phone-only auth
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    avatarUrl: {
      type: String,
      default: null,
    },

    // ── Subscription ─────────────────────────────────────────────────────────
    plan: {
      type: String,
      enum: Object.values(PLAN),
      default: PLAN.FREE,
    },
    planExpiresAt: {
      type: Date,
      default: null,
    },
    stripeCustomerId: {
      type: String,
      default: null,
    },

    // ── Preferences ──────────────────────────────────────────────────────────
    preferences: {
      language: { type: String, default: "en" },
      timezone: { type: String, default: "UTC" },
      currency: { type: String, default: "USD" },
      notificationsEnabled: { type: Boolean, default: true },
      quietHoursStart: { type: String, default: "22:00" }, // "HH:MM" local time
      quietHoursEnd: { type: String, default: "08:00" },
    },

    // ── Soft delete ───────────────────────────────────────────────────────────
    deletedAt: { type: Date, default: null },
  },
  {
    timestamps: true, // createdAt, updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ── Indexes ───────────────────────────────────────────────────────────────────
UserSchema.index({ email: 1 });
UserSchema.index({ phone: 1 }, { sparse: true }); // sparse: phone is optional
UserSchema.index({ deletedAt: 1 });

// ── Virtuals ──────────────────────────────────────────────────────────────────
UserSchema.virtual("isActive").get(function () {
  return this.deletedAt === null;
});

UserSchema.virtual("isPro").get(function () {
  if (this.plan === "free") return false;
  if (!this.planExpiresAt) return true; // lifetime
  return this.planExpiresAt > new Date();
});

// ── Methods ───────────────────────────────────────────────────────────────────
// Strip sensitive fields before sending to client
UserSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.stripeCustomerId;
  delete obj.__v;
  return obj;
};

export default mongoose.models.User || mongoose.model("User", UserSchema);
