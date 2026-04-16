import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/db/mongoose";
import User from "@/models/User";
import Membership from "@/models/Membership";
import { Bill, BillSplit } from "@/models/Bills";
import LedgerEntry from "@/models/Ledgerentry";
import { BILL_SPLIT_TYPE, LEDGER_TYPE } from "@/lib/constants";
import { getRequestIdentifier, limitApi } from "@/lib/rateLimit";

// POST /api/bills/[billId]/split
export async function POST(req, { params }) {
  // rate limit: expensive mutation (split)
  const identifier = getRequestIdentifier(req) || (params?.billId ?? "anon");
  const maybeBlocked = limitApi(identifier, "split");
  if (maybeBlocked) return maybeBlocked;

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

  // Atomic check + mark — prevents two simultaneous requests both passing the isSplit check
  const bill = await Bill.findOneAndUpdate(
    { _id: billId, isSplit: false },
    { $set: { isSplit: true } },
    { new: false } // return doc BEFORE update so we have original values
  );

  if (!bill) {
    const exists = await Bill.findById(billId).lean();
    if (!exists)
      return Response.json(
        { success: false, error: "Bill not found" },
        { status: 404 }
      );
    return Response.json(
      { success: false, error: "Bill already split" },
      { status: 400 }
    );
  }

  const isManager = await Membership.isManager(user._id, bill.houseId);
  if (!isManager) {
    await Bill.findByIdAndUpdate(billId, { $set: { isSplit: false } });
    return Response.json(
      { success: false, error: "Manager only" },
      { status: 403 }
    );
  }

  let body;
  try {
    body = await req.json();
  } catch {
    await Bill.findByIdAndUpdate(billId, { $set: { isSplit: false } });
    return Response.json(
      { success: false, error: "Invalid JSON" },
      { status: 400 }
    );
  }

  const { splitType, splits } = body;

  const memberships = await Membership.find({
    houseId: bill.houseId,
    isActive: true,
  }).lean();
  if (memberships.length === 0) {
    await Bill.findByIdAndUpdate(billId, { $set: { isSplit: false } });
    return Response.json(
      { success: false, error: "No active members" },
      { status: 400 }
    );
  }

  let shareMap = {};

  if (splitType === BILL_SPLIT_TYPE.CUSTOM) {
    if (!splits || !Array.isArray(splits) || splits.length === 0) {
      await Bill.findByIdAndUpdate(billId, { $set: { isSplit: false } });
      return Response.json(
        { success: false, error: "Custom split requires splits array" },
        { status: 400 }
      );
    }
    const total = splits.reduce((sum, s) => sum + (s.shareAmount || 0), 0);
    if (total !== bill.totalAmount) {
      await Bill.findByIdAndUpdate(billId, { $set: { isSplit: false } });
      return Response.json(
        {
          success: false,
          error: `Split total (${total}) must equal bill total (${bill.totalAmount})`,
        },
        { status: 400 }
      );
    }
    for (const s of splits) {
      const m = memberships.find(
        (m) => String(m._id) === String(s.membershipId)
      );
      if (!m) {
        await Bill.findByIdAndUpdate(billId, { $set: { isSplit: false } });
        return Response.json(
          { success: false, error: `Membership ${s.membershipId} not found` },
          { status: 400 }
        );
      }
      shareMap[String(m._id)] = s.shareAmount;
    }
  } else {
    const count = memberships.length;
    const base = Math.floor(bill.totalAmount / count);
    const remainder = bill.totalAmount - base * count;
    memberships.forEach((m, i) => {
      shareMap[String(m._id)] = base + (i === 0 ? remainder : 0);
    });
  }

  // Clean up any orphaned records from a previous failed attempt before inserting
  await BillSplit.deleteMany({ billId: bill._id });
  await LedgerEntry.deleteMany({ billId: bill._id });

  const label =
    bill.label ||
    `${bill.type.charAt(0).toUpperCase() + bill.type.slice(1)} Bill`;
  const billSplits = [];

  try {
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

    await Bill.findByIdAndUpdate(billId, {
      $set: { splitType: splitType || BILL_SPLIT_TYPE.EQUAL },
    });

    return Response.json({
      success: true,
      data: { billId, splitCount: billSplits.length },
    });
  } catch (err) {
    // Rollback: undo everything
    await BillSplit.deleteMany({ billId: bill._id });
    await LedgerEntry.deleteMany({ billId: bill._id });
    await Bill.findByIdAndUpdate(billId, { $set: { isSplit: false } });
    console.error("Bill split rollback:", err.message);
    return Response.json(
      { success: false, error: "Split failed. Please try again." },
      { status: 500 }
    );
  }
}

// GET /api/bills/[billId]/split
export async function GET(req, { params }) {
  // rate limit: reads
  const identifier = getRequestIdentifier(req) || (params?.billId ?? "anon");
  const maybeBlocked = limitApi(identifier, "read");
  if (maybeBlocked) return maybeBlocked;

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
