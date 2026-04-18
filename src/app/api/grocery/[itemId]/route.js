import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/db/mongoose";
import User from "@/models/User";
import Membership from "@/models/Membership";
import GroceryItem from "@/models/Grocery";

// PATCH /api/grocery/[itemId] — mark bought / update item
export async function PATCH(req, { params }) {
  const { userId: clerkId } = await auth();
  if (!clerkId)
    return Response.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );

  await connectDB();
  const { itemId } = await params;

  const user = await User.findOne({ clerkId, deletedAt: null });
  if (!user)
    return Response.json(
      { success: false, error: "User not found" },
      { status: 404 }
    );

  const item = await GroceryItem.findById(itemId);
  if (!item)
    return Response.json(
      { success: false, error: "Item not found" },
      { status: 404 }
    );

  const membership = await Membership.findOne({
    userId: user._id,
    houseId: item.houseId,
    isActive: true,
  });
  if (!membership)
    return Response.json(
      { success: false, error: "Not a member" },
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

  const { name, quantity, category, note, isRecurring, isBought } = body;

  if (typeof isBought !== "undefined" && item.isBought !== isBought) {
    item.isBought = isBought;
    item.boughtBy = isBought ? user._id : null;
    item.boughtAt = isBought ? new Date() : null;
  }

  if (name?.trim()) item.name = name.trim();
  if (quantity !== undefined) item.quantity = quantity?.trim() ?? "";
  if (category) item.category = category;
  if (note !== undefined) item.note = note?.trim() ?? "";
  if (typeof isRecurring !== "undefined") item.isRecurring = !!isRecurring;

  await item.save();

  const populated = await item.populate([
    { path: "addedBy", select: "name avatarUrl" },
    { path: "boughtBy", select: "name" },
  ]);
  return Response.json({ success: true, data: populated });
}

// DELETE /api/grocery/[itemId]
export async function DELETE(req, { params }) {
  const { userId: clerkId } = await auth();
  if (!clerkId)
    return Response.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );

  await connectDB();
  const { itemId } = await params;

  const user = await User.findOne({ clerkId, deletedAt: null });
  if (!user)
    return Response.json(
      { success: false, error: "User not found" },
      { status: 404 }
    );

  const item = await GroceryItem.findById(itemId);
  if (!item)
    return Response.json(
      { success: false, error: "Item not found" },
      { status: 404 }
    );

  const membership = await Membership.findOne({
    userId: user._id,
    houseId: item.houseId,
    isActive: true,
  });
  if (!membership)
    return Response.json(
      { success: false, error: "Not a member" },
      { status: 403 }
    );

  await GroceryItem.findByIdAndDelete(itemId);
  return Response.json({ success: true });
}
