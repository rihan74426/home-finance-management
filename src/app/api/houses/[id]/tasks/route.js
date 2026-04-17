import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/db/mongoose";
import User from "@/models/User";
import Membership from "@/models/Membership";
import Task from "@/models/Task";
import {
  TASK_STATUS,
  TASK_PRIORITY,
  TASK_RECURRENCE,
  TASK_CATEGORY,
} from "@/lib/constants";
import { getRequestIdentifier, limitApi } from "@/lib/rateLimit";

// GET /api/houses/[id]/tasks
export async function GET(req, { params }) {
  // rate limit: list tasks (reads)
  const identifier = getRequestIdentifier(req) || (params?.id ?? "anon");
  const maybeBlocked = limitApi(identifier, "read");
  if (maybeBlocked) return maybeBlocked;

  const { userId: clerkId } = await auth();
  if (!clerkId)
    return Response.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );

  await connectDB();
  const { id } = await params;

  const user = await User.findOne({ clerkId, deletedAt: null });
  if (!user)
    return Response.json(
      { success: false, error: "User not found" },
      { status: 404 }
    );

  const membership = await Membership.findOne({
    userId: user._id,
    houseId: id,
    isActive: true,
  });
  if (!membership)
    return Response.json(
      { success: false, error: "Not a member" },
      { status: 403 }
    );

  const { searchParams } = new URL(req.url);
  const statusFilter = searchParams.get("status");

  const query = { houseId: id, deletedAt: null };
  if (statusFilter) query.status = statusFilter;

  const tasks = await Task.find(query)
    .populate({
      path: "assignedTo",
      populate: { path: "userId", select: "name avatarUrl" },
    })
    .populate("createdBy", "name")
    .sort({ status: 1, dueDate: 1, createdAt: -1 })
    .lean();

  return Response.json({
    success: true,
    data: tasks,
    myMembershipId: membership._id,
  });
}

// POST /api/houses/[id]/tasks
export async function POST(req, { params }) {
  // rate limit: create task (write)
  const identifier = getRequestIdentifier(req) || (params?.id ?? "anon");
  const maybeBlocked = limitApi(identifier, "write");
  if (maybeBlocked) return maybeBlocked;

  const { userId: clerkId } = await auth();
  if (!clerkId)
    return Response.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );

  await connectDB();
  const { id } = await params;

  const user = await User.findOne({ clerkId, deletedAt: null });
  if (!user)
    return Response.json(
      { success: false, error: "User not found" },
      { status: 404 }
    );

  const membership = await Membership.findOne({
    userId: user._id,
    houseId: id,
    isActive: true,
  });
  if (!membership)
    return Response.json(
      { success: false, error: "Not a member" },
      { status: 403 }
    );

  const {
    title,
    description,
    category,
    priority,
    assignedTo,
    dueDate,
    recurrence,
  } = await req.json();

  if (!title?.trim())
    return Response.json(
      { success: false, error: "Title required" },
      { status: 400 }
    );

  if (assignedTo) {
    const assignedMembership = await Membership.findOne({
      _id: assignedTo,
      houseId: id,
      isActive: true,
    });
    if (!assignedMembership)
      return Response.json(
        { success: false, error: "Invalid assignee" },
        { status: 400 }
      );
  }

  const task = await Task.create({
    houseId: id,
    createdBy: user._id,
    title: title.trim(),
    description: description || "",
    category: Object.values(TASK_CATEGORY).includes(category)
      ? category
      : TASK_CATEGORY.OTHER,
    priority: Object.values(TASK_PRIORITY).includes(priority)
      ? priority
      : TASK_PRIORITY.NORMAL,
    assignedTo: assignedTo || null,
    dueDate: dueDate ? new Date(dueDate) : null,
    recurrence: Object.values(TASK_RECURRENCE).includes(recurrence)
      ? recurrence
      : TASK_RECURRENCE.NONE,
  });

  return Response.json({ success: true, data: task }, { status: 201 });
}
