import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/db/mongoose";
import User from "@/models/User";
import Membership from "@/models/Membership";
import Task from "@/models/Task";
import {
  TASK_STATUS,
  TASK_PRIORITY,
  TASK_CATEGORY,
  NOTIFICATION_TYPE,
} from "@/lib/constants";
import { createNotification } from "@/lib/notifications";

// PATCH /api/tasks/[taskId] — update status, reassign, edit fields
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

  let body;
  try {
    body = await req.json();
  } catch {
    return Response.json(
      { success: false, error: "Invalid JSON" },
      { status: 400 }
    );
  }

  const {
    status,
    title,
    description,
    category,
    priority,
    assignedTo,
    dueDate,
  } = body;

  if (status !== undefined) {
    if (!Object.values(TASK_STATUS).includes(status))
      return Response.json(
        { success: false, error: "Invalid status" },
        { status: 400 }
      );
    task.status = status;
    if (status === TASK_STATUS.DONE) {
      task.completedAt = new Date();
      task.completedBy = user._id;
    } else {
      task.completedAt = null;
      task.completedBy = null;
    }
  }

  if (title?.trim()) task.title = title.trim();
  if (description !== undefined) task.description = description;
  if (category && Object.values(TASK_CATEGORY).includes(category))
    task.category = category;
  if (priority && Object.values(TASK_PRIORITY).includes(priority))
    task.priority = priority;
  if (dueDate !== undefined) task.dueDate = dueDate ? new Date(dueDate) : null;

  // Handle reassignment
  if (assignedTo !== undefined) {
    if (assignedTo === null) {
      task.assignedTo = null;
    } else {
      const assignedMembership = await Membership.findOne({
        _id: assignedTo,
        houseId: task.houseId,
        isActive: true,
      }).populate("userId", "name");

      if (!assignedMembership)
        return Response.json(
          { success: false, error: "Invalid assignee" },
          { status: 400 }
        );

      // Notify if reassigned to someone else
      if (
        String(task.assignedTo) !== String(assignedTo) &&
        String(assignedMembership.userId._id) !== String(user._id)
      ) {
        await createNotification({
          userId: assignedMembership.userId._id,
          houseId: task.houseId,
          type: NOTIFICATION_TYPE.TASK_ASSIGNED,
          title: `Task assigned: ${task.title}`,
          body: `${user.name} assigned you a task.`,
          meta: { taskId: task._id },
        });
      }

      task.assignedTo = assignedTo;
    }
  }

  await task.save();

  await task.populate([
    {
      path: "assignedTo",
      populate: { path: "userId", select: "name avatarUrl" },
    },
    { path: "createdBy", select: "name" },
  ]);

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

  const isManager = await Membership.isManager(user._id, task.houseId);
  const isCreator = String(task.createdBy) === String(user._id);

  if (!isManager && !isCreator)
    return Response.json(
      { success: false, error: "Not authorized" },
      { status: 403 }
    );

  await Task.findByIdAndUpdate(taskId, { $set: { deletedAt: new Date() } });
  return Response.json({ success: true });
}
