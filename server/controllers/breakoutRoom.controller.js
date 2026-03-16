import { BreakoutRoom } from "../models/breakoutRoom.model.js";
import { Meeting }      from "../models/meeting.model.js";
import { User }         from "../models/user.model.js";

// ─── helpers ─────────────────────────────────────────────────
const makeStreamCallId = (meetingId, roomIndex) =>
  `${meetingId}_br_${roomIndex}`.toLowerCase().replace(/[^a-z0-9_-]/g, "_");

/**
 * Emit an event to EVERY student assigned to any room in the session,
 * plus the host room. Used after assignment updates so everyone sees
 * the latest session state instantly.
 */
const broadcastSessionUpdate = (io, meetingId, session) => {
  if (!io) return;
  io.to(`meeting:${meetingId}:host`).emit("breakout-updated", { session });
  // Also emit to the generic meeting room for any listeners
  io.to(`meeting-room:${meetingId}`).emit("breakout-updated", { session });
};

/**
 * Notify each student which specific room they are in.
 * This is the key event that triggers the student's UI to move them.
 */
const notifyAssignments = (io, meetingId, session) => {
  if (!io) return;
  session.rooms.forEach((room) => {
    room.participants.forEach(({ userId }) => {
      io.to(`meeting:${meetingId}:student:${userId.toString()}`).emit("breakout-assigned", {
        roomIndex:    room.roomIndex,
        roomName:     room.name,
        streamCallId: room.streamCallId,
      });
    });
  });
};

// ─── Create breakout rooms ────────────────────────────────────
// POST /api/v1/breakout/:meetingId
export const createBreakoutRooms = async (req, res) => {
  try {
    const { meetingId } = req.params;
    const { roomCount = 2, durationMinutes = 0, names = [] } = req.body;
    const hostId = req.id;

    const meeting = await Meeting.findOne({ meetingId });
    if (!meeting)
      return res.status(404).json({ success: false, message: "Meeting not found." });
    if (meeting.createdBy.toString() !== hostId)
      return res.status(403).json({ success: false, message: "Only the host can create breakout rooms." });

    // Close any existing active session first
    await BreakoutRoom.updateMany(
      { meetingId, status: { $in: ["pending", "active"] } },
      { status: "closed", closedAt: new Date() }
    );

    const count = Math.min(Math.max(Number(roomCount), 1), 20);
    const rooms = Array.from({ length: count }, (_, i) => ({
      roomIndex:    i + 1,
      name:         names[i] || `Group ${i + 1}`,
      streamCallId: makeStreamCallId(meetingId, i + 1),
      participants: [],
    }));

    const session = await BreakoutRoom.create({
      meetingId,
      rooms,
      durationMinutes: Number(durationMinutes),
      createdBy: hostId,
      status: "pending",
    });

    if (req.io) {
      // Notify host — also push to the generic meeting-room so the host panel updates
      req.io.to(`meeting:${meetingId}:host`).emit("breakout-created", { session });
      req.io.to(`meeting-room:${meetingId}`).emit("breakout-created", { session });
    }

    return res.status(201).json({ success: true, session });
  } catch (err) {
    console.error("createBreakoutRooms", err);
    return res.status(500).json({ success: false, message: "Failed to create breakout rooms." });
  }
};

// ─── Get active session for a meeting ────────────────────────
// GET /api/v1/breakout/:meetingId
export const getBreakoutSession = async (req, res) => {
  try {
    const { meetingId } = req.params;
    const session = await BreakoutRoom.findOne({
      meetingId,
      status: { $in: ["pending", "active"] },
    }).sort({ createdAt: -1 });

    return res.status(200).json({ success: true, session: session || null });
  } catch (err) {
    console.error("getBreakoutSession", err);
    return res.status(500).json({ success: false, message: "Failed to fetch breakout session." });
  }
};

// ─── Get ALL sessions for a meeting (history) ────────────────
// GET /api/v1/breakout/:meetingId/all
export const getAllBreakoutSessions = async (req, res) => {
  try {
    const { meetingId } = req.params;
    const sessions = await BreakoutRoom.find({ meetingId }).sort({ createdAt: -1 }).limit(10);
    return res.status(200).json({ success: true, sessions });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to fetch breakout sessions." });
  }
};

