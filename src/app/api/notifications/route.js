import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/db/mongoose";
import User from "@/models/User";
import Notification from "@/models/Notification";
import { getRequestIdentifier, limitApi } from "@/lib/rateLimit";

// GET /api/notifications?limit=20&unreadOnly=true
export async function GET(req) {
  // rate limit: read
  const identifier = getRequestIdentifier(req);
  const maybeBlocked = limitApi(identifier, "read");
  if (maybeBlocked) return maybeBlocked;

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

  const { searchParams } = new URL(req.url);
  const limit = Math.min(parseInt(searchParams.get("limit") || "30"), 50);
  const unreadOnly = searchParams.get("unreadOnly") === "true";

  const query = { userId: user._id };
  if (unreadOnly) query.isRead = false;

  const notifications = await Notification.find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  const unreadCount = await Notification.countDocuments({
    userId: user._id,
    isRead: false,
  });

  return Response.json({ success: true, data: notifications, unreadCount });
}

// PATCH /api/notifications — mark all read (or specific ids)
export async function PATCH(req) {
  // rate limit: write
  const identifier = getRequestIdentifier(req);
  const maybeBlocked = limitApi(identifier, "write");
  if (maybeBlocked) return maybeBlocked;

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

  let ids;
  try {
    const body = await req.json();
    ids = body.ids; // optional array of specific IDs
  } catch {
    // ignore — mark all
  }

  const query = { userId: user._id, isRead: false };
  if (ids?.length) query._id = { $in: ids };

  await Notification.updateMany(query, {
    $set: { isRead: true, readAt: new Date() },
  });

  return Response.json({ success: true });
}
