import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/db/mongoose";
import User from "@/models/User";
import Membership from "@/models/Membership";
import LedgerEntry from "@/models/Ledgerentry";
import { ROLES, PAYMENT_METHOD, LEDGER_TYPE } from "@/lib/constants";

// GET /api/houses/[id]/ledger
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

  const isManager = membership.role === ROLES.MANAGER;

  let entries;
  if (isManager) {
    // Manager sees all entries with member info
    entries = await LedgerEntry.find({ houseId: id })
      .populate({
        path: "membershipId",
        populate: { path: "userId", select: "name avatarUrl" },
      })
      .populate("loggedBy", "name")
      .sort({ periodStart: -1 })
      .lean();
  } else {
    // Member sees only their own entries, without managerNote
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

// POST /api/houses/[id]/ledger — log a payment (manager only)
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

  if (!membershipId || !amountDue || !periodStart || !periodEnd || !dueDate) {
    return Response.json(
      { success: false, error: "Missing required fields" },
      { status: 400 }
    );
  }

  // Verify membershipId belongs to this house
  const targetMembership = await Membership.findOne({
    _id: membershipId,
    houseId: id,
    isActive: true,
  });
  if (!targetMembership)
    return Response.json(
      { success: false, error: "Membership not found" },
      { status: 404 }
    );

  if (paymentMethod && !Object.values(PAYMENT_METHOD).includes(paymentMethod)) {
    return Response.json(
      { success: false, error: "Invalid payment method" },
      { status: 400 }
    );
  }

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

  return Response.json({ success: true, data: entry }, { status: 201 });
}
