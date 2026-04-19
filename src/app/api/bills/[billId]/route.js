import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/db/mongoose";
import User from "@/models/User";
import Membership from "@/models/Membership";
import { Bill } from "@/models/Bills";
import { BillSplit } from "@/models/Bills";
import LedgerEntry from "@/models/Ledgerentry";
import { PAYMENT_STATUS, NOTIFICATION_TYPE } from "@/lib/constants";
import { createNotification } from "@/lib/notifications";

// PATCH /api/bills/[billId] — manager updates bill details or marks splits paid
export async function PATCH(req, { params }) {
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

  const { label, note, receiptUrl, dueDate, totalAmount } = body;

  if (label !== undefined) bill.label = label.trim();
  if (note !== undefined) bill.note = note.trim();
  if (receiptUrl !== undefined) bill.receiptUrl = receiptUrl;
  if (dueDate) bill.dueDate = new Date(dueDate);
  if (totalAmount && totalAmount > 0 && !bill.isSplit) {
    // Only allow amount change before splitting
    bill.totalAmount = totalAmount;
    // Recompute meter units if readings exist
    if (bill.meterReadingStart != null && bill.meterReadingEnd != null) {
      bill.unitsConsumed = bill.meterReadingEnd - bill.meterReadingStart;
    }
  }

  await bill.save();
  return Response.json({ success: true, data: bill });
}

// PATCH /api/bills/[billId]/splits/[splitId] — manager marks a member's split as paid
// This is handled as a separate sub-resource endpoint below for clarity.

// DELETE /api/bills/[billId] — manager deletes an unsplit bill
export async function DELETE(req, { params }) {
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

  const isManager = await Membership.isManager(user._id, bill.houseId);
  if (!isManager)
    return Response.json(
      { success: false, error: "Manager only" },
      { status: 403 }
    );

  if (bill.isSplit)
    return Response.json(
      {
        success: false,
        error:
          "Cannot delete a bill that has already been split. Remove the split entries from the ledger instead.",
      },
      { status: 400 }
    );

  await Bill.findByIdAndDelete(billId);
  return Response.json({ success: true });
}
