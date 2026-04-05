import mongoose, { Schema } from "mongoose";

/**
 * GroceryItem
 *
 * Items on the shared household grocery list.
 * Any member can add, edit, or mark items as bought.
 * "Bought" items are soft-cleared (visible in history) after 24h.
 *
 * Categories help group items in the UI. The list is sorted by
 * category then by createdAt for a predictable, scannable order.
 */

export const GROCERY_CATEGORIES = {
  DAIRY: "dairy",
  VEGETABLES: "vegetables",
  FRUITS: "fruits",
  MEAT: "meat",
  GRAINS: "grains",
  BEVERAGES: "beverages",
  SNACKS: "snacks",
  CLEANING: "cleaning",
  TOILETRIES: "toiletries",
  OTHER: "other",
};

const GroceryItemSchema = new Schema(
  {
    houseId: {
      type: Schema.Types.ObjectId,
      ref: "House",
      required: true,
      index: true,
    },
    addedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ── Item details ──────────────────────────────────────────────────────────
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    quantity: {
      type: String, // freeform: "2", "500g", "1 pack"
      trim: true,
      default: "",
      maxlength: 50,
    },
    category: {
      type: String,
      enum: Object.values(GROCERY_CATEGORIES),
      default: GROCERY_CATEGORIES.OTHER,
    },
    note: {
      type: String,
      maxlength: 200,
      default: "",
    },

    // ── State ─────────────────────────────────────────────────────────────────
    isBought: { type: Boolean, default: false, index: true },
    boughtBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    boughtAt: { type: Date, default: null },

    // ── Recurring item ────────────────────────────────────────────────────────
    // If true, this item is auto-suggested every week
    isRecurring: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// ── Indexes ───────────────────────────────────────────────────────────────────
GroceryItemSchema.index({ houseId: 1, isBought: 1 });
GroceryItemSchema.index({ houseId: 1, category: 1 });

export default mongoose.models.GroceryItem ||
  mongoose.model("GroceryItem", GroceryItemSchema);
