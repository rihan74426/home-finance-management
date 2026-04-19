import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/db/mongoose";
import User from "@/models/User";
import Membership from "@/models/Membership";
import { HouseRule, RuleAlert } from "@/models/HouseRule";
import Notification from "@/models/Notification";
import { NOTIFICATION_TYPE } from "@/lib/constants";

// POST /api/rules/[ruleId]/alerts — any member reports a violation
export async function POST(req, { params }) {
  const { userId: clerkId } = await auth();
  if (!clerkId)
    return Response.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );

  await connectDB();
  const { ruleId } = await params;

  const user = await User.findOne({ clerkId, deletedAt: null });
  if (!user)
    return Response.json(
      { success: false, error: "User not found" },
      { status: 404 }
    );

  const rule = await HouseRule.findOne({
    _id: ruleId,
    deletedAt: null,
    isActive: true,
  });
  if (!rule)
    return Response.json(
      { success: false, error: "Rule not found" },
      { status: 404 }
    );

  const membership = await Membership.findOne({
    userId: user._id,
    houseId: rule.houseId,
    isActive: true,
  });
  if (!membership)
    return Response.json(
      { success: false, error: "Not a member" },
      { status: 403 }
    );

  const { description, reportedAgainst } = await req.json();

  const alert = await RuleAlert.create({
    houseId: rule.houseId,
    ruleId: rule._id,
    reportedBy: user._id,
    reportedAgainst: reportedAgainst || null,
    description: description?.trim() || "",
  });

  // Notify the manager
  const managerMembership = await Membership.findOne({
    houseId: rule.houseId,
    role: "manager",
    isActive: true,
  })
    .populate("userId", "_id")
    .lean();
  if (managerMembership) {
    await Notification.create({
      userId: managerMembership.userId._id,
      houseId: rule.houseId,
      type: NOTIFICATION_TYPE.ANNOUNCEMENT,
      title: `Rule #${rule.ruleNumber} violation reported`,
      body: `"${rule.title}" — ${description?.trim() || "No details provided."}`,
      meta: { alertId: alert._id, ruleId: rule._id },
    }).catch(() => {});
  }

  // Notify all members (rule broken notification)
  const memberships = await Membership.find({
    houseId: rule.houseId,
    isActive: true,
  })
    .populate("userId", "_id name")
    .lean();
  await Promise.all(
    memberships
      .filter((m) => String(m.userId._id) !== String(user._id))
      .map((m) =>
        Notification.create({
          userId: m.userId._id,
          houseId: rule.houseId,
          type: NOTIFICATION_TYPE.ANNOUNCEMENT,
          title: `Rule #${rule.ruleNumber} was reported as broken`,
          body: rule.title,
          meta: { alertId: alert._id, ruleId: rule._id },
        }).catch(() => {})
      )
  );

  return Response.json({ success: true, data: alert }, { status: 201 });
}

// PATCH /api/rules/[ruleId]/alerts/[alertId] — manager resolves/dismisses
export async function PATCH(req, { params }) {
  const { userId: clerkId } = await auth();
  if (!clerkId)
    return Response.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );

  await connectDB();
  const { ruleId, alertId } = await params;

  const user = await User.findOne({ clerkId, deletedAt: null });
  if (!user)
    return Response.json(
      { success: false, error: "User not found" },
      { status: 404 }
    );

  const alert = await RuleAlert.findOne({ _id: alertId, ruleId });
  if (!alert)
    return Response.json(
      { success: false, error: "Alert not found" },
      { status: 404 }
    );

  const isManager = await Membership.isManager(user._id, alert.houseId);
  if (!isManager)
    return Response.json(
      { success: false, error: "Manager only" },
      { status: 403 }
    );

  const { status, managerNote } = await req.json();
  const validStatuses = ["acknowledged", "resolved", "dismissed"];
  if (!validStatuses.includes(status))
    return Response.json(
      { success: false, error: "Invalid status" },
      { status: 400 }
    );

  alert.status = status;
  alert.resolvedBy = user._id;
  alert.resolvedAt = new Date();
  if (managerNote) alert.managerNote = managerNote.trim();
  await alert.save();

  return Response.json({ success: true, data: alert });
}
