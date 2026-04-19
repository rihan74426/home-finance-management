import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/db/mongoose";
import User from "@/models/User";
import Membership from "@/models/Membership";
import MemberPermission, {
  PERMISSIONS,
  ROLE_DEFAULTS,
} from "@/models/MemberPermission";

// GET /api/memberships/[membershipId]/permissions
// Returns effective permissions (role defaults + overrides)
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

  // Only the manager or the member themselves can view permissions
  const isOwn = String(membership.userId) === String(user._id);
  const isManager = await Membership.isManager(user._id, membership.houseId);
  if (!isOwn && !isManager)
    return Response.json(
      { success: false, error: "Forbidden" },
      { status: 403 }
    );

  const permDoc = await MemberPermission.findOne({ membershipId }).lean();
  const defaults = ROLE_DEFAULTS[membership.role] || ROLE_DEFAULTS.member;
  const overrides = permDoc ? Object.fromEntries(permDoc.overrides) : {};

  // Merge: defaults + overrides
  const effective = { ...defaults, ...overrides };

  return Response.json({
    success: true,
    data: {
      role: membership.role,
      defaults,
      overrides,
      effective,
      allPermissions: Object.values(PERMISSIONS),
    },
  });
}

// PATCH /api/memberships/[membershipId]/permissions
// Manager sets permission overrides for a member
export async function PATCH(req, { params }) {
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

  const isManager = await Membership.isManager(user._id, membership.houseId);
  if (!isManager)
    return Response.json(
      { success: false, error: "Manager only" },
      { status: 403 }
    );

  // Cannot change manager's own permissions
  if (String(membership.userId) === String(user._id))
    return Response.json(
      { success: false, error: "Cannot change your own permissions" },
      { status: 400 }
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

  // body.overrides: { [PERMISSION_KEY]: boolean }
  const { overrides } = body;
  if (!overrides || typeof overrides !== "object")
    return Response.json(
      { success: false, error: "overrides object required" },
      { status: 400 }
    );

  // Validate all keys
  const validKeys = Object.values(PERMISSIONS);
  const invalidKeys = Object.keys(overrides).filter(
    (k) => !validKeys.includes(k)
  );
  if (invalidKeys.length > 0)
    return Response.json(
      {
        success: false,
        error: `Invalid permission keys: ${invalidKeys.join(", ")}`,
      },
      { status: 400 }
    );

  const permDoc = await MemberPermission.findOneAndUpdate(
    { membershipId },
    {
      $set: {
        membershipId,
        houseId: membership.houseId,
        updatedBy: user._id,
        // Merge new overrides with existing
        ...Object.fromEntries(
          Object.entries(overrides).map(([k, v]) => [`overrides.${k}`, v])
        ),
      },
    },
    { upsert: true, new: true }
  );

  return Response.json({ success: true, data: permDoc });
}

// DELETE /api/memberships/[membershipId]/permissions — reset all overrides
export async function DELETE(req, { params }) {
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

  const isManager = await Membership.isManager(user._id, membership.houseId);
  if (!isManager)
    return Response.json(
      { success: false, error: "Manager only" },
      { status: 403 }
    );

  await MemberPermission.findOneAndDelete({ membershipId });
  return Response.json({ success: true });
}
