import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/db/mongoose";
import User from "@/models/User";
import Membership from "@/models/Membership";
import { Thread, Message } from "@/models/Thread";

// GET /api/threads/[threadId]/messages?cursor=<msgId>&limit=30
export async function GET(req, { params }) {
  const { userId: clerkId } = await auth();
  if (!clerkId)
    return Response.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );

  await connectDB();
  const { threadId } = await params;

  const user = await User.findOne({ clerkId, deletedAt: null });
  if (!user)
    return Response.json(
      { success: false, error: "User not found" },
      { status: 404 }
    );

  const thread = await Thread.findOne({ _id: threadId, deletedAt: null });
  if (!thread)
    return Response.json(
      { success: false, error: "Thread not found" },
      { status: 404 }
    );

  // Verify membership
  const membership = await Membership.findOne({
    userId: user._id,
    houseId: thread.houseId,
    isActive: true,
  });
  if (!membership)
    return Response.json(
      { success: false, error: "Not a member" },
      { status: 403 }
    );

  const { searchParams } = new URL(req.url);
  const cursor = searchParams.get("cursor"); // oldest message id for pagination
  const limit = Math.min(parseInt(searchParams.get("limit") || "40"), 100);
  const after = searchParams.get("after"); // poll: get messages newer than this id

  let query = { threadId, deletedAt: null };

  if (after) {
    // Polling mode — get messages newer than 'after' id
    const ref = await Message.findById(after).select("createdAt").lean();
    if (ref) query.createdAt = { $gt: ref.createdAt };
  } else if (cursor) {
    // Pagination mode — get messages older than cursor
    const ref = await Message.findById(cursor).select("createdAt").lean();
    if (ref) query.createdAt = { $lt: ref.createdAt };
  }

  const messages = await Message.find(query)
    .populate("senderId", "name avatarUrl")
    .populate("replyTo", "text senderId")
    .sort({ createdAt: after ? 1 : -1 }) // poll: asc, paginate: desc
    .limit(limit)
    .lean();

  // For pagination, reverse so oldest is first in array
  const ordered = after ? messages : messages.reverse();

  return Response.json({
    success: true,
    data: ordered,
    hasMore: !after && messages.length === limit,
  });
}

// POST /api/threads/[threadId]/messages — send a message
export async function POST(req, { params }) {
  const { userId: clerkId } = await auth();
  if (!clerkId)
    return Response.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );

  await connectDB();
  const { threadId } = await params;

  const user = await User.findOne({ clerkId, deletedAt: null });
  if (!user)
    return Response.json(
      { success: false, error: "User not found" },
      { status: 404 }
    );

  const thread = await Thread.findOne({ _id: threadId, deletedAt: null });
  if (!thread)
    return Response.json(
      { success: false, error: "Thread not found" },
      { status: 404 }
    );

  const membership = await Membership.findOne({
    userId: user._id,
    houseId: thread.houseId,
    isActive: true,
  });
  if (!membership)
    return Response.json(
      { success: false, error: "Not a member" },
      { status: 403 }
    );

  const { text, replyTo } = await req.json();
  if (!text?.trim())
    return Response.json(
      { success: false, error: "Message cannot be empty" },
      { status: 400 }
    );
  if (text.trim().length > 2000)
    return Response.json(
      { success: false, error: "Message too long (max 2000 chars)" },
      { status: 400 }
    );

  const message = await Message.create({
    threadId,
    houseId: thread.houseId,
    senderId: user._id,
    type: "text",
    text: text.trim(),
    replyTo: replyTo || null,
    readBy: [user._id],
  });

  // Update thread last message preview
  await Thread.findByIdAndUpdate(threadId, {
    $set: {
      lastMessageAt: message.createdAt,
      lastMessageText: text.trim().slice(0, 200),
    },
  });

  await message.populate("senderId", "name avatarUrl");
  return Response.json({ success: true, data: message }, { status: 201 });
}
