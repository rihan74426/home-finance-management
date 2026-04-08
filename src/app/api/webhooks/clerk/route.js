import { headers } from "next/headers";
import { Webhook } from "svix";
import connectDB from "@/lib/db/mongoose";
import User from "@/models/User";

/**
 * POST /api/webhooks/clerk
 *
 * Receives Clerk webhook events and syncs user data to MongoDB.
 * Verified via svix signature — no auth session required.
 *
 * Events handled:
 *   user.created  → create User document
 *   user.updated  → update name, email, phone, avatar
 *   user.deleted  → soft-delete (set deletedAt)
 */
export async function POST(req) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error("CLERK_WEBHOOK_SECRET is not set");
    return Response.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  // ── Verify svix signature ──────────────────────────────────────────────────
  const headerPayload = await headers();
  const svixId = headerPayload.get("svix-id");
  const svixTimestamp = headerPayload.get("svix-timestamp");
  const svixSignature = headerPayload.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return Response.json({ error: "Missing svix headers" }, { status: 400 });
  }

  const payload = await req.text();

  const wh = new Webhook(WEBHOOK_SECRET);
  let event;

  try {
    event = wh.verify(payload, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    });
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return Response.json({ error: "Invalid signature" }, { status: 400 });
  }

  // ── Route to handler ───────────────────────────────────────────────────────
  await connectDB();

  const { type, data } = event;

  try {
    switch (type) {
      case "user.created":
        await handleUserCreated(data);
        break;
      case "user.updated":
        await handleUserUpdated(data);
        break;
      case "user.deleted":
        await handleUserDeleted(data);
        break;
      default:
        // Ignore unhandled event types silently
        break;
    }
  } catch (err) {
    console.error(`Webhook handler error [${type}]:`, err.message);
    return Response.json({ error: "Handler failed" }, { status: 500 });
  }

  return Response.json({ success: true });
}

// ── Helpers ────────────────────────────────────────────────────────────────────

/**
 * Extract the best available email from Clerk's emailAddresses array.
 * Prefers the primary email address.
 */
function extractEmail(data) {
  const addresses = data.email_addresses ?? [];
  if (!addresses.length) return null;

  const primary = addresses.find((e) => e.id === data.primary_email_address_id);
  return (primary ?? addresses[0]).email_address;
}

/**
 * Extract the best available phone from Clerk's phoneNumbers array.
 */
function extractPhone(data) {
  const phones = data.phone_numbers ?? [];
  if (!phones.length) return null;

  const primary = phones.find((p) => p.id === data.primary_phone_number_id);
  return (primary ?? phones[0]).phone_number ?? null;
}

/**
 * Build a display name from Clerk data.
 * Falls back through: full name → first name → username → "User"
 */
function extractName(data) {
  if (data.first_name && data.last_name) {
    return `${data.first_name} ${data.last_name}`.trim();
  }
  if (data.first_name) return data.first_name;
  if (data.username) return data.username;
  return "User";
}

// ── Event handlers ─────────────────────────────────────────────────────────────

async function handleUserCreated(data) {
  const email = extractEmail(data);

  if (!email) {
    // Phone-only users: use a placeholder so the unique constraint is satisfied
    // Real email can be added later via user.updated
    console.warn(`user.created: no email for clerkId ${data.id}`);
  }

  // Upsert: safe to re-run if webhook fires twice
  await User.findOneAndUpdate(
    { clerkId: data.id },
    {
      $setOnInsert: {
        clerkId: data.id,
        email: email ?? `${data.id}@placeholder.homy`,
        phone: extractPhone(data),
        name: extractName(data),
        avatarUrl: data.image_url ?? null,
      },
    },
    { upsert: true, new: true }
  );

  console.log(`user.created: synced ${data.id}`);
}

async function handleUserUpdated(data) {
  const email = extractEmail(data);
  const phone = extractPhone(data);
  const name = extractName(data);

  const update = {
    name,
    avatarUrl: data.image_url ?? null,
  };

  // Only update email/phone if they exist — don't wipe with null
  if (email) update.email = email;
  if (phone !== undefined) update.phone = phone;

  const user = await User.findOneAndUpdate(
    { clerkId: data.id },
    { $set: update },
    { new: true }
  );

  if (!user) {
    // Edge case: updated event arrived before created (rare but possible)
    console.warn(`user.updated: clerkId ${data.id} not found — creating`);
    await handleUserCreated(data);
    return;
  }

  console.log(`user.updated: synced ${data.id}`);
}

async function handleUserDeleted(data) {
  const user = await User.findOneAndUpdate(
    { clerkId: data.id },
    { $set: { deletedAt: new Date() } },
    { new: true }
  );

  if (!user) {
    console.warn(`user.deleted: clerkId ${data.id} not found`);
    return;
  }

  console.log(`user.deleted: soft-deleted ${data.id}`);
}
