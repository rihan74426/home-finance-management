import mongoose, { Schema } from "mongoose";
import { PAYMENT_STATUS, PAYMENT_METHOD, LEDGER_TYPE } from "@/lib/constants";

/**
 * LedgerEntry
 *
 * Every rent payment, partial payment, and bill contribution is a
 * LedgerEntry. These are immutable records — never edited, only appended.
 *
 * Privacy:
 *   - membershipId scopes the entry to a specific member of a specific house
 *   - Members can see ONLY their own entries (filtered by membershipId)
 *   - Managers see ALL entries for their house (filtered by houseId)
 *   - managerNote is NEVER returned to the member who the entry belongs to
 *
 * Monetary amounts are stored as integers in smallest currency unit:
 *   BDT 1500.50 → store as 150050 (paisa)
 *   USD 12.99   → store as 1299 (cents)
 *   GBP 8.00    → store as 800 (pence)
 */
const LedgerEntrySchema = new Schema(
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
      index: true,
    },

    // ── What this entry is for ────────────────────────────────────────────────
    type: {
      type: String,
      enum: Object.values(LEDGER_TYPE),
      default: LEDGER_TYPE.RENT,
    },
    label: {
      type: String,
      trim: true,
      maxlength: 200,
      default: "Rent", // e.g. "Rent — April 2025", "Electricity split"
    },

    // ── Amounts (integer, smallest currency unit) ─────────────────────────────
    amountDue: {
      type: Number,
      required: true,
      min: 0,
    },
    amountPaid: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    // ── Payment details ───────────────────────────────────────────────────────
    status: {
      type: String,
      enum: Object.values(PAYMENT_STATUS),
      default: PAYMENT_STATUS.PENDING,
      index: true,
    },
    paymentMethod: {
      type: String,
      enum: Object.values(PAYMENT_METHOD),
      default: null,
    },
    paidAt: { type: Date, default: null },

    // ── Billing period this entry covers ─────────────────────────────────────
    periodStart: { type: Date, required: true },
    periodEnd: { type: Date, required: true },
    dueDate: { type: Date, required: true },

    // ── Notes ─────────────────────────────────────────────────────────────────
    // memberNote: visible to both manager and the member
    memberNote: {
      type: String,
      maxlength: 500,
      default: "",
    },
    // managerNote: ONLY visible to the manager — never sent to the member
    // This is where "said he'll pay the rest by 15th" lives
    managerNote: {
      type: String,
      maxlength: 500,
      default: "",
    },

    // ── Who logged this payment ───────────────────────────────────────────────
    loggedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ── Bill link (optional — if this entry is a bill split) ──────────────────
    billId: {
      type: Schema.Types.ObjectId,
      ref: "Bill",
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ── Indexes ───────────────────────────────────────────────────────────────────
LedgerEntrySchema.index({ houseId: 1, periodStart: -1 });
LedgerEntrySchema.index({ membershipId: 1, periodStart: -1 });
LedgerEntrySchema.index({ houseId: 1, status: 1 });
LedgerEntrySchema.index({ dueDate: 1, status: 1 }); // for reminder jobs

// ── Virtuals ──────────────────────────────────────────────────────────────────
LedgerEntrySchema.virtual("amountOutstanding").get(function () {
  return Math.max(0, this.amountDue - this.amountPaid);
});

LedgerEntrySchema.virtual("isOverdue").get(function () {
  return this.status === PAYMENT_STATUS.PENDING && this.dueDate < new Date();
});

// ── Pre-save: auto-compute status from amounts ────────────────────────────────
LedgerEntrySchema.pre("save", function (next) {
  if (this.amountPaid >= this.amountDue) {
    this.status = PAYMENT_STATUS.PAID;
    if (!this.paidAt) this.paidAt = new Date();
  } else if (this.amountPaid > 0) {
    this.status = PAYMENT_STATUS.PARTIAL;
  } else if (this.dueDate < new Date()) {
    this.status = PAYMENT_STATUS.OVERDUE;
  } else {
    this.status = PAYMENT_STATUS.PENDING;
  }
  next();
});

// ── Static: strip manager-only fields before sending to a member ──────────────
LedgerEntrySchema.statics.forMember = function (doc) {
  const obj = doc.toObject ? doc.toObject() : { ...doc };
  delete obj.managerNote;
  return obj;
};

export default mongoose.models.LedgerEntry ||
  mongoose.model("LedgerEntry", LedgerEntrySchema);
