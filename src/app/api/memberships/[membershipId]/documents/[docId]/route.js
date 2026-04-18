import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/db/mongoose";
import User from "@/models/User";
import Membership from "@/models/Membership";
import MemberDocument from "@/models/MemberDocument";

// POST /api/memberships/[membershipId]/documents/[docId] — toggle verification (manager only)
export async function POST(req, { params }) {
  const { userId: clerkId } = await auth();
  if (!clerkId)
    return Response.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );

  await connectDB();
  const { membershipId, docId } = await params;

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

  const isManager = await Membership.isManager(user._id, membership.houseId);
  if (!isManager)
    return Response.json(
      { success: false, error: "Manager only" },
      { status: 403 }
    );

  if (!membership.isActive)
    return Response.json(
      { success: false, error: "Membership is inactive" },
      { status: 403 }
    );

  const doc = await MemberDocument.findOne({
    _id: docId,
    membershipId,
    deletedAt: null,
  });
  if (!doc)
    return Response.json(
      { success: false, error: "Document not found" },
      { status: 404 }
    );

  doc.verified = !doc.verified;
  if (doc.verified) {
    doc.verifiedBy = user._id;
    doc.verifiedAt = new Date();
  } else {
    doc.verifiedBy = null;
    doc.verifiedAt = null;
  }
  await doc.save();

  return Response.json({ success: true, data: doc });
}

// DELETE /api/memberships/[membershipId]/documents/[docId] — delete document
export async function DELETE(req, { params }) {
  const { userId: clerkId } = await auth();
  if (!clerkId)
    return Response.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );

  await connectDB();
  const { membershipId, docId } = await params;

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

  if (!isOwner && !isManager)
    return Response.json(
      { success: false, error: "Forbidden" },
      { status: 403 }
    );

  await MemberDocument.findByIdAndUpdate(docId, {
    $set: { deletedAt: new Date() },
  });
  return Response.json({ success: true });
}
