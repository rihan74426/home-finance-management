import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/db/mongoose";
import User from "@/models/User";
import Membership from "@/models/Membership";
import Poll from "@/models/Polls";

// GET /api/houses/[id]/polls
export async function GET(req, { params }) {
  const { userId: clerkId } = await auth();
  if (!clerkId)
    return Response.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );

  await connectDB();
  const { id } = await params;

  const user = await User.findOne({ clerkId, deletedAt: null });
  if (!user)
    return Response.json(
      { success: false, error: "User not found" },
      { status: 404 }
    );

  const membership = await Membership.findOne({
    userId: user._id,
    houseId: id,
    isActive: true,
  });
  if (!membership)
    return Response.json(
      { success: false, error: "Not a member" },
      { status: 403 }
    );

  const polls = await Poll.find({ houseId: id })
    .populate("createdBy", "name avatarUrl")
    .sort({ createdAt: -1 })
    .lean();

  // Attach results and user's vote to each poll
  const myMembershipId = membership._id;
  const enriched = polls.map((poll) => {
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

    const myVote = poll.isAnonymous
      ? null
      : (poll.votes.find((v) => String(v.userId) === String(user._id))
          ?.optionId ?? null);

    // Strip voter identities if anonymous
    const safeVotes = poll.isAnonymous
      ? poll.votes.map((v) => ({ optionId: v.optionId, votedAt: v.votedAt }))
      : poll.votes;

    return {
      ...poll,
      votes: safeVotes,
      results,
      myVote,
      totalVotes: poll.votes.length,
    };
  });

  return Response.json({ success: true, data: enriched });
}

// POST /api/houses/[id]/polls
export async function POST(req, { params }) {
  const { userId: clerkId } = await auth();
  if (!clerkId)
    return Response.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );

  await connectDB();
  const { id } = await params;

  const user = await User.findOne({ clerkId, deletedAt: null });
  if (!user)
    return Response.json(
      { success: false, error: "User not found" },
      { status: 404 }
    );

  const membership = await Membership.findOne({
    userId: user._id,
    houseId: id,
    isActive: true,
  });
  if (!membership)
    return Response.json(
      { success: false, error: "Not a member" },
      { status: 403 }
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

  const { question, options, allowMultiple, isAnonymous, deadline, threadId } =
    body;

  if (!question?.trim())
    return Response.json(
      { success: false, error: "Question required" },
      { status: 400 }
    );

  if (!Array.isArray(options) || options.length < 2)
    return Response.json(
      { success: false, error: "At least 2 options required" },
      { status: 400 }
    );

  const formattedOptions = options
    .map((label, i) => ({
      id: `opt_${i + 1}`,
      label: String(label).trim().slice(0, 100),
    }))
    .filter((o) => o.label);

  if (formattedOptions.length < 2)
    return Response.json(
      { success: false, error: "At least 2 non-empty options required" },
      { status: 400 }
    );

  const poll = await Poll.create({
    houseId: id,
    threadId: threadId || null,
    createdBy: user._id,
    question: question.trim(),
    options: formattedOptions,
    allowMultiple: !!allowMultiple,
    isAnonymous: !!isAnonymous,
    deadline: deadline ? new Date(deadline) : null,
  });

  await poll.populate("createdBy", "name avatarUrl");

  return Response.json({ success: true, data: poll }, { status: 201 });
}
