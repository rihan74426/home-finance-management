import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/db/mongoose";
import User from "@/models/User";
import Membership from "@/models/Membership";
import { RuleAlert } from "@/models/HouseRule";

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

  let body;
  try {
    body = await req.json();
  } catch {
    return Response.json(
      { success: false, error: "Invalid JSON" },
      { status: 400 }
    );
  }

  const { status, managerNote } = body;
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
