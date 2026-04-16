import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/db/mongoose";
import User from "@/models/User";
import Membership from "@/models/Membership";
import { Bill, BillSplit } from "@/models/Bills";
import LedgerEntry from "@/models/Ledgerentry";
import { BILL_SPLIT_TYPE, LEDGER_TYPE } from "@/lib/constants";

// POST /api/bills/[billId]/split — run the split (manager only)
export async function POST(req, { params }) {
  const { userId: clerkId } = await auth();
  if (!clerkId)
    return Response.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );

  await connectDB();
  const { billId } = await params;

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

  if (bill.isSplit)
    return Response.json(
      { success: false, error: "Bill already split" },
      { status: 400 }
    );

  const isManager = await Membership.isManager(user._id, bill.houseId);
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

  const { splitType, splits } = body;

  // Get all active memberships for this house
  const memberships = await Membership.find({
    houseId: bill.houseId,
    isActive: true,
  }).lean();
  if (memberships.length === 0)
    return Response.json(
      { success: false, error: "No active members" },
      { status: 400 }
    );

  let shareMap = {}; // membershipId -> shareAmount

  if (splitType === BILL_SPLIT_TYPE.CUSTOM) {
    if (!splits || !Array.isArray(splits) || splits.length === 0)
      return Response.json(
        { success: false, error: "Custom split requires splits array" },
        { status: 400 }
      );

    const total = splits.reduce((sum, s) => sum + (s.shareAmount || 0), 0);
    if (total !== bill.totalAmount)
      return Response.json(
        {
          success: false,
          error: `Custom split total (${total}) must equal bill total (${bill.totalAmount})`,
        },
        { status: 400 }
      );

    for (const s of splits) {
      const m = memberships.find(
        (m) => String(m._id) === String(s.membershipId)
      );
      if (!m)
        return Response.json(
          { success: false, error: `Membership ${s.membershipId} not found` },
          { status: 400 }
        );
      shareMap[String(m._id)] = s.shareAmount;
    }
  } else {
    // Equal split
    const count = memberships.length;
    const base = Math.floor(bill.totalAmount / count);
    const remainder = bill.totalAmount - base * count;

    memberships.forEach((m, i) => {
      shareMap[String(m._id)] = base + (i === 0 ? remainder : 0);
    });
  }

  // Create BillSplit + LedgerEntry per member
  const billSplits = [];
  const label =
    bill.label ||
    `${bill.type.charAt(0).toUpperCase() + bill.type.slice(1)} Bill`;

  for (const membership of memberships) {
    const shareAmount = shareMap[String(membership._id)];
    if (!shareAmount || shareAmount <= 0) continue;

    const ledgerEntry = await LedgerEntry.create({
      houseId: bill.houseId,
      membershipId: membership._id,
      type: LEDGER_TYPE.BILL,
      label,
      amountDue: shareAmount,
      amountPaid: 0,
      periodStart: bill.periodStart,
      periodEnd: bill.periodEnd,
      dueDate: bill.dueDate,
      loggedBy: user._id,
      billId: bill._id,
    });

    const billSplit = await BillSplit.create({
      billId: bill._id,
      houseId: bill.houseId,
      membershipId: membership._id,
      shareAmount,
      ledgerEntryId: ledgerEntry._id,
    });

    billSplits.push(billSplit);
  }

  bill.isSplit = true;
  bill.splitType = splitType || BILL_SPLIT_TYPE.EQUAL;
  await bill.save();

  return Response.json({ success: true, data: { bill, billSplits } });
}

// GET /api/bills/[billId]/split — get split details
export async function GET(req, { params }) {
  const { userId: clerkId } = await auth();
  if (!clerkId)
    return Response.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );

  await connectDB();
  const { billId } = await params;

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

  const splits = await BillSplit.find({ billId })
    .populate({
      path: "membershipId",
      populate: { path: "userId", select: "name avatarUrl" },
    })
    .lean();

  return Response.json({ success: true, data: splits });
}
