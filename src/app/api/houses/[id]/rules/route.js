import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/db/mongoose";
import User from "@/models/User";
import Membership from "@/models/Membership";
import { HouseRule, RuleAlert } from "@/models/HouseRule";
import Notification from "@/models/Notification";
import { NOTIFICATION_TYPE } from "@/lib/constants";

// GET /api/houses/[id]/rules
export async function GET(req, { params }) {
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

  const rules = await HouseRule.find({
    houseId: id,
    deletedAt: null,
    isActive: true,
  })
    .populate("createdBy", "name")
    .sort({ ruleNumber: 1 })
    .lean();

  // If manager, also return open alerts
  let alerts = [];
  if (membership.role === "manager") {
    alerts = await RuleAlert.find({ houseId: id, status: "open" })
      .populate("reportedBy", "name avatarUrl")
      .populate("reportedAgainst", "name avatarUrl")
      .populate("ruleId", "title ruleNumber")
      .sort({ createdAt: -1 })
      .lean();
  }

  return Response.json({
    success: true,
    data: rules,
    alerts,
    isManager: membership.role === "manager",
  });
}

// POST /api/houses/[id]/rules — manager creates a rule
export async function POST(req, { params }) {
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

  const isManager = await Membership.isManager(user._id, id);
  if (!isManager)
    return Response.json(
      { success: false, error: "Manager only" },
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

  const { title, description, category } = body;
  if (!title?.trim())
    return Response.json(
      { success: false, error: "Title required" },
      { status: 400 }
    );

  // Auto-assign next rule number
  const last = await HouseRule.findOne({ houseId: id })
    .sort({ ruleNumber: -1 })
    .lean();
  const ruleNumber = (last?.ruleNumber ?? 0) + 1;

  const rule = await HouseRule.create({
    houseId: id,
    createdBy: user._id,
    ruleNumber,
    title: title.trim(),
    description: description?.trim() || "",
    category: category || "other",
  });

  // Notify all members
  const memberships = await Membership.find({
    houseId: id,
    isActive: true,
    role: { $ne: "manager" },
  })
    .populate("userId", "_id")
    .lean();
  await Promise.all(
    memberships.map((m) =>
      Notification.create({
        userId: m.userId._id,
        houseId: id,
        type: NOTIFICATION_TYPE.ANNOUNCEMENT,
        title: `New house rule #${ruleNumber}: ${title.trim()}`,
        body: description?.trim() || "",
        meta: { ruleId: rule._id },
      }).catch(() => {})
    )
  );

  return Response.json({ success: true, data: rule }, { status: 201 });
}
