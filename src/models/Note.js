import mongoose from "mongoose";

const NoteSchema = new mongoose.Schema(
  {
    houseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "House",
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: { type: String, maxlength: 150 },
    body: { type: String, required: true, maxlength: 2000 },
    isPrivate: { type: Boolean, default: true },
    isPinned: { type: Boolean, default: false },
    category: {
      type: String,
      enum: [
        "general",
        "maintenance",
        "finance",
        "reminder",
        "tenant",
        "other",
      ],
      default: "general",
    },
    notifyMembers: { type: Boolean, default: false },
  },
  { timestamps: true }
);

NoteSchema.index({ houseId: 1, isPrivate: 1, isPinned: -1, createdAt: -1 });

export default mongoose.models.Note || mongoose.model("Note", NoteSchema);
