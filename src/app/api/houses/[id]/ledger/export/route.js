import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongoose";
import User from "@/models/User";
import Membership from "@/models/Membership";
import House from "@/models/House";
import LedgerEntry from "@/models/Ledgerentry";
import { ROLES } from "@/lib/constants";
import { renderToBuffer } from "@react-pdf/renderer";
import { createElement } from "react";
import LedgerPDF from "@/components/LedgerPDF";

// GET /api/houses/[id]/ledger/export?membershipId=xxx
export async function GET(req, { params }) {
  const { userId: clerkId } = await auth();
  if (!clerkId)
    return Response.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );

  await connectDB();
  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const membershipId = searchParams.get("membershipId");

  const user = await User.findOne({ clerkId, deletedAt: null });
  if (!user)
    return Response.json(
      { success: false, error: "User not found" },
      { status: 404 }
    );

  const requester = await Membership.findOne({
    userId: user._id,
    houseId: id,
    isActive: true,
  });
  if (!requester)
    return Response.json(
      { success: false, error: "Not a member" },
      { status: 403 }
    );

  const isManager = requester.role === ROLES.MANAGER;

  // Determine whose ledger to export
  let targetMembership;
  if (membershipId && isManager) {
    // Manager exporting any member's ledger
    targetMembership = await Membership.findOne({
      _id: membershipId,
      houseId: id,
    })
      .populate("userId", "name email")
      .lean();
  } else {
    // Member exporting their own
    targetMembership = await Membership.findOne({
      _id: requester._id,
      houseId: id,
    })
      .populate("userId", "name email")
      .lean();
  }

  if (!targetMembership)
    return Response.json(
      { success: false, error: "Membership not found" },
      { status: 404 }
    );

  const house = await House.findById(id).lean();
  if (!house)
    return Response.json(
      { success: false, error: "House not found" },
      { status: 404 }
    );

  const entries = await LedgerEntry.find({
    houseId: id,
    membershipId: targetMembership._id,
  })
    .sort({ periodStart: -1 })
    .lean();

  // Build PDF
  const pdfBuffer = await renderToBuffer(
    createElement(LedgerPDF, { house, membership: targetMembership, entries })
  );

  const memberName =
    targetMembership.userId?.name?.replace(/\s+/g, "_") || "member";
  const filename = `ledger_${memberName}_${new Date().toISOString().slice(0, 10)}.pdf`;

  return new NextResponse(pdfBuffer, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Length": String(pdfBuffer.length),
    },
  });
}
