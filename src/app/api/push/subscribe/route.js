import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/db/mongoose";
import User from "@/models/User";

/**
 * POST /api/push/subscribe
 * Save FCM registration token for the current user.
 *
 * Body: { token: string, platform: "web" | "ios" | "android" }
 */
export async function POST(req) {
  const { userId: clerkId } = await auth();
  if (!clerkId)
    return Response.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );

  await connectDB();

  const user = await User.findOne({ clerkId, deletedAt: null });
  if (!user)
    return Response.json(
      { success: false, error: "User not found" },
      { status: 404 }
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

  const { token, platform = "web" } = body;
  if (!token?.trim())
    return Response.json(
      { success: false, error: "token required" },
      { status: 400 }
    );

  // Store FCM tokens in user.fcmTokens array (add field to User model or use a simple array)
  // We store as a set — no duplicate tokens
  await User.findByIdAndUpdate(user._id, {
    $addToSet: {
      fcmTokens: { token: token.trim(), platform, updatedAt: new Date() },
    },
  });

  return Response.json({ success: true });
}

/**
 * DELETE /api/push/subscribe
 * Remove FCM token (on logout / permission revoke)
 */
export async function DELETE(req) {
  const { userId: clerkId } = await auth();
  if (!clerkId)
    return Response.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );

  await connectDB();
  const user = await User.findOne({ clerkId, deletedAt: null });
  if (!user)
    return Response.json(
      { success: false, error: "User not found" },
      { status: 404 }
    );

  let body;
  try {
    body = await req.json();
  } catch {
    return Response.json({ success: false }, { status: 200 });
  }

  if (body?.token) {
    await User.findByIdAndUpdate(user._id, {
      $pull: { fcmTokens: { token: body.token } },
    });
  }

  return Response.json({ success: true });
}
