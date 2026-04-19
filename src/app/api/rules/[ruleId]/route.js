import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/db/mongoose";
import User from "@/models/User";
import Membership from "@/models/Membership";
import { HouseRule, RuleAlert } from "@/models/HouseRule";
import Notification from "@/models/Notification";
import { NOTIFICATION_TYPE } from "@/lib/constants";

// PATCH /api/rules/[ruleId]
export async function PATCH(req, { params }) {
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

  const rule = await HouseRule.findOne({ _id: ruleId, deletedAt: null });
  if (!rule)
    return Response.json(
      { success: false, error: "Rule not found" },
      { status: 404 }
    );

  const isManager = await Membership.isManager(user._id, rule.houseId);
  if (!isManager)
    return Response.json(
      { success: false, error: "Manager only" },
      { status: 403 }
    );

  const { title, description, category, isActive } = await req.json();
  if (title?.trim()) rule.title = title.trim();
  if (description !== undefined) rule.description = description.trim();
  if (category) rule.category = category;
  if (typeof isActive === "boolean") rule.isActive = isActive;

  await rule.save();
  return Response.json({ success: true, data: rule });
}

// DELETE /api/rules/[ruleId]
export async function DELETE(req, { params }) {
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

  const rule = await HouseRule.findOne({ _id: ruleId, deletedAt: null });
  if (!rule)
    return Response.json(
      { success: false, error: "Rule not found" },
      { status: 404 }
    );

  const isManager = await Membership.isManager(user._id, rule.houseId);
  if (!isManager)
    return Response.json(
      { success: false, error: "Manager only" },
      { status: 403 }
    );

  await HouseRule.findByIdAndUpdate(ruleId, {
    $set: { deletedAt: new Date(), isActive: false },
  });
  return Response.json({ success: true });
}
