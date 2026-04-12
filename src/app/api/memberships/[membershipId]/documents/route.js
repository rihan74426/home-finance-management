import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/db/mongoose";
import User from "@/models/User";
import Membership from "@/models/Membership";
import MemberDocument from "@/models/MemberDocument";

// GET /api/memberships/[membershipId]/documents
// POST /api/memberships/[membershipId]/documents  (member uploads)
export async function GET(req, { params }) {
  const { userId: clerkId } = await auth();
  if (!clerkId)
    return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const { membershipId } = await params;

  const user = await User.findOne({ clerkId, deletedAt: null });
  if (!user) return Response.json({ success: false, error: "User not found" }, { status: 404 });

  const membership = await Membership.findById(membershipId).lean();
  if (!membership) return Response.json({ success: false, error: "Membership not found" }, { status: 404 });

  const isOwner = String(membership.userId) === String(user._id);
  const isManager = await Membership.isManager(user._id, membership.houseId);

  if (!isOwner && !isManager)
    return Response.json({ success: false, error: "Forbidden" }, { status: 403 });

  const docs = await MemberDocument.find({
    membershipId,
    deletedAt: null,
  }).sort({ createdAt: -1 }).lean();

  // If requester is not manager (owner), filter sensitive manager fields if needed (owner sees own docs)
  return Response.json({ success: true, data: docs });
}

export async function POST(req, { params }) {
  // Member uploads a new document for their membership
  const { userId: clerkId } = await auth();
  if (!clerkId)
    return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const { membershipId } = await params;

  const user = await User.findOne({ clerkId, deletedAt: null });
  if (!user) return Response.json({ success: false, error: "User not found" }, { status: 404 });

  const membership = await Membership.findById(membershipId);
  if (!membership) return Response.json({ success: false, error: "Membership not found" }, { status: 404 });

  // Only the membership owner may upload
  if (String(membership.userId) !== String(user._id))
    return Response.json({ success: false, error: "Only member can upload documents" }, { status: 403 });

  let body;
  try {
    body = await req.json();
  } catch {
    return Response.json({ success: false, error: "Invalid JSON" }, { status: 400 });
  }

  const { fileUrl, fileName, docType } = body;
  if (!fileUrl) return Response.json({ success: false, error: "fileUrl required" }, { status: 400 });

  const doc = await MemberDocument.create({
    userId: user._id,
    membershipId: membership._id,
    houseId: membership.houseId,
    docType: docType || "id",
    fileUrl,
    fileName: fileName || null,
  });

  return Response.json({ success: true, data: doc }, { status: 201 });
}
