import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/db/mongoose";
import User from "@/models/User";
import Membership from "@/models/Membership";
import MemberDocument from "@/models/MemberDocument";

// GET /api/memberships/[membershipId]/documents
export async function GET(req, { params }) {
  const { userId: clerkId } = await auth();
  if (!clerkId)
    return Response.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );

  await connectDB();
  const { membershipId } = await params;

  const user = await User.findOne({ clerkId, deletedAt: null });
  if (!user)
    return Response.json(
      { success: false, error: "User not found" },
      { status: 404 }
    );

  const membership = await Membership.findById(membershipId).lean();
  if (!membership)
    return Response.json(
      { success: false, error: "Membership not found" },
      { status: 404 }
    );

  const isOwner = String(membership.userId) === String(user._id);
  const isManager = await Membership.isManager(user._id, membership.houseId);

  // Manager loses access when membership is inactive
  if (!isOwner && !(isManager && membership.isActive))
    return Response.json(
      { success: false, error: "Forbidden" },
      { status: 403 }
    );

  const docs = await MemberDocument.find({ membershipId, deletedAt: null })
    .populate("verifiedBy", "name")
    .sort({ createdAt: -1 })
    .lean();

  return Response.json({ success: true, data: docs });
}

// POST /api/memberships/[membershipId]/documents
export async function POST(req, { params }) {
  const { userId: clerkId } = await auth();
  if (!clerkId)
    return Response.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );

  await connectDB();
  const { membershipId } = await params;

  const user = await User.findOne({ clerkId, deletedAt: null });
  if (!user)
    return Response.json(
      { success: false, error: "User not found" },
      { status: 404 }
    );

  const membership = await Membership.findById(membershipId);
  if (!membership)
    return Response.json(
      { success: false, error: "Membership not found" },
      { status: 404 }
    );

  if (String(membership.userId) !== String(user._id))
    return Response.json(
      { success: false, error: "Only the member can upload documents" },
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

  const { fileUrl, fileName, docType, label, mimeType } = body;
  if (!fileUrl)
    return Response.json(
      { success: false, error: "fileUrl required" },
      { status: 400 }
    );

  const VALID_TYPES = ["id", "passport", "lease", "proof_of_address", "other"];

  const doc = await MemberDocument.create({
    userId: user._id,
    membershipId: membership._id,
    houseId: membership.houseId,
    docType: VALID_TYPES.includes(docType) ? docType : "other",
    label: label?.trim() || "",
    fileUrl,
    fileName: fileName || null,
    mimeType: mimeType || null,
  });

  return Response.json({ success: true, data: doc }, { status: 201 });
}
