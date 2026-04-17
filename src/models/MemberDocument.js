import mongoose, { Schema } from "mongoose";

/**
 * MemberDocument
 *
 * Stores identity/tenancy documents uploaded by a member for a specific house.
 * Scoped to membership — manager access removed when membership is inactive.
 *
 * Privacy:
 *   - Only the owner (member) and active house manager can read documents
 *   - Manager access is revoked when membership.isActive = false
 */

export const DOC_TYPE = {
  ID: "id",
  PASSPORT: "passport",
  LEASE: "lease",
  PROOF_OF_ADDRESS: "proof_of_address",
  OTHER: "other",
};

const MemberDocumentSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    membershipId: {
      type: Schema.Types.ObjectId,
      ref: "Membership",
      required: true,
      index: true,
    },
    houseId: {
      type: Schema.Types.ObjectId,
      ref: "House",
      required: true,
      index: true,
    },

    docType: {
      type: String,
      enum: Object.values(DOC_TYPE),
      default: DOC_TYPE.ID,
    },
    label: {
      type: String,
      trim: true,
      maxlength: 100,
      default: "",
    },

    // File stored in Cloudinary/Uploadthing — URL only
    fileUrl: { type: String, required: true },
    fileName: { type: String, default: null },
    mimeType: { type: String, default: null },

    // Verification
    verified: { type: Boolean, default: false },
    verifiedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    verifiedAt: { type: Date, default: null },

    // Soft delete
    deletedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

MemberDocumentSchema.index({ membershipId: 1, deletedAt: 1 });
MemberDocumentSchema.index({ houseId: 1, verified: 1 });

export default mongoose.models.MemberDocument ||
  mongoose.model("MemberDocument", MemberDocumentSchema);