// ─── Assign participants (manual) ─────────────────────────────
// POST /api/v1/breakout/:meetingId/assign
// body: { assignments: [{ userId, roomIndex }] }
export const assignParticipants = async (req, res) => {
  try {
    const { meetingId } = req.params;
    const { assignments = [] } = req.body;
    const hostId = req.id;

    const session = await BreakoutRoom.findOne({
      meetingId,
      status: { $in: ["pending", "active"] },
    }).sort({ createdAt: -1 });

    if (!session)
      return res.status(404).json({ success: false, message: "No active breakout session found." });
    if (session.createdBy.toString() !== hostId)
      return res.status(403).json({ success: false, message: "Only the host can assign participants." });

    // Reset all participant lists
    session.rooms.forEach((r) => { r.participants = []; });

    const userIds = [...new Set(assignments.map((a) => a.userId))];
    const users   = await User.find({ _id: { $in: userIds } }).select("name photoUrl");
    const userMap = Object.fromEntries(users.map((u) => [u._id.toString(), u]));

    for (const { userId, roomIndex } of assignments) {
      const room = session.rooms.find((r) => r.roomIndex === Number(roomIndex));
      if (!room) continue;
      const u = userMap[userId.toString()];
      if (!u) continue;
      room.participants.push({ userId: u._id, name: u.name, photoUrl: u.photoUrl || "" });
    }

    await session.save();

    if (req.io) {
      broadcastSessionUpdate(req.io, meetingId, session);
      // FIX: Notify each assigned student immediately of their room assignment
      notifyAssignments(req.io, meetingId, session);
    }

    return res.status(200).json({ success: true, session });
  } catch (err) {
    console.error("assignParticipants", err);
    return res.status(500).json({ success: false, message: "Failed to assign participants." });
  }
};

// ─── Auto-assign participants evenly ─────────────────────────
// POST /api/v1/breakout/:meetingId/auto-assign
export const autoAssignParticipants = async (req, res) => {
  try {
    const { meetingId } = req.params;
    const { userIds = [] } = req.body;
    const hostId = req.id;

    const session = await BreakoutRoom.findOne({
      meetingId,
      status: { $in: ["pending", "active"] },
    }).sort({ createdAt: -1 });

    if (!session)
      return res.status(404).json({ success: false, message: "No active breakout session found." });
    if (session.createdBy.toString() !== hostId)
      return res.status(403).json({ success: false, message: "Only the host can assign participants." });

    const users    = await User.find({ _id: { $in: userIds } }).select("name photoUrl");
    const shuffled = [...users].sort(() => Math.random() - 0.5);

    session.rooms.forEach((r) => { r.participants = []; });
    shuffled.forEach((u, i) => {
      const room = session.rooms[i % session.rooms.length];
      room.participants.push({ userId: u._id, name: u.name, photoUrl: u.photoUrl || "" });
    });

    await session.save();

    if (req.io) {
      broadcastSessionUpdate(req.io, meetingId, session);
      // FIX: Notify each student their auto-assigned room
      notifyAssignments(req.io, meetingId, session);
    }

    return res.status(200).json({ success: true, session });
  } catch (err) {
    console.error("autoAssignParticipants", err);
    return res.status(500).json({ success: false, message: "Failed to auto-assign participants." });
  }
};

// ─── Rename a room ────────────────────────────────────────────
export const renameRoom = async (req, res) => {
  try {
    const { meetingId, roomIndex } = req.params;
    const { name } = req.body;
    const hostId = req.id;

    const session = await BreakoutRoom.findOne({
      meetingId,
      status: { $in: ["pending", "active"] },
    }).sort({ createdAt: -1 });

    if (!session)
      return res.status(404).json({ success: false, message: "No active breakout session." });
    if (session.createdBy.toString() !== hostId)
      return res.status(403).json({ success: false, message: "Only the host can rename rooms." });

    const room = session.rooms.find((r) => r.roomIndex === Number(roomIndex));
    if (!room)
      return res.status(404).json({ success: false, message: "Room not found." });

    room.name = name || room.name;
    await session.save();

    if (req.io) broadcastSessionUpdate(req.io, meetingId, session);

    return res.status(200).json({ success: true, session });
  } catch (err) {
    console.error("renameRoom", err);
    return res.status(500).json({ success: false, message: "Failed to rename room." });
  }
};

// ─── Move a participant to a different room ───────────────────
export const moveParticipant = async (req, res) => {
  try {
    const { meetingId } = req.params;
    const { userId, toRoomIndex } = req.body;
    const hostId = req.id;

    const session = await BreakoutRoom.findOne({
      meetingId,
      status: { $in: ["pending", "active"] },
    }).sort({ createdAt: -1 });

    if (!session)
      return res.status(404).json({ success: false, message: "No active breakout session." });
    if (session.createdBy.toString() !== hostId)
      return res.status(403).json({ success: false, message: "Only the host can move participants." });

    let participant = null;
    session.rooms.forEach((r) => {
      const idx = r.participants.findIndex((p) => p.userId.toString() === userId.toString());
      if (idx !== -1) [participant] = r.participants.splice(idx, 1);
    });

    const targetRoom = session.rooms.find((r) => r.roomIndex === Number(toRoomIndex));
    if (!targetRoom)
      return res.status(404).json({ success: false, message: "Target room not found." });

    if (participant) targetRoom.participants.push(participant);
    await session.save();

    if (req.io) {
      // Tell the individual student they've been moved — triggers immediate UI change
      req.io.to(`meeting:${meetingId}:student:${userId.toString()}`).emit("breakout-moved", {
        roomIndex:    targetRoom.roomIndex,
        roomName:     targetRoom.name,
        streamCallId: targetRoom.streamCallId,
      });
      broadcastSessionUpdate(req.io, meetingId, session);
    }

    return res.status(200).json({ success: true, session });
  } catch (err) {
    console.error("moveParticipant", err);
    return res.status(500).json({ success: false, message: "Failed to move participant." });
  }
};

