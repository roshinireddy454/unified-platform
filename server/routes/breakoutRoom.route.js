import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import {
  createBreakoutRooms,
  getBreakoutSession,
  getAllBreakoutSessions,
  assignParticipants,
  autoAssignParticipants,
  renameRoom,
  moveParticipant,
  startBreakout,
  closeBreakout,
  broadcastMessage,
} from "../controllers/breakoutRoom.controller.js";

const router = express.Router();

// Get current active session for a meeting
router.get("/:meetingId",                          isAuthenticated, getBreakoutSession);
// Get all sessions (history)
router.get("/:meetingId/all",                      isAuthenticated, getAllBreakoutSessions);

// Host creates the rooms config
router.post("/:meetingId",                         isAuthenticated, createBreakoutRooms);

// Assign participants
router.post("/:meetingId/assign",                  isAuthenticated, assignParticipants);
router.post("/:meetingId/auto-assign",             isAuthenticated, autoAssignParticipants);

// Move a participant to a different room (host only)
router.patch("/:meetingId/move",                   isAuthenticated, moveParticipant);

// Rename a specific room
router.patch("/:meetingId/room/:roomIndex/rename", isAuthenticated, renameRoom);

// Lifecycle
router.post("/:meetingId/start",                   isAuthenticated, startBreakout);
router.post("/:meetingId/close",                   isAuthenticated, closeBreakout);

// Broadcast message to all participants
router.post("/:meetingId/broadcast",               isAuthenticated, broadcastMessage);

export default router;
