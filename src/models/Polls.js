import mongoose, { Schema } from "mongoose";

/**
 * Poll
 *
 * Quick polls created inside a thread. "Should we get a new AC?" style.
 * Each member gets one vote. Results visible to all after voting (or after deadline).
 */
const PollSchema = new Schema(
  {
    houseId: {
      type: Schema.Types.ObjectId,
      ref: "House",
      required: true,
      index: true,
    },
    threadId: {
      type: Schema.Types.ObjectId,
      ref: "Thread",
      default: null, // null = house-level poll, not tied to a thread
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    question: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300,
    },

    // ── Options ───────────────────────────────────────────────────────────────
    options: [
      {
        _id: false,
        id: { type: String, required: true }, // short unique id, e.g. "opt_1"
        label: { type: String, required: true, maxlength: 100 },
      },
    ],

    // ── Votes ─────────────────────────────────────────────────────────────────
    // Each vote: { userId, optionId, votedAt }
    // userId is unique within votes — enforced at application layer
    votes: [
      {
        _id: false,
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        optionId: { type: String, required: true },
        votedAt: { type: Date, default: Date.now },
      },
    ],

    // ── Settings ──────────────────────────────────────────────────────────────
    allowMultiple: { type: Boolean, default: false }, // can members vote for >1 option?
    isAnonymous: { type: Boolean, default: false }, // hide who voted for what
    deadline: { type: Date, default: null }, // auto-close after this date
    isClosed: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

PollSchema.index({ houseId: 1, createdAt: -1 });
PollSchema.index({ houseId: 1, isClosed: 1 });

PollSchema.virtual("totalVotes").get(function () {
  return this.votes.length;
});

PollSchema.virtual("isExpired").get(function () {
  return this.deadline !== null && this.deadline < new Date();
});

// ── Method: tally results ─────────────────────────────────────────────────────
PollSchema.methods.getResults = function () {
  const tally = {};
  this.options.forEach((opt) => {
    tally[opt.id] = 0;
  });
  this.votes.forEach((v) => {
    if (tally[v.optionId] !== undefined) tally[v.optionId]++;
  });
  return this.options.map((opt) => ({
    id: opt.id,
    label: opt.label,
    count: tally[opt.id],
    pct: this.votes.length
      ? Math.round((tally[opt.id] / this.votes.length) * 100)
      : 0,
  }));
};

export default mongoose.models.Poll || mongoose.model("Poll", PollSchema);
