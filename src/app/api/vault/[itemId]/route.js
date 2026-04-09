import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/db/mongoose";
import User from "@/models/User";
import Membership from "@/models/Membership";
import VaultItem from "@/models/VaultItem";
import { ROLES, VAULT_VISIBILITY } from "@/lib/constants";

async function getActorAndItem(clerkId, itemId) {
  const user = await User.findOne({ clerkId, deletedAt: null });
  if (!user) return { error: "User not found", status: 404 };
  const item = await VaultItem.findOne({ _id: itemId, deletedAt: null });
  if (!item) return { error: "Item not found", status: 404 };
  const membership = await Membership.findOne({
    userId: user._id,
    houseId: item.houseId,
    isActive: true,
  });
  if (!membership) return { error: "Not a member", status: 403 };
  return { user, item, membership };
}

// PATCH /api/vault/[itemId]
export async function PATCH(req, { params }) {
  const { userId: clerkId } = await auth();
  if (!clerkId)
    return Response.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );

  await connectDB();
  const { itemId } = await params;
  const result = await getActorAndItem(clerkId, itemId);
  if (result.error)
    return Response.json(
      { success: false, error: result.error },
      { status: result.status }
    );

  const { user, item, membership } = result;
  const isManager = membership.role === ROLES.MANAGER;
  // Only creator or manager can edit
  if (String(item.createdBy) !== String(user._id) && !isManager) {
    return Response.json(
      { success: false, error: "Not authorized" },
      { status: 403 }
    );
  }

  const { label, type, primaryValue, secondaryValue, notes, visibility } =
    await req.json();
  if (label) item.label = label.trim();
  if (type) item.type = type;
  if (visibility === VAULT_VISIBILITY.MANAGER_ONLY && isManager)
    item.visibility = VAULT_VISIBILITY.MANAGER_ONLY;
  else if (visibility === VAULT_VISIBILITY.ALL)
    item.visibility = VAULT_VISIBILITY.ALL;

  item.encryptFields({ primaryValue, secondaryValue, notes });
  await item.save();

  return Response.json({ success: true, data: item.toDecrypted() });
}

// DELETE /api/vault/[itemId]
export async function DELETE(req, { params }) {
  const { userId: clerkId } = await auth();
  if (!clerkId)
    return Response.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );

  await connectDB();
  const { itemId } = await params;
  const result = await getActorAndItem(clerkId, itemId);
  if (result.error)
    return Response.json(
      { success: false, error: result.error },
      { status: result.status }
    );

  const { user, item, membership } = result;
  const isManager = membership.role === ROLES.MANAGER;
  if (String(item.createdBy) !== String(user._id) && !isManager) {
    return Response.json(
      { success: false, error: "Not authorized" },
      { status: 403 }
    );
  }

  await VaultItem.findByIdAndUpdate(itemId, {
    $set: { deletedAt: new Date() },
  });
  return Response.json({ success: true });
}
