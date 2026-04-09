import { auth, clerkClient } from "@clerk/nextjs/server";
import connectDB from "@/lib/db/mongoose";
import House from "@/models/House";
import User from "@/models/User";
import Membership from "@/models/Membership";
import { Thread } from "@/models/Thread";
import { ROLES, HOUSE_TYPE, PLAN } from "@/lib/constants";

// ── GET /api/houses ───────────────────────────────────────────────────────────
// Returns all active houses the current user belongs to.
export async function GET() {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return Response.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  await connectDB();

  // In GET /api/houses, replace the 404 block with:
  let user = await User.findOne({ clerkId, deletedAt: null });
  if (!user) {
    // Auto-create from Clerk session as fallback
    const clerkUser = await (await clerkClient()).users.getUser(clerkId);
    const email =
      clerkUser.emailAddresses.find(
        (e) => e.id === clerkUser.primaryEmailAddressId
      )?.emailAddress ?? `${clerkId}@placeholder.homy`;
    user = await User.create({
      clerkId,
      email,
      name:
        [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") ||
        clerkUser.username ||
        "User",
      avatarUrl: clerkUser.imageUrl ?? null,
    });
  }
  // Find all active memberships for this user, populate house data
  const memberships = await Membership.find({
    userId: user._id,
    isActive: true,
  }).populate({
    path: "houseId",
    match: { deletedAt: null },
    select:
      "name address type avatarUrl plan currency rentDueDay managerId createdAt",
  });

  // Filter out any where houseId didn't match (deleted houses)
  const houses = memberships
    .filter((m) => m.houseId)
    .map((m) => ({
      ...m.houseId.toObject(),
      membershipId: m._id,
      role: m.role,
      roomLabel: m.roomLabel,
      joinedAt: m.joinedAt,
    }));

  return Response.json({ success: true, data: houses });
}

// ── POST /api/houses ──────────────────────────────────────────────────────────
// Creates a new house. Creator becomes the manager.
// Also creates: Membership (manager role) + default General thread.
export async function POST(req) {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return Response.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  await connectDB();

  const user = await User.findOne({ clerkId, deletedAt: null });
  if (!user) {
    return Response.json(
      { success: false, error: "User not found" },
      { status: 404 }
    );
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return Response.json(
      { success: false, error: "Invalid JSON" },
      { status: 400 }
    );
  }

  const { name, type, address, currency, rentDueDay, rules } = body;

  // ── Validation ─────────────────────────────────────────────────────────────
  if (!name || typeof name !== "string" || !name.trim()) {
    return Response.json(
      { success: false, error: "House name is required" },
      { status: 400 }
    );
  }
  if (name.trim().length > 100) {
    return Response.json(
      { success: false, error: "House name too long (max 100 chars)" },
      { status: 400 }
    );
  }
  if (type && !Object.values(HOUSE_TYPE).includes(type)) {
    return Response.json(
      { success: false, error: "Invalid house type" },
      { status: 400 }
    );
  }
  if (rentDueDay !== undefined) {
    const day = Number(rentDueDay);
    if (!Number.isInteger(day) || day < 1 || day > 28) {
      return Response.json(
        { success: false, error: "rentDueDay must be 1–28" },
        { status: 400 }
      );
    }
  }

  // ── Free plan: max 1 house as manager ─────────────────────────────────────
  // (Pro plan check can be added later when Stripe is wired up)
  if (user.plan === PLAN.FREE) {
    const existingManagerMembership = await Membership.findOne({
      userId: user._id,
      role: ROLES.MANAGER,
      isActive: true,
    }).populate({ path: "houseId", match: { deletedAt: null } });

    if (existingManagerMembership?.houseId) {
      return Response.json(
        {
          success: false,
          error:
            "Free plan allows managing 1 house. Upgrade to Pro to create more.",
        },
        { status: 403 }
      );
    }
  }

  // ── Create house ───────────────────────────────────────────────────────────
  const house = await House.create({
    name: name.trim(),
    type: type ?? HOUSE_TYPE.FLAT,
    address: {
      line1: address?.line1?.trim() ?? "",
      line2: address?.line2?.trim() ?? "",
      city: address?.city?.trim() ?? "",
      country: address?.country?.trim() ?? "",
      postcode: address?.postcode?.trim() ?? "",
    },
    managerId: user._id,
    currency: currency ?? "BDT",
    rentDueDay: rentDueDay ?? 1,
    plan: user.plan,
    rules: rules?.trim() ?? "",
  });

  // ── Create manager membership ──────────────────────────────────────────────
  const membership = await Membership.create({
    userId: user._id,
    houseId: house._id,
    role: ROLES.MANAGER,
    joinedAt: new Date(),
    isActive: true,
  });

  // ── Create default General thread ─────────────────────────────────────────
  await Thread.create({
    houseId: house._id,
    createdBy: user._id,
    name: "General",
    type: "general",
    description: "The main channel for your house.",
  });

  return Response.json(
    {
      success: true,
      data: {
        house,
        membershipId: membership._id,
        role: ROLES.MANAGER,
      },
    },
    { status: 201 }
  );
}
