import "server-only";
import connectDB from "@/lib/db/mongoose";
import Notification from "@/models/Notification";

/**
 * Create a notification for a user.
 * Safe to call from any API route — fire-and-forget, never throws.
 */
export async function createNotification({
  userId,
  houseId,
  type,
  title,
  body = "",
  meta = {},
}) {
  try {
    await connectDB();
    await Notification.create({ userId, houseId, type, title, body, meta });
  } catch (err) {
    console.error("createNotification failed:", err.message);
  }
}
