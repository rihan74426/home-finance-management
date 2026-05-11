import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/db/mongoose";
import User from "@/models/User";
import Membership from "@/models/Membership";
import LedgerEntry from "@/models/Ledgerentry";
import { PAYMENT_METHOD, NOTIFICATION_TYPE } from "@/lib/constants";
import { createNotification } from "@/lib/notifications";

// PATCH /api/houses/[id]/ledger/[entryId]
// Manager updates amountPaid, paymentMethod, notes on an existing entry
export async function PATCH(req, { params }) {
  const { userId: clerkId } = await auth();
  if (!clerkId)
    return Response.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );

  await connectDB();
  const { id, entryId } = await params;

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

  const entry = await LedgerEntry.findOne({ _id: entryId, houseId: id });
  if (!entry)
    return Response.json(
      { success: false, error: "Entry not found" },
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

  const { amountPaid, paymentMethod, memberNote, managerNote } = body;

  if (amountPaid !== undefined) {
    if (typeof amountPaid !== "number" || amountPaid < 0)
      return Response.json(
        { success: false, error: "Invalid amountPaid" },
        { status: 400 }
      );
    entry.amountPaid = amountPaid;
  }

  if (paymentMethod !== undefined) {
    if (paymentMethod && !Object.values(PAYMENT_METHOD).includes(paymentMethod))
      return Response.json(
        { success: false, error: "Invalid payment method" },
        { status: 400 }
      );
    entry.paymentMethod = paymentMethod || null;
  }

  if (memberNote !== undefined) entry.memberNote = memberNote;
  if (managerNote !== undefined) entry.managerNote = managerNote;

  await entry.save(); // pre-save hook recalculates status

  // Notify member if now fully paid
  if (entry.status === "paid") {
    const membership = await Membership.findById(entry.membershipId)
      .populate("userId", "_id name")
      .lean();
    if (membership?.userId) {
      await createNotification({
        userId: membership.userId._id,
        houseId: id,
        type: NOTIFICATION_TYPE.RENT_PAID,
        title: `Payment confirmed — ${entry.label || "Rent"}`,
        body: `Your payment has been recorded by the manager.`,
        meta: { entryId: entry._id },
      });
    }
  }

  return Response.json({ success: true, data: entry });
}
