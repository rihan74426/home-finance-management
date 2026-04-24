import "server-only";

import Membership from "@/models/Membership";
import MemberPermission, {
  PERMISSIONS,
  ROLE_DEFAULTS,
} from "@/models/MemberPermission";

/**
 * Get effective permissions for a user in a house.
 *
 * Resolution order: explicit override > role default
 *
 * @param {ObjectId|string} userId
 * @param {ObjectId|string} houseId
 * @returns {{ permissions: object, membership: object, isManager: boolean }}
 */
export async function getEffectivePermissions(userId, houseId) {
  const membership = await Membership.findOne({
    userId,
    houseId,
    isActive: true,
  }).lean();

  if (!membership)
    return { permissions: null, membership: null, isManager: false };

  // Managers have all permissions — no need to check overrides
  if (membership.role === "manager") {
    return {
      permissions: ROLE_DEFAULTS.manager,
      membership,
      isManager: true,
    };
  }

  const defaults = ROLE_DEFAULTS[membership.role] || ROLE_DEFAULTS.member;

  // Load any overrides for this membership
  const permDoc = await MemberPermission.findOne({
    membershipId: membership._id,
  }).lean();

  let overrides = {};
  if (permDoc?.overrides) {
    // Mongoose Map stored as object or Map — handle both
    if (permDoc.overrides instanceof Map) {
      overrides = Object.fromEntries(permDoc.overrides);
    } else {
      overrides = permDoc.overrides;
    }
  }

  const effective = { ...defaults, ...overrides };

  return {
    permissions: effective,
    membership,
    isManager: false,
  };
}

/**
 * Check a single permission for a user in a house.
 * Returns true if allowed.
 */
export async function hasPermission(userId, houseId, permission) {
  const { permissions, isManager } = await getEffectivePermissions(
    userId,
    houseId
  );
  if (!permissions) return false;
  if (isManager) return true;
  return !!permissions[permission];
}

/**
 * Response helper — returns a 403 Response if permission is denied.
 * Returns null if allowed.
 */
export async function requirePermission(userId, houseId, permission) {
  const allowed = await hasPermission(userId, houseId, permission);
  if (!allowed) {
    return Response.json(
      {
        success: false,
        error: "You don't have permission to do this. Ask your house manager.",
      },
      { status: 403 }
    );
  }
  return null;
}

export { PERMISSIONS };
