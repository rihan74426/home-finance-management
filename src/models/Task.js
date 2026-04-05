import mongoose, { Schema } from "mongoose";
import {
  TASK_STATUS,
  TASK_PRIORITY,
  TASK_RECURRENCE,
  TASK_CATEGORY,
} from "@/lib/constants";

/**
 * Task
 *
 * Represents a chore, to-do, or recurring responsibility.
 * Tasks belong to a house. Assignment is optional (unassigned = anyone can pick up).
 *
 * Recurring tasks: when a task with recurrence !== 'none' is marked done,
 * a background job creates the next occurrence automatically.
 * The parentTaskId links a recurrence chain.
 */
const TaskSchema = new Schema(
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

    // ── Task details ──────────────────────────────────────────────────────────
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      maxlength: 1000,
      default: "",
    },
    category: {
      type: String,
      enum: Object.values(TASK_CATEGORY),
      default: TASK_CATEGORY.OTHER,
    },
    priority: {
      type: String,
      enum: Object.values(TASK_PRIORITY),
      default: TASK_PRIORITY.NORMAL,
    },

    // ── Assignment ────────────────────────────────────────────────────────────
    // null = unassigned (any member can pick it up)
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: "Membership",
      default: null,
      index: true,
    },

    // ── Dates ─────────────────────────────────────────────────────────────────
    dueDate: { type: Date, default: null, index: true },
    completedAt: { type: Date, default: null },
    completedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // ── Status ────────────────────────────────────────────────────────────────
    status: {
      type: String,
      enum: Object.values(TASK_STATUS),
      default: TASK_STATUS.TODO,
      index: true,
    },

    // ── Recurrence ────────────────────────────────────────────────────────────
    recurrence: {
      type: String,
      enum: Object.values(TASK_RECURRENCE),
      default: TASK_RECURRENCE.NONE,
    },
    // For recurring task chains — the first task in the chain
    parentTaskId: {
      type: Schema.Types.ObjectId,
      ref: "Task",
      default: null,
    },

    // ── Nudge tracking ────────────────────────────────────────────────────────
    // lastNudgedAt prevents spam — max one nudge per 24h per task
    lastNudgedAt: { type: Date, default: null },
    nudgeCount: { type: Number, default: 0 },

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
TaskSchema.index({ houseId: 1, status: 1 });
TaskSchema.index({ houseId: 1, dueDate: 1 });
TaskSchema.index({ assignedTo: 1, status: 1 });
TaskSchema.index({ houseId: 1, deletedAt: 1 });
// Compound for the dashboard query (active tasks in a house, sorted by due date)
TaskSchema.index({ houseId: 1, status: 1, dueDate: 1 });

// ── Virtuals ──────────────────────────────────────────────────────────────────
TaskSchema.virtual("isOverdue").get(function () {
  return (
    this.status !== TASK_STATUS.DONE &&
    this.dueDate !== null &&
    this.dueDate < new Date()
  );
});

TaskSchema.virtual("canNudge").get(function () {
  if (!this.lastNudgedAt) return true;
  const hoursSince =
    (Date.now() - this.lastNudgedAt.getTime()) / (1000 * 60 * 60);
  return hoursSince >= 24;
});

export default mongoose.models.Task || mongoose.model("Task", TaskSchema);
