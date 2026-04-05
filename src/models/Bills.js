import mongoose, { Schema } from "mongoose";
import { BILL_TYPE, BILL_SPLIT_TYPE, PAYMENT_STATUS } from "@/lib/constants";

/**
 * Bill
 *
 * A shared household bill (electricity, water, internet, etc.).
 * After creation the manager runs the split which creates BillSplit
 * records and corresponding LedgerEntry records for each member.
 *
 * The bill photo URL (receipt image) is stored in Cloudinary/Uploadthing.
 * Only the URL is stored here — the actual file lives in cloud storage.
 */
const BillSchema = new Schema(
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

    // ── Bill info ─────────────────────────────────────────────────────────────
    type: {
      type: String,
      enum: Object.values(BILL_TYPE),
      required: true,
    },
    label: {
      type: String,
      trim: true,
      maxlength: 200,
      default: "", // e.g. "Electricity — March 2025"
    },

    // Total amount due (integer, smallest currency unit)
    totalAmount: {
      type: Number,
      required: true,
      min: 1,
    },

    // ── Period & dates ────────────────────────────────────────────────────────
    periodStart: { type: Date, required: true },
    periodEnd: { type: Date, required: true },
    dueDate: { type: Date, required: true },

    // ── Split configuration ───────────────────────────────────────────────────
    splitType: {
      type: String,
      enum: Object.values(BILL_SPLIT_TYPE),
      default: BILL_SPLIT_TYPE.EQUAL,
    },

    // ── Electricity meter readings (optional) ─────────────────────────────────
    meterReadingStart: { type: Number, default: null },
    meterReadingEnd: { type: Number, default: null },
    unitsConsumed: {
      type: Number,
      default: null,
      // auto-computed: meterReadingEnd - meterReadingStart
    },

    // ── Receipt photo URL ─────────────────────────────────────────────────────
    receiptUrl: { type: String, default: null },

    // ── Status ────────────────────────────────────────────────────────────────
    isSplit: { type: Boolean, default: false }, // has the bill been split yet?

    note: { type: String, maxlength: 500, default: "" },
  },
  { timestamps: true }
);

// ── Indexes ───────────────────────────────────────────────────────────────────
BillSchema.index({ houseId: 1, periodStart: -1 });
BillSchema.index({ houseId: 1, type: 1 });
BillSchema.index({ dueDate: 1, isSplit: 1 });

// ── Pre-save: compute unitsConsumed from meter readings ───────────────────────
BillSchema.pre("save", function (next) {
  if (this.meterReadingStart !== null && this.meterReadingEnd !== null) {
    this.unitsConsumed = this.meterReadingEnd - this.meterReadingStart;
  }
  next();
});

export const Bill = mongoose.models.Bill || mongoose.model("Bill", BillSchema);

// ─────────────────────────────────────────────────────────────────────────────
/**
 * BillSplit
 *
 * One record per member per bill. Created in bulk when the manager splits
 * a bill. Each BillSplit also triggers creation of a LedgerEntry.
 *
 * Privacy: same rules as LedgerEntry — members see only their own splits.
 */
const BillSplitSchema = new Schema(
  {
    billId: {
      type: Schema.Types.ObjectId,
      ref: "Bill",
      required: true,
      index: true,
    },
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

    // Share of the total bill (integer, smallest currency unit)
    shareAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    // Linked ledger entry — created at split time
    ledgerEntryId: {
      type: Schema.Types.ObjectId,
      ref: "LedgerEntry",
      default: null,
    },

    status: {
      type: String,
      enum: Object.values(PAYMENT_STATUS),
      default: PAYMENT_STATUS.PENDING,
    },
  },
  { timestamps: true }
);

BillSplitSchema.index({ billId: 1, membershipId: 1 }, { unique: true });
BillSplitSchema.index({ membershipId: 1, status: 1 });

export const BillSplit =
  mongoose.models.BillSplit || mongoose.model("BillSplit", BillSplitSchema);
