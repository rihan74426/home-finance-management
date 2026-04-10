import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/db/mongoose";
import User from "@/models/User";
import Membership from "@/models/Membership";
import GroceryItem from "@/models/Grocery";

// GET /api/houses/[id]/grocery — fetch all active items grouped by category
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

  const { searchParams } = new URL(req.url);
  const showBought = searchParams.get("showBought") === "true";

  const query = { houseId: id };
  if (!showBought) query.isBought = false;

  const items = await GroceryItem.find(query)
    .populate("addedBy", "name avatarUrl")
    .populate("boughtBy", "name")
    .sort({ isBought: 1, category: 1, createdAt: -1 })
    .lean();

  return Response.json({ success: true, data: items });
}

// POST /api/houses/[id]/grocery — add a new item
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

  const { name, quantity, category, note, isRecurring } = await req.json();

  if (!name?.trim())
    return Response.json(
      { success: false, error: "Item name required" },
      { status: 400 }
    );

  const VALID_CATEGORIES = [
    "dairy",
    "vegetables",
    "fruits",
    "meat",
    "grains",
    "beverages",
    "snacks",
    "cleaning",
    "toiletries",
    "other",
  ];

  const item = await GroceryItem.create({
    houseId: id,
    addedBy: user._id,
    name: name.trim(),
    quantity: quantity?.trim() || "",
    category: VALID_CATEGORIES.includes(category) ? category : "other",
    note: note?.trim() || "",
    isRecurring: !!isRecurring,
  });

  const populated = await item.populate("addedBy", "name avatarUrl");
  return Response.json({ success: true, data: populated }, { status: 201 });
}
