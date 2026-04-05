import mongoose, { Schema } from "mongoose";
import { HOUSE_TYPE, PLAN } from "@/lib/constants";

/**
 * House
 *
 * The root entity. Every feature (ledger, vault, tasks, chat) hangs off a
 * House. A user can belong to multiple Houses via the Membership model.
 *
 * The manager field always points to the User who created or was promoted.
 * Only one manager per house at a time — manager can transfer ownership.
 */
const HouseSchema = new Schema(
  {
    // ── Basic info ────────────────────────────────────────────────────────────
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    address: {
      line1: { type: String, trim: true, default: "" },
      line2: { type: String, trim: true, default: "" },
      city: { type: String, trim: true, default: "" },
      country: { type: String, trim: true, default: "" },
      postcode: { type: String, trim: true, default: "" },
    },
    type: {
      type: String,
      enum: Object.values(HOUSE_TYPE),
      default: HOUSE_TYPE.FLAT,
    },
    avatarUrl: { type: String, default: null },

    // ── Ownership ─────────────────────────────────────────────────────────────
    // managerId is denormalized here for fast permission checks.
    // The authoritative source is Membership.role === 'manager'.
    managerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // ── Rent config (house-level defaults) ────────────────────────────────────
    // Each Membership can override these with its own rentAmount.
    rentDueDay: {
      type: Number,
      min: 1,
      max: 28, // 28 is safe for all months including Feb
      default: 1,
    },
    currency: {
      type: String,
      default: "BDT", // locale-appropriate default set on house creation
    },

    // ── Plan (mirrors the manager's plan at creation time) ────────────────────
    plan: {
      type: String,
      enum: Object.values(PLAN),
      default: PLAN.FREE,
    },

    // ── Limits (enforced by API, not DB) ─────────────────────────────────────
    // Free: maxMembers = 6, maxVaultItems = 5, maxThreads = 1
    // Pro: unlimited

    // ── House rules (plain text, visible to all members) ─────────────────────
    rules: {
      type: String,
      maxlength: 2000,
      default: "",
    },

    // ── Soft delete ───────────────────────────────────────────────────────────
    deletedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ── Indexes ───────────────────────────────────────────────────────────────────
HouseSchema.index({ managerId: 1 });
HouseSchema.index({ deletedAt: 1 });
HouseSchema.index({ createdAt: -1 });

export default mongoose.models.House || mongoose.model("House", HouseSchema);
