import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/db/mongoose";
import User from "@/models/User";
import Membership from "@/models/Membership";
import Task from "@/models/Task";
import {
  ROLES,
  TASK_STATUS,
  TASK_PRIORITY,
  TASK_CATEGORY,
} from "@/lib/constants";

// PATCH /api/tasks/[taskId]
export async function PATCH(req, { params }) {
  const { userId: clerkId } = await auth();
  if (!clerkId)
    return Response.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );

  await connectDB();
  const { taskId } = await params;

  const user = await User.findOne({ clerkId, deletedAt: null });
  if (!user)
    return Response.json(
      { success: false, error: "User not found" },
      { status: 404 }
    );

  const task = await Task.findOne({ _id: taskId, deletedAt: null });
  if (!task)
    return Response.json(
      { success: false, error: "Task not found" },
      { status: 404 }
    );

  const membership = await Membership.findOne({
    userId: user._id,
    houseId: task.houseId,
    isActive: true,
  });
  if (!membership)
    return Response.json(
      { success: false, error: "Not a member" },
      { status: 403 }
    );

  const isManager = membership.role === ROLES.MANAGER;
  const body = await req.json();

  // Complete / reopen — any member can do this
  if (body.status === TASK_STATUS.DONE && task.status !== TASK_STATUS.DONE) {
    task.status = TASK_STATUS.DONE;
    task.completedAt = new Date();
    task.completedBy = user._id;
  } else if (body.status === TASK_STATUS.TODO) {
    task.status = TASK_STATUS.TODO;
    task.completedAt = null;
    task.completedBy = null;
  } else if (body.status === TASK_STATUS.IN_PROGRESS) {
    task.status = TASK_STATUS.IN_PROGRESS;
  }

  // Edit fields — creator or manager
  if (isManager || String(task.createdBy) === String(user._id)) {
    if (body.title) task.title = body.title.trim();
    if (body.description !== undefined) task.description = body.description;
    if (body.priority && Object.values(TASK_PRIORITY).includes(body.priority))
      task.priority = body.priority;
    if (body.category && Object.values(TASK_CATEGORY).includes(body.category))
      task.category = body.category;
    if (body.dueDate !== undefined)
      task.dueDate = body.dueDate ? new Date(body.dueDate) : null;
    if (body.assignedTo !== undefined)
      task.assignedTo = body.assignedTo || null;
  }

  await task.save();
  return Response.json({ success: true, data: task });
}

// DELETE /api/tasks/[taskId]
export async function DELETE(req, { params }) {
  const { userId: clerkId } = await auth();
  if (!clerkId)
    return Response.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );

  await connectDB();
  const { taskId } = await params;

  const user = await User.findOne({ clerkId, deletedAt: null });
  if (!user)
    return Response.json(
      { success: false, error: "User not found" },
      { status: 404 }
    );

  const task = await Task.findOne({ _id: taskId, deletedAt: null });
  if (!task)
    return Response.json(
      { success: false, error: "Task not found" },
      { status: 404 }
    );

  const membership = await Membership.findOne({
    userId: user._id,
    houseId: task.houseId,
    isActive: true,
  });
  if (!membership)
    return Response.json(
      { success: false, error: "Not a member" },
      { status: 403 }
    );

  const isManager = membership.role === ROLES.MANAGER;
  if (!isManager && String(task.createdBy) !== String(user._id)) {
    return Response.json(
      { success: false, error: "Not authorized" },
      { status: 403 }
    );
  }

  await Task.findByIdAndUpdate(taskId, { $set: { deletedAt: new Date() } });
  return Response.json({ success: true });
}
