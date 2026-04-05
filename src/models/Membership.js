import mongoose, { Schema } from "mongoose";
import { ROLES, PAYMENT_METHOD } from "@/lib/constants";

/**
 * Membership
 *
 * The link between a User and a House. This is NOT just a join table —
 * it carries per-member configuration (rent amount, room, move-in date)
 * and is the privacy boundary for all financial data.
 *
 * Privacy rule: LedgerEntries, BillSplits, and private VaultItems are
 * all scoped to a membershipId, never a userId directly. This means:
 *   - A manager sees all memberships in their house
 *   - A member sees ONLY their own membership's financial details
 *   - No member can see another member's rent amount (unless manager)
 *
 * One user can have multiple memberships (different houses).
 * One house can have multiple memberships (multiple residents).
 * Compound unique index (userId, houseId) prevents duplicate memberships.
 */
const MembershipSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    houseId: {
      type: Schema.Types.ObjectId,
      ref: "House",
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.MEMBER,
    },

    // ── Room / unit ───────────────────────────────────────────────────────────
    roomLabel: {
      type: String,
      trim: true,
      default: "", // e.g. "Room 2", "Master Bedroom", "Basement"
      maxlength: 50,
    },

    // ── Rent config ───────────────────────────────────────────────────────────
    // Stored in smallest currency unit (paisa / pence / cents) as integer.
    // This avoids all floating-point rounding issues in financial math.
    rentAmount: {
      type: Number,
      min: 0,
      default: 0, // 0 means "not set yet"
    },
    preferredPaymentMethod: {
      type: String,
      enum: Object.values(PAYMENT_METHOD),
      default: PAYMENT_METHOD.CASH,
    },

    // ── Timeline ──────────────────────────────────────────────────────────────
    moveInDate: { type: Date, default: null },
    moveOutDate: { type: Date, default: null },

    // ── Invite tracking ───────────────────────────────────────────────────────
    // joinedAt differs from createdAt (invite accepted vs. membership created)
    joinedAt: { type: Date, default: null },

    // ── Status ────────────────────────────────────────────────────────────────
    // active = currently living there
    // inactive = moved out (kept for ledger history)
    isActive: { type: Boolean, default: true, index: true },

    // ── Notification preferences (per house) ──────────────────────────────────
    mutedThreads: [{ type: Schema.Types.ObjectId, ref: "Thread" }],
    mutedNotificationTypes: [{ type: String }],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ── Indexes ───────────────────────────────────────────────────────────────────
// Compound unique: one membership per user per house
MembershipSchema.index({ userId: 1, houseId: 1 }, { unique: true });
MembershipSchema.index({ houseId: 1, isActive: 1 });
MembershipSchema.index({ houseId: 1, role: 1 });

// ── Virtuals ──────────────────────────────────────────────────────────────────
MembershipSchema.virtual("isManager").get(function () {
  return this.role === ROLES.MANAGER;
});

MembershipSchema.virtual("hasMovedOut").get(function () {
  return this.moveOutDate !== null && this.moveOutDate <= new Date();
});

// ── Static helpers ────────────────────────────────────────────────────────────
/**
 * Check if a userId is the manager of a houseId.
 * Used in API route middleware for permission checks.
 */
MembershipSchema.statics.isManager = async function (userId, houseId) {
  const m = await this.findOne({
    userId,
    houseId,
    role: ROLES.MANAGER,
    isActive: true,
  });
  return m !== null;
};

/**
 * Check if a userId is any active member of a houseId.
 */
MembershipSchema.statics.isMember = async function (userId, houseId) {
  const m = await this.findOne({ userId, houseId, isActive: true });
  return m !== null;
};

export default mongoose.models.Membership ||
  mongoose.model("Membership", MembershipSchema);
