import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/db/mongoose";
import User from "@/models/User";
import Membership from "@/models/Membership";
import MoveOutChecklist, {
  MOVEOUT_STATUS,
  DEFAULT_CHECKLIST_ITEMS,
} from "@/models/MoveOutChecklist";
import Notification from "@/models/Notification";
import { NOTIFICATION_TYPE } from "@/lib/constants";

// GET /api/houses/[id]/moveout
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

  const isManager = membership.role === "manager";

  if (isManager) {
    // Manager sees all active checklists
    const checklists = await MoveOutChecklist.find({ houseId: id })
      .populate("userId", "name avatarUrl")
      .populate("membershipId", "roomLabel")
      .populate("reviewedBy", "name")
      .sort({ createdAt: -1 })
      .lean();
    return Response.json({ success: true, data: checklists, isManager: true });
  } else {
    // Member sees only their own
    const checklist = await MoveOutChecklist.findOne({
      membershipId: membership._id,
    }).lean();
    return Response.json({ success: true, data: checklist, isManager: false });
  }
}

// POST /api/houses/[id]/moveout — member initiates move-out
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

  if (membership.role === "manager")
    return Response.json(
      {
        success: false,
        error: "Manager cannot initiate move-out. Transfer ownership first.",
      },
      { status: 400 }
    );

  // Check if one already exists
  const existing = await MoveOutChecklist.findOne({
    membershipId: membership._id,
  });
  if (existing)
    return Response.json(
      {
        success: false,
        error: "Move-out checklist already exists",
        data: existing,
      },
      { status: 409 }
    );

  const { moveOutDate } = await req.json();
  if (!moveOutDate)
    return Response.json(
      { success: false, error: "moveOutDate required" },
      { status: 400 }
    );

  const checklist = await MoveOutChecklist.create({
    houseId: id,
    membershipId: membership._id,
    userId: user._id,
    moveOutDate: new Date(moveOutDate),
    items: DEFAULT_CHECKLIST_ITEMS.map((item) => ({ ...item })),
  });

  // Notify manager
  const managerMembership = await Membership.findOne({
    houseId: id,
    role: "manager",
    isActive: true,
  })
    .populate("userId", "_id")
    .lean();
  if (managerMembership) {
    await Notification.create({
      userId: managerMembership.userId._id,
      houseId: id,
      type: NOTIFICATION_TYPE.MEMBER_LEFT,
      title: `${user.name} has initiated move-out`,
      body: `Planned move-out: ${new Date(moveOutDate).toLocaleDateString()}`,
      meta: { checklistId: checklist._id, membershipId: membership._id },
    }).catch(() => {});
  }

  return Response.json({ success: true, data: checklist }, { status: 201 });
}

// PATCH /api/houses/[id]/moveout — update checklist items or submit / approve / reject
export async function PATCH(req, { params }) {
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

  const isManager = membership.role === "manager";
  let body;
  try {
    body = await req.json();
  } catch {
    return Response.json(
      { success: false, error: "Invalid JSON" },
      { status: 400 }
    );
  }

  const { action, checklistId, itemId, itemStatus, memberNote, managerNote } =
    body;

  // Get the checklist
  const checklist = await MoveOutChecklist.findById(checklistId);
  if (!checklist || String(checklist.houseId) !== id)
    return Response.json(
      { success: false, error: "Checklist not found" },
      { status: 404 }
    );

  const isMemberOwner = String(checklist.userId) === String(user._id);

  if (action === "update_item") {
    // Member checks off an item
    if (!isMemberOwner && !isManager)
      return Response.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    if (checklist.status === MOVEOUT_STATUS.APPROVED)
      return Response.json(
        { success: false, error: "Checklist already approved" },
        { status: 400 }
      );

    const item = checklist.items.id(itemId);
    if (!item)
      return Response.json(
        { success: false, error: "Item not found" },
        { status: 404 }
      );

    const validStatuses = ["pending", "done", "waived"];
    if (!validStatuses.includes(itemStatus))
      return Response.json(
        { success: false, error: "Invalid item status" },
        { status: 400 }
      );

    // Only manager can waive
    if (itemStatus === "waived" && !isManager)
      return Response.json(
        { success: false, error: "Only manager can waive items" },
        { status: 403 }
      );

    item.status = itemStatus;
    item.completedAt = itemStatus === "done" ? new Date() : null;
    await checklist.save();
    return Response.json({ success: true, data: checklist });
  }

  if (action === "submit") {
    // Member submits for manager review
    if (!isMemberOwner)
      return Response.json(
        { success: false, error: "Only the member can submit" },
        { status: 403 }
      );
    if (checklist.status !== MOVEOUT_STATUS.DRAFT)
      return Response.json(
        { success: false, error: "Can only submit a draft checklist" },
        { status: 400 }
      );

    // Check all required items are done or waived
    const incomplete = checklist.items.filter(
      (i) => i.isRequired && i.status === "pending"
    );
    if (incomplete.length > 0)
      return Response.json(
        {
          success: false,
          error: `${incomplete.length} required item(s) still pending`,
          pendingItems: incomplete.map((i) => i.label),
        },
        { status: 400 }
      );

    checklist.status = MOVEOUT_STATUS.PENDING_REVIEW;
    checklist.submittedAt = new Date();
    if (memberNote) checklist.memberNote = memberNote;
    await checklist.save();

    // Notify manager
    const managerM = await Membership.findOne({
      houseId: id,
      role: "manager",
      isActive: true,
    })
      .populate("userId", "_id")
      .lean();
    if (managerM) {
      await Notification.create({
        userId: managerM.userId._id,
        houseId: id,
        type: NOTIFICATION_TYPE.MEMBER_LEFT,
        title: `Move-out checklist submitted for review`,
        body: `${user.name} has completed their checklist and is awaiting your approval.`,
        meta: { checklistId: checklist._id },
      }).catch(() => {});
    }

    return Response.json({ success: true, data: checklist });
  }

  if (action === "approve" || action === "reject") {
    if (!isManager)
      return Response.json(
        { success: false, error: "Manager only" },
        { status: 403 }
      );
    if (checklist.status !== MOVEOUT_STATUS.PENDING_REVIEW)
      return Response.json(
        { success: false, error: "Checklist must be pending review" },
        { status: 400 }
      );

    checklist.status =
      action === "approve" ? MOVEOUT_STATUS.APPROVED : MOVEOUT_STATUS.REJECTED;
    checklist.reviewedBy = user._id;
    checklist.reviewedAt = new Date();
    if (managerNote) checklist.managerNote = managerNote;
    await checklist.save();

    if (action === "approve") {
      // Deactivate the membership
      await Membership.findByIdAndUpdate(checklist.membershipId, {
        $set: { isActive: false, moveOutDate: checklist.moveOutDate },
      });
    }

    // Notify the member
    await Notification.create({
      userId: checklist.userId,
      houseId: id,
      type: NOTIFICATION_TYPE.MEMBER_LEFT,
      title:
        action === "approve"
          ? "Move-out approved — you have been removed from the house"
          : "Move-out checklist rejected — please review the manager's notes",
      body: managerNote || "",
      meta: { checklistId: checklist._id },
    }).catch(() => {});

    return Response.json({ success: true, data: checklist });
  }

  return Response.json(
    { success: false, error: "Invalid action" },
    { status: 400 }
  );
}
