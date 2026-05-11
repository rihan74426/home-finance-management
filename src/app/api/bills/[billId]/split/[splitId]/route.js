import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/db/mongoose";
import User from "@/models/User";
import Membership from "@/models/Membership";
import { Bill, BillSplit } from "@/models/Bills";
import LedgerEntry from "@/models/Ledgerentry";
import {
  PAYMENT_STATUS,
  PAYMENT_METHOD,
  NOTIFICATION_TYPE,
} from "@/lib/constants";
import { createNotification } from "@/lib/notifications";

// PATCH /api/bills/[billId]/split/[splitId]
// Manager marks a member's share of a bill as paid
export async function PATCH(req, { params }) {
  const { userId: clerkId } = await auth();
  if (!clerkId)
    return Response.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );

  await connectDB();
  const { billId, splitId } = await params;

  const user = await User.findOne({ clerkId, deletedAt: null });
  if (!user)
    return Response.json(
      { success: false, error: "User not found" },
      { status: 404 }
    );

  const bill = await Bill.findById(billId);
  if (!bill)
    return Response.json(
      { success: false, error: "Bill not found" },
      { status: 404 }
    );

  const isManager = await Membership.isManager(user._id, bill.houseId);
  if (!isManager)
    return Response.json(
      { success: false, error: "Manager only" },
      { status: 403 }
    );

  const split = await BillSplit.findOne({ _id: splitId, billId }).populate({
    path: "membershipId",
    populate: { path: "userId", select: "name _id" },
  });
  if (!split)
    return Response.json(
      { success: false, error: "Split not found" },
      { status: 404 }
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

  const { amountPaid, paymentMethod, managerNote } = body;

  if (amountPaid == null || amountPaid < 0)
    return Response.json(
      { success: false, error: "amountPaid required" },
      { status: 400 }
    );

  // Determine new status
  let newStatus;
  if (amountPaid >= split.shareAmount) {
    newStatus = PAYMENT_STATUS.PAID;
  } else if (amountPaid > 0) {
    newStatus = PAYMENT_STATUS.PARTIAL;
  } else {
    newStatus = PAYMENT_STATUS.PENDING;
  }

  split.status = newStatus;
  await split.save();

  // Update linked ledger entry
  if (split.ledgerEntryId) {
    const entry = await LedgerEntry.findById(split.ledgerEntryId);
    if (entry) {
      entry.amountPaid = amountPaid;
      if (
        paymentMethod &&
        Object.values(PAYMENT_METHOD).includes(paymentMethod)
      ) {
        entry.paymentMethod = paymentMethod;
      }
      if (managerNote !== undefined) entry.managerNote = managerNote;
      await entry.save(); // pre-save hook recalculates status
    }
  }

  // Notify the member
  const memberUserId = split.membershipId?.userId?._id;
  if (memberUserId) {
    const isPaid = newStatus === PAYMENT_STATUS.PAID;
    await createNotification({
      userId: memberUserId,
      houseId: bill.houseId,
      type: isPaid ? NOTIFICATION_TYPE.RENT_PAID : NOTIFICATION_TYPE.BILL_DUE,
      title: isPaid
        ? `Bill payment confirmed — ${bill.label || bill.type}`
        : `Partial bill payment recorded — ${bill.label || bill.type}`,
      body: `Amount paid: ${amountPaid / 100}. Status: ${newStatus}.`,
      meta: { billId, splitId },
    });
  }

  return Response.json({ success: true, data: split });
}

// GET /api/bills/[billId]/split/[splitId]
// Get a single split record
export async function GET(req, { params }) {
  const { userId: clerkId } = await auth();
  if (!clerkId)
    return Response.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );

  await connectDB();
  const { billId, splitId } = await params;

  const user = await User.findOne({ clerkId, deletedAt: null });
  if (!user)
    return Response.json(
      { success: false, error: "User not found" },
      { status: 404 }
    );

  const bill = await Bill.findById(billId).lean();
  if (!bill)
    return Response.json(
      { success: false, error: "Bill not found" },
      { status: 404 }
    );

  const membership = await Membership.findOne({
    userId: user._id,
    houseId: bill.houseId,
    isActive: true,
  });
  if (!membership)
    return Response.json(
      { success: false, error: "Not a member" },
      { status: 403 }
    );

  const split = await BillSplit.findOne({ _id: splitId, billId })
    .populate({
      path: "membershipId",
      populate: { path: "userId", select: "name avatarUrl" },
    })
    .lean();

  if (!split)
    return Response.json(
      { success: false, error: "Split not found" },
      { status: 404 }
    );

  // Members can only see their own split
  const isManager = await Membership.isManager(user._id, bill.houseId);
  const isOwn = String(split.membershipId?._id) === String(membership._id);
  if (!isManager && !isOwn)
    return Response.json(
      { success: false, error: "Forbidden" },
      { status: 403 }
    );

  return Response.json({ success: true, data: split });
}
