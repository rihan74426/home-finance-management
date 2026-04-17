import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/db/mongoose";
import User from "@/models/User";
import Membership from "@/models/Membership";
import LedgerEntry from "@/models/Ledgerentry";
import {
  ROLES,
  PAYMENT_METHOD,
  LEDGER_TYPE,
  NOTIFICATION_TYPE,
} from "@/lib/constants";
import { createNotification } from "@/lib/notifications";
import { getRequestIdentifier, limitApi } from "@/lib/rateLimit";

export async function GET(req, { params }) {
  // rate limit: read
  const identifier = getRequestIdentifier(req) || (params?.id ?? "anon");
  const maybeBlocked = limitApi(identifier, "read");
  if (maybeBlocked) return maybeBlocked;

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

  const isManager = membership.role === ROLES.MANAGER;

  let entries;
  if (isManager) {
    entries = await LedgerEntry.find({ houseId: id })
      .populate({
        path: "membershipId",
        populate: { path: "userId", select: "name avatarUrl" },
      })
      .populate("loggedBy", "name")
      .sort({ periodStart: -1 })
      .lean();
  } else {
    entries = await LedgerEntry.find({
      houseId: id,
      membershipId: membership._id,
    })
      .sort({ periodStart: -1 })
      .lean();
    entries = entries.map(LedgerEntry.forMember);
  }

  return Response.json({ success: true, data: entries, isManager });
}

export async function POST(req, { params }) {
  // rate limit: write
  const identifier = getRequestIdentifier(req) || (params?.id ?? "anon");
  const maybeBlocked = limitApi(identifier, "write");
  if (maybeBlocked) return maybeBlocked;

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

  const body = await req.json();
  const {
    membershipId,
    amountDue,
    amountPaid,
    label,
    paymentMethod,
    periodStart,
    periodEnd,
    dueDate,
    memberNote,
    managerNote,
    type,
  } = body;

  if (!membershipId || !amountDue || !periodStart || !periodEnd || !dueDate)
    return Response.json(
      { success: false, error: "Missing required fields" },
      { status: 400 }
    );

  const targetMembership = await Membership.findOne({
    _id: membershipId,
    houseId: id,
    isActive: true,
  }).populate("userId", "name");
  if (!targetMembership)
    return Response.json(
      { success: false, error: "Membership not found" },
      { status: 404 }
    );

  if (paymentMethod && !Object.values(PAYMENT_METHOD).includes(paymentMethod))
    return Response.json(
      { success: false, error: "Invalid payment method" },
      { status: 400 }
    );

  const entry = await LedgerEntry.create({
    houseId: id,
    membershipId,
    type: type || LEDGER_TYPE.RENT,
    label: label || "Rent",
    amountDue,
    amountPaid: amountPaid ?? 0,
    paymentMethod: paymentMethod || null,
    periodStart: new Date(periodStart),
    periodEnd: new Date(periodEnd),
    dueDate: new Date(dueDate),
    memberNote: memberNote || "",
    managerNote: managerNote || "",
    loggedBy: user._id,
  });

  // Notify the member
  const isPaid = (amountPaid ?? 0) >= amountDue;
  await createNotification({
    userId: targetMembership.userId._id,
    houseId: id,
    type: isPaid ? NOTIFICATION_TYPE.RENT_PAID : NOTIFICATION_TYPE.RENT_DUE,
    title: isPaid
      ? `Payment logged — ${label || "Rent"}`
      : `Rent entry added — ${label || "Rent"}`,
    body: isPaid
      ? `Your payment has been recorded by the manager.`
      : `A rent entry was created for you. Amount due: ${amountDue / 100}.`,
    meta: { entryId: entry._id },
  });

  return Response.json({ success: true, data: entry }, { status: 201 });
}
