import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/db/mongoose";
import User from "@/models/User";
import Membership from "@/models/Membership";
import VaultItem from "@/models/VaultItem";
import { ROLES, VAULT_TYPE, VAULT_VISIBILITY } from "@/lib/constants";
import { getRequestIdentifier, limitApi } from "@/lib/rateLimit";

// GET /api/houses/[id]/vault
export async function GET(req, { params }) {
  // rate limit: vault reads
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

  // Members only see 'all' visibility items; managers see everything
  const filter = { houseId: id, deletedAt: null };
  if (!isManager) filter.visibility = VAULT_VISIBILITY.ALL;

  const items = await VaultItem.find(filter)
    .sort({ type: 1, createdAt: -1 })
    .lean();

  // Decrypt each item before returning
  const VaultModel = (await import("@/models/VaultItem")).default;
  const decrypted = items.map((item) => {
    // Re-instantiate as mongoose doc to use instance methods
    const doc = new VaultModel(item);
    return doc.toDecrypted();
  });

  return Response.json({ success: true, data: decrypted, isManager });
}

// POST /api/houses/[id]/vault
export async function POST(req, { params }) {
  // rate limit: vault create
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

  // Members can add items; visibility defaults to 'all'
  // Only managers can create manager_only items
  const {
    type,
    label,
    primaryValue,
    secondaryValue,
    notes,
    visibility,
    fileUrl,
    fileName,
  } = await req.json();

  if (!type || !Object.values(VAULT_TYPE).includes(type))
    return Response.json(
      { success: false, error: "Invalid type" },
      { status: 400 }
    );
  if (!label?.trim())
    return Response.json(
      { success: false, error: "Label required" },
      { status: 400 }
    );

  const isManager = membership.role === ROLES.MANAGER;
  const resolvedVisibility =
    visibility === VAULT_VISIBILITY.MANAGER_ONLY && isManager
      ? VAULT_VISIBILITY.MANAGER_ONLY
      : VAULT_VISIBILITY.ALL;

  const item = new VaultItem({
    houseId: id,
    createdBy: user._id,
    type,
    label: label.trim(),
    visibility: resolvedVisibility,
    fileUrl: fileUrl || null,
    fileName: fileName || null,
  });

  item.encryptFields({ primaryValue, secondaryValue, notes });
  await item.save();

  return Response.json(
    { success: true, data: item.toDecrypted() },
    { status: 201 }
  );
}

// PATCH /api/houses/[id]/vault
export async function PATCH(req, { params }) {
  // rate limit: vault update
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

  const itemUpdates = await req.json();

  const item = await VaultItem.findOne({ _id: itemUpdates._id });
  if (!item)
    return Response.json(
      { success: false, error: "Item not found" },
      { status: 404 }
    );

  const isManager = membership.role === ROLES.MANAGER;
  if (item.visibility === VAULT_VISIBILITY.MANAGER_ONLY && !isManager) {
    return Response.json(
      { success: false, error: "Unauthorized" },
      { status: 403 }
    );
  }

  // Only allow changing certain fields
  const updatableFields = [
    "label",
    "notes",
    "visibility",
    "fileUrl",
    "fileName",
  ];
  for (const key of Object.keys(itemUpdates)) {
    if (!updatableFields.includes(key)) {
      delete itemUpdates[key];
    }
  }

  // If visibility is being changed, ensure it's allowed
  if (itemUpdates.visibility && itemUpdates.visibility !== item.visibility) {
    if (
      itemUpdates.visibility === VAULT_VISIBILITY.MANAGER_ONLY &&
      !isManager
    ) {
      return Response.json(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      );
    }
  }

  await VaultItem.updateOne({ _id: itemUpdates._id }, { $set: itemUpdates });

  return Response.json({ success: true });
}

// DELETE /api/houses/[id]/vault
export async function DELETE(req, { params }) {
  // rate limit: vault delete
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

  const { itemId } = await req.json();

  const item = await VaultItem.findOne({ _id: itemId });
  if (!item)
    return Response.json(
      { success: false, error: "Item not found" },
      { status: 404 }
    );

  const isManager = membership.role === ROLES.MANAGER;
  if (item.visibility === VAULT_VISIBILITY.MANAGER_ONLY && !isManager) {
    return Response.json(
      { success: false, error: "Unauthorized" },
      { status: 403 }
    );
  }

  await VaultItem.deleteOne({ _id: itemId });

  return Response.json({ success: true });
}
