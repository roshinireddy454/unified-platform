import { Poll } from "../models/poll.model.js";
import { User } from "../models/user.model.js";

// ─── Helpers ──────────────────────────────────────────────────
const getTotalVotes = (poll) => poll.options.reduce((s, o) => s + o.voters.length, 0);

const publicPoll = (poll, userId) => {
  const total = getTotalVotes(poll);
  return {
    _id:        poll._id,
    meetingId:  poll.meetingId,
    question:   poll.question,
    status:     poll.status,
    createdAt:  poll.createdAt,
    closedAt:   poll.closedAt,
    totalVotes: total,
    myVote: userId
      ? (poll.options.find((o) => o.voters.some((v) => v.toString() === userId.toString()))?._id ?? null)
      : null,
    options: poll.options.map((o) => ({
      _id:       o._id,
      text:      o.text,
      voteCount: o.voters.length,
      votedByMe: userId ? o.voters.some((v) => v.toString() === userId.toString()) : false,
      percentage: total === 0 ? 0 : Math.round((o.voters.length / total) * 100),
    })),
  };
};

/**
 * Broadcast a poll event to EVERYONE in the meeting:
 *  - `meeting:${meetingId}:host`       — the instructor
 *  - `meeting-room:${meetingId}`       — all students (joined via join-student-room)
 *
 * FIX: Previously the code only emitted to these two rooms but students
 * were never joining `meeting-room:${meetingId}`. Now they join it
 * automatically via `join-student-room` in index.js.
 */
const broadcastPoll = (io, meetingId, event, payload) => {
  if (!io) return;
  io.to(`meeting:${meetingId}:host`).emit(event, payload);
  io.to(`meeting-room:${meetingId}`).emit(event, payload);
};

// ─── Create poll (instructor only) ───────────────────────────
// POST /api/v1/poll/:meetingId
export const createPoll = async (req, res) => {
  try {
    const { meetingId } = req.params;
    const { question, options } = req.body;
    const user = await User.findById(req.id).select("role");
    if (user.role !== "instructor")
      return res.status(403).json({ success: false, message: "Only instructors can create polls." });

    if (!question?.trim())
      return res.status(400).json({ success: false, message: "Question is required." });
    if (!Array.isArray(options) || options.length < 2)
      return res.status(400).json({ success: false, message: "At least 2 options are required." });

    const poll = await Poll.create({
      meetingId,
      createdBy: req.id,
      question:  question.trim(),
      options:   options.map((o) => ({ text: o.trim(), voters: [] })),
      status:    "active",
    });

    const payload = publicPoll(poll, req.id);

    // FIX: broadcast to host + all students in meeting-room
    broadcastPoll(req.io, meetingId, "poll-launched", payload);

    return res.status(201).json({ success: true, poll: payload });
  } catch (err) {
    console.error("createPoll:", err);
    return res.status(500).json({ success: false, message: "Failed to create poll." });
  }
};

// ─── Vote (student) ───────────────────────────────────────────
// POST /api/v1/poll/:pollId/vote
export const vote = async (req, res) => {
  try {
    const { pollId } = req.params;
    const { optionId } = req.body;
    const userId = req.id;

    const poll = await Poll.findById(pollId);
    if (!poll) return res.status(404).json({ success: false, message: "Poll not found." });
    if (poll.status === "closed")
      return res.status(400).json({ success: false, message: "This poll is closed." });

    const alreadyVoted = poll.options.some((o) =>
      o.voters.some((v) => v.toString() === userId.toString())
    );
    if (alreadyVoted)
      return res.status(400).json({ success: false, message: "You have already voted." });

    const option = poll.options.id(optionId);
    if (!option) return res.status(404).json({ success: false, message: "Option not found." });

    option.voters.push(userId);
    await poll.save();

    const payload = publicPoll(poll, userId);

    // FIX: broadcast updated results to everyone immediately
    broadcastPoll(req.io, poll.meetingId, "poll-updated", payload);

    return res.status(200).json({ success: true, poll: payload });
  } catch (err) {
    console.error("vote:", err);
    return res.status(500).json({ success: false, message: "Failed to record vote." });
  }
};

// ─── Close poll (instructor only) ────────────────────────────
// PATCH /api/v1/poll/:pollId/close
export const closePoll = async (req, res) => {
  try {
    const { pollId } = req.params;
    const user = await User.findById(req.id).select("role");
    if (user.role !== "instructor")
      return res.status(403).json({ success: false, message: "Only instructors can close polls." });

    const poll = await Poll.findOneAndUpdate(
      { _id: pollId, createdBy: req.id },
      { status: "closed", closedAt: new Date() },
      { new: true }
    );
    if (!poll) return res.status(404).json({ success: false, message: "Poll not found." });

    const payload = publicPoll(poll, req.id);
    broadcastPoll(req.io, poll.meetingId, "poll-closed", payload);

    return res.status(200).json({ success: true, poll: payload });
  } catch (err) {
    console.error("closePoll:", err);
    return res.status(500).json({ success: false, message: "Failed to close poll." });
  }
};

// ─── Get all polls for a meeting ──────────────────────────────
// GET /api/v1/poll/:meetingId
export const getPollsByMeeting = async (req, res) => {
  try {
    const { meetingId } = req.params;
    const polls = await Poll.find({ meetingId }).sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      polls:   polls.map((p) => publicPoll(p, req.id)),
    });
  } catch (err) {
    console.error("getPollsByMeeting:", err);
    return res.status(500).json({ success: false, message: "Failed to fetch polls." });
  }
};

// ─── Get single poll ──────────────────────────────────────────
// GET /api/v1/poll/single/:pollId
export const getPollById = async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.pollId);
    if (!poll) return res.status(404).json({ success: false, message: "Poll not found." });
    return res.status(200).json({ success: true, poll: publicPoll(poll, req.id) });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to fetch poll." });
  }
};
