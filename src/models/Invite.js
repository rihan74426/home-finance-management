import mongoose, { Schema } from "mongoose";
import { ROLES, INVITE_STATUS } from "@/lib/constants";
import crypto from "crypto";

/**
 * Invite
 *
 * Represents a pending invitation to join a house. The invite is created
 * by the manager and accepted (or declined) by the recipient.
 *
 * Invites expire after 7 days. The token is a secure random string
 * sent via email/SMS as a URL parameter.
 *
 * Flow:
 *   Manager creates invite → token generated → email/SMS sent
 *   → recipient clicks link → token validated → Membership created
 *   → invite status set to 'accepted'
 */
const InviteSchema = new Schema(
  {
    houseId: {
      type: Schema.Types.ObjectId,
      ref: "House",
      required: true,
      index: true,
    },
    invitedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ── Contact info of the invitee ───────────────────────────────────────────
    // Either email or phone must be provided (not both required).
    email: {
      type: String,
      lowercase: true,
      trim: true,
      default: null,
    },
    phone: {
      type: String,
      trim: true,
      default: null,
    },
    name: {
      type: String,
      trim: true,
      default: "", // optional hint for the invite message
    },

    // ── What role they'll get on acceptance ───────────────────────────────────
    role: {
      type: String,
      enum: [ROLES.MEMBER, ROLES.GUEST],
      default: ROLES.MEMBER,
    },

    // ── Secure token for the invite link ──────────────────────────────────────
    token: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },

    // ── Status lifecycle ──────────────────────────────────────────────────────
    status: {
      type: String,
      enum: Object.values(INVITE_STATUS),
      default: INVITE_STATUS.PENDING,
      index: true,
    },

    // Set when the invite is accepted — links back to the created membership
    acceptedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    acceptedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// ── Indexes ───────────────────────────────────────────────────────────────────
InviteSchema.index({ houseId: 1, status: 1 });
InviteSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index — MongoDB auto-deletes expired docs

// ── Static: generate a new secure invite token ────────────────────────────────
InviteSchema.statics.generateToken = function () {
  return crypto.randomBytes(32).toString("hex");
};

// ── Static: create an invite with auto-generated token and expiry ─────────────
InviteSchema.statics.createInvite = async function ({
  houseId,
  invitedBy,
  email,
  phone,
  name,
  role,
}) {
  const token = this.generateToken();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  return this.create({
    houseId,
    invitedBy,
    email,
    phone,
    name,
    role,
    token,
    expiresAt,
  });
};

export default mongoose.models.Invite || mongoose.model("Invite", InviteSchema);
