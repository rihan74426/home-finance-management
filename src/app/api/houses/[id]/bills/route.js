import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/db/mongoose";
import User from "@/models/User";
import Membership from "@/models/Membership";
import { Bill } from "@/models/Bills";
import { ROLES, BILL_TYPE, BILL_SPLIT_TYPE } from "@/lib/constants";
import { getRequestIdentifier, limitApi } from "@/lib/rateLimit";

// GET /api/houses/[id]/bills
export async function GET(req, { params }) {
  // rate limit: listing / reads
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

  const bills = await Bill.find({ houseId: id })
    .populate("createdBy", "name")
    .sort({ periodStart: -1 })
    .lean();

  return Response.json({
    success: true,
    data: bills,
    isManager: membership.role === ROLES.MANAGER,
  });
}

// POST /api/houses/[id]/bills — manager only
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

  let body;
  try {
    body = await req.json();
  } catch {
    return Response.json(
      { success: false, error: "Invalid JSON" },
      { status: 400 }
    );
  }

  const {
    type,
    label,
    totalAmount,
    periodStart,
    periodEnd,
    dueDate,
    splitType,
    meterReadingStart,
    meterReadingEnd,
    note,
  } = body;

  if (!type || !Object.values(BILL_TYPE).includes(type))
    return Response.json(
      { success: false, error: "Invalid bill type" },
      { status: 400 }
    );
  if (!totalAmount || totalAmount < 1)
    return Response.json(
      { success: false, error: "totalAmount must be >= 1" },
      { status: 400 }
    );
  if (!periodStart || !periodEnd || !dueDate)
    return Response.json(
      { success: false, error: "periodStart, periodEnd, dueDate required" },
      { status: 400 }
    );

  const bill = await Bill.create({
    houseId: id,
    createdBy: user._id,
    type,
    label: label?.trim() || "",
    totalAmount,
    periodStart: new Date(periodStart),
    periodEnd: new Date(periodEnd),
    dueDate: new Date(dueDate),
    splitType: splitType || BILL_SPLIT_TYPE.EQUAL,
    meterReadingStart: meterReadingStart ?? null,
    meterReadingEnd: meterReadingEnd ?? null,
    note: note?.trim() || "",
  });

  return Response.json({ success: true, data: bill }, { status: 201 });
}