// ─── Start the breakout session ───────────────────────────────
export const startBreakout = async (req, res) => {
  try {
    const { meetingId } = req.params;
    const hostId = req.id;

    const session = await BreakoutRoom.findOne({
      meetingId,
      status: { $in: ["pending", "active"] },
    }).sort({ createdAt: -1 });

    if (!session)
      return res.status(404).json({ success: false, message: "No breakout session found." });
    if (session.createdBy.toString() !== hostId)
      return res.status(403).json({ success: false, message: "Only the host can start breakout rooms." });

    session.status    = "active";
    session.startedAt = new Date();
    if (session.durationMinutes > 0) {
      session.endsAt = new Date(Date.now() + session.durationMinutes * 60 * 1000);
    }
    await session.save();

    if (req.io) {
      // Notify every participant which room they're in — triggers auto-navigation
      session.rooms.forEach((room) => {
        room.participants.forEach(({ userId }) => {
          req.io
            .to(`meeting:${meetingId}:student:${userId.toString()}`)
            .emit("breakout-started", {
              roomIndex:       room.roomIndex,
              roomName:        room.name,
              streamCallId:    room.streamCallId,
              endsAt:          session.endsAt,
              durationMinutes: session.durationMinutes,
            });
        });
      });
      // FIX: Also push to meeting-room so host sees the update immediately
      req.io.to(`meeting:${meetingId}:host`).emit("breakout-started", {
        session,
        endsAt: session.endsAt,
      });
      req.io.to(`meeting-room:${meetingId}`).emit("breakout-started", {
        session,
        endsAt: session.endsAt,
      });
    }

    return res.status(200).json({ success: true, session });
  } catch (err) {
    console.error("startBreakout", err);
    return res.status(500).json({ success: false, message: "Failed to start breakout rooms." });
  }
};

// ─── Close breakout session ───────────────────────────────────
export const closeBreakout = async (req, res) => {
  try {
    const { meetingId } = req.params;
    const hostId = req.id;

    const session = await BreakoutRoom.findOne({
      meetingId,
      status: { $in: ["pending", "active"] },
    }).sort({ createdAt: -1 });

    if (!session)
      return res.status(404).json({ success: false, message: "No active breakout session." });
    if (session.createdBy.toString() !== hostId)
      return res.status(403).json({ success: false, message: "Only the host can close breakout rooms." });

    session.status   = "closed";
    session.closedAt = new Date();
    await session.save();

    if (req.io) {
      // Tell every student in every room to return to main meeting
      session.rooms.forEach((room) => {
        room.participants.forEach(({ userId }) => {
          req.io
            .to(`meeting:${meetingId}:student:${userId.toString()}`)
            .emit("breakout-closed", { meetingId });
        });
      });
      req.io.to(`meeting:${meetingId}:host`).emit("breakout-closed", { meetingId });
      req.io.to(`meeting-room:${meetingId}`).emit("breakout-closed", { meetingId });
    }

    return res.status(200).json({ success: true, message: "Breakout rooms closed. Everyone brought back." });
  } catch (err) {
    console.error("closeBreakout", err);
    return res.status(500).json({ success: false, message: "Failed to close breakout rooms." });
  }
};

// ─── Send a broadcast message to all breakout rooms ───────────
export const broadcastMessage = async (req, res) => {
  try {
    const { meetingId } = req.params;
    const { message } = req.body;
    const hostId = req.id;

    const session = await BreakoutRoom.findOne({
      meetingId,
      status: "active",
    }).sort({ createdAt: -1 });

    if (!session)
      return res.status(404).json({ success: false, message: "No active breakout session." });
    if (session.createdBy.toString() !== hostId)
      return res.status(403).json({ success: false, message: "Only the host can broadcast." });

    if (req.io) {
      session.rooms.forEach((room) => {
        room.participants.forEach(({ userId }) => {
          req.io
            .to(`meeting:${meetingId}:student:${userId.toString()}`)
            .emit("breakout-broadcast", { message, from: "Host" });
        });
      });
    }

    return res.status(200).json({ success: true, message: "Broadcast sent." });
  } catch (err) {
    console.error("broadcastMessage", err);
    return res.status(500).json({ success: false, message: "Failed to broadcast." });
  }
};
