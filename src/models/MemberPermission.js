import mongoose, { Schema } from "mongoose";

/**
 * MemberPermission
 *
 * Per-membership permission overrides. The base role (manager/member/guest)
 * sets defaults. This table allows granting or revoking individual permissions
 * without changing the role.
 *
 * Examples:
 *   - Give a member permission to create threads (usually manager-only on free plan)
 *   - Revoke a member's ability to add vault items
 *   - Give a guest read access to the ledger for their own entries
 *
 * Resolution order: explicit override > role default
 */

export const PERMISSIONS = {
  // Vault
  VAULT_READ: "vault_read",
  VAULT_WRITE: "vault_write",

  // Ledger
  LEDGER_READ_OWN: "ledger_read_own",
  LEDGER_READ_ALL: "ledger_read_all",
  LEDGER_WRITE: "ledger_write",

  // Tasks
  TASK_CREATE: "task_create",
  TASK_ASSIGN: "task_assign",
  TASK_DELETE_ANY: "task_delete_any",

  // Chat
  THREAD_CREATE: "thread_create",
  MESSAGE_DELETE_ANY: "message_delete_any",

  // Members
  MEMBER_INVITE: "member_invite",
  MEMBER_REMOVE: "member_remove",

  // Bills
  BILL_CREATE: "bill_create",
  BILL_SPLIT: "bill_split",

  // House
  HOUSE_SETTINGS: "house_settings",
  RULE_MANAGE: "rule_manage",

  // Grocery
  GROCERY_DELETE_ANY: "grocery_delete_any",
};

// Default permissions by role
export const ROLE_DEFAULTS = {
  manager: Object.values(PERMISSIONS).reduce(
    (acc, p) => ({ ...acc, [p]: true }),
    {}
  ),
  member: {
    vault_read: true,
    vault_write: true,
    ledger_read_own: true,
    ledger_read_all: false,
    ledger_write: false,
    task_create: true,
    task_assign: false,
    task_delete_any: false,
    thread_create: false,
    message_delete_any: false,
    member_invite: false,
    member_remove: false,
    bill_create: false,
    bill_split: false,
    house_settings: false,
    rule_manage: false,
    grocery_delete_any: false,
  },
  guest: {
    vault_read: true,
    vault_write: false,
    ledger_read_own: true,
    ledger_read_all: false,
    ledger_write: false,
    task_create: false,
    task_assign: false,
    task_delete_any: false,
    thread_create: false,
    message_delete_any: false,
    member_invite: false,
    member_remove: false,
    bill_create: false,
    bill_split: false,
    house_settings: false,
    rule_manage: false,
    grocery_delete_any: false,
  },
};

const MemberPermissionSchema = new Schema(
  {
    membershipId: {
      type: Schema.Types.ObjectId,
      ref: "Membership",
      required: true,
      index: true,
    },
    houseId: {
      type: Schema.Types.ObjectId,
      ref: "House",
      required: true,
      index: true,
    },
    // Map of permission key → boolean override
    overrides: {
      type: Map,
      of: Boolean,
      default: {},
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

MemberPermissionSchema.index({ membershipId: 1 }, { unique: true });

export default mongoose.models.MemberPermission ||
  mongoose.model("MemberPermission", MemberPermissionSchema);
