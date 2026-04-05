import mongoose, { Schema } from "mongoose";
import { VAULT_TYPE, VAULT_VISIBILITY } from "@/lib/constants";
import crypto from "crypto";

/**
 * VaultItem
 *
 * Stores sensitive household information (WiFi passwords, door codes,
 * lease documents, emergency contacts).
 *
 * ENCRYPTION:
 *   Sensitive fields (password, code, value) are AES-256-GCM encrypted
 *   at rest using a server-side key from process.env.VAULT_ENCRYPTION_KEY.
 *   The IV (initialization vector) is stored alongside the ciphertext.
 *   This is server-side encryption — the DB never sees plaintext values.
 *
 * PRIVACY:
 *   visibility = 'all'           → any active member can read
 *   visibility = 'manager_only'  → only the house manager can read
 *   The API enforces this — never expose manager_only items to members.
 */

// ── Encryption helpers ────────────────────────────────────────────────────────
const ALGORITHM = "aes-256-gcm";

function getKey() {
  const key = process.env.VAULT_ENCRYPTION_KEY;
  if (!key || key.length !== 64) {
    throw new Error(
      "VAULT_ENCRYPTION_KEY must be a 64-char hex string (32 bytes)"
    );
  }
  return Buffer.from(key, "hex");
}

export function encryptField(plaintext) {
  if (!plaintext) return { ciphertext: "", iv: "", tag: "" };
  const key = getKey();
  const iv = crypto.randomBytes(12); // 96-bit IV for GCM
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([
    cipher.update(String(plaintext), "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return {
    ciphertext: encrypted.toString("hex"),
    iv: iv.toString("hex"),
    tag: tag.toString("hex"),
  };
}

export function decryptField({ ciphertext, iv, tag }) {
  if (!ciphertext) return "";
  const key = getKey();
  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    key,
    Buffer.from(iv, "hex")
  );
  decipher.setAuthTag(Buffer.from(tag, "hex"));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(ciphertext, "hex")),
    decipher.final(),
  ]);
  return decrypted.toString("utf8");
}

// ── Sub-schema for an encrypted field ────────────────────────────────────────
const EncryptedFieldSchema = new Schema(
  {
    ciphertext: { type: String, default: "" },
    iv: { type: String, default: "" },
    tag: { type: String, default: "" },
  },
  { _id: false }
);

// ── Main schema ───────────────────────────────────────────────────────────────
const VaultItemSchema = new Schema(
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

    // ── What kind of vault item ────────────────────────────────────────────────
    type: {
      type: String,
      enum: Object.values(VAULT_TYPE),
      required: true,
    },

    // ── Public (unencrypted) label ────────────────────────────────────────────
    label: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
      // e.g. "Home WiFi", "Front door code", "Landlord contact"
    },

    // ── Encrypted payload ─────────────────────────────────────────────────────
    // The meaning depends on type:
    //   wifi      → { primaryValue: SSID, secondaryValue: password }
    //   door_code → { primaryValue: code }
    //   contact   → { primaryValue: phone/email, secondaryValue: notes }
    //   lease     → { fileUrl: URL of uploaded PDF }
    //   document  → { fileUrl: URL, notes }
    primaryValue: { type: EncryptedFieldSchema, default: () => ({}) },
    secondaryValue: { type: EncryptedFieldSchema, default: () => ({}) },
    notes: { type: EncryptedFieldSchema, default: () => ({}) },

    // ── File attachment (for lease, appliance manuals) ─────────────────────────
    // URL from Cloudinary/Uploadthing — the file itself is in cloud storage
    fileUrl: { type: String, default: null },
    fileName: { type: String, default: null },

    // ── Access control ────────────────────────────────────────────────────────
    visibility: {
      type: String,
      enum: Object.values(VAULT_VISIBILITY),
      default: VAULT_VISIBILITY.ALL,
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
VaultItemSchema.index({ houseId: 1, visibility: 1 });
VaultItemSchema.index({ houseId: 1, type: 1 });
VaultItemSchema.index({ houseId: 1, deletedAt: 1 });

// ── Instance method: decrypt and return a clean object ────────────────────────
// Call this ONLY after verifying the requesting user has permission to see it.
VaultItemSchema.methods.toDecrypted = function () {
  const obj = this.toObject();
  try {
    obj.primaryValue = decryptField(this.primaryValue);
    obj.secondaryValue = decryptField(this.secondaryValue);
    obj.notes = decryptField(this.notes);
  } catch {
    // Decryption failure — return without sensitive fields
    obj.primaryValue = "[decryption error]";
    obj.secondaryValue = "[decryption error]";
    obj.notes = "[decryption error]";
  }
  return obj;
};

// ── Instance method: encrypt fields before create/update ──────────────────────
VaultItemSchema.methods.encryptFields = function ({
  primaryValue,
  secondaryValue,
  notes,
} = {}) {
  if (primaryValue !== undefined)
    this.primaryValue = encryptField(primaryValue);
  if (secondaryValue !== undefined)
    this.secondaryValue = encryptField(secondaryValue);
  if (notes !== undefined) this.notes = encryptField(notes);
};

export default mongoose.models.VaultItem ||
  mongoose.model("VaultItem", VaultItemSchema);
