import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/db/mongoose";
import User from "@/models/User";
import Membership from "@/models/Membership";
import Poll from "@/models/Polls";

// POST /api/polls/[pollId]/vote
export async function POST(req, { params }) {
  const { userId: clerkId } = await auth();
  if (!clerkId)
    return Response.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );

  await connectDB();
  const { pollId } = await params;

  const user = await User.findOne({ clerkId, deletedAt: null });
  if (!user)
    return Response.json(
      { success: false, error: "User not found" },
      { status: 404 }
    );

  const poll = await Poll.findById(pollId);
  if (!poll)
    return Response.json(
      { success: false, error: "Poll not found" },
      { status: 404 }
    );

  const membership = await Membership.findOne({
    userId: user._id,
    houseId: poll.houseId,
    isActive: true,
  });
  if (!membership)
    return Response.json(
      { success: false, error: "Not a member" },
      { status: 403 }
    );

  if (poll.isClosed || (poll.deadline && poll.deadline < new Date()))
    return Response.json(
      { success: false, error: "Poll is closed" },
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

  const { optionId } = body;
  if (!optionId)
    return Response.json(
      { success: false, error: "optionId required" },
      { status: 400 }
    );

  const validOption = poll.options.find((o) => o.id === optionId);
  if (!validOption)
    return Response.json(
      { success: false, error: "Invalid option" },
      { status: 400 }
    );

  // Remove existing vote(s) if not allowMultiple
  const existingVoteIndex = poll.votes.findIndex(
    (v) => String(v.userId) === String(user._id) && v.optionId === optionId
  );

  if (existingVoteIndex !== -1) {
    // Toggle off — remove vote
    poll.votes.splice(existingVoteIndex, 1);
  } else {
    if (!poll.allowMultiple) {
      // Remove any previous vote from this user
      poll.votes = poll.votes.filter(
        (v) => String(v.userId) !== String(user._id)
      );
    }
    poll.votes.push({ userId: user._id, optionId, votedAt: new Date() });
  }

  await poll.save();

  // Return updated results
  const tally = {};
  poll.options.forEach((opt) => {
    tally[opt.id] = 0;
  });
  poll.votes.forEach((v) => {
    if (tally[v.optionId] !== undefined) tally[v.optionId]++;
  });
  const results = poll.options.map((opt) => ({
    id: opt.id,
    label: opt.label,
    count: tally[opt.id],
    pct: poll.votes.length
      ? Math.round((tally[opt.id] / poll.votes.length) * 100)
      : 0,
  }));

  const myVote =
    poll.votes.find((v) => String(v.userId) === String(user._id))?.optionId ??
    null;

  return Response.json({
    success: true,
    data: { results, myVote, totalVotes: poll.votes.length },
  });
}

// POST /api/polls/[pollId]/close
export async function DELETE(req, { params }) {
  const { userId: clerkId } = await auth();
  if (!clerkId)
    return Response.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );

  await connectDB();
  const { pollId } = await params;

  const user = await User.findOne({ clerkId, deletedAt: null });
  if (!user)
    return Response.json(
      { success: false, error: "User not found" },
      { status: 404 }
    );

  const poll = await Poll.findById(pollId);
  if (!poll)
    return Response.json(
      { success: false, error: "Poll not found" },
      { status: 404 }
    );

  const isManager = await Membership.isManager(user._id, poll.houseId);
  const isCreator = String(poll.createdBy) === String(user._id);

  if (!isManager && !isCreator)
    return Response.json(
      { success: false, error: "Not authorized" },
      { status: 403 }
    );

  await Poll.findByIdAndUpdate(pollId, { $set: { isClosed: true } });
  return Response.json({ success: true });
}
