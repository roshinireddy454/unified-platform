import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import {
  getStreamToken, createMeeting, getMeetings, getLiveMeetings,
  getMeetingById, getUpcomingMeetings, getPreviousMeetings,
  updateMeetingStatus, deleteMeeting, getRecordings,
  recordJoin, recordLeave, getMeetingAttendance, getMyAttendance,
  getEnrolledStudents,
  // Waiting room
  knockMeeting, admitStudent, rejectStudent, admitAllStudents, getWaitingRoom,
} from "../controllers/meeting.controller.js";

const router = express.Router();

// Auth & token
router.get("/stream-token", isAuthenticated, getStreamToken);

// CRUD
router.post("/", isAuthenticated, createMeeting);
router.get("/", isAuthenticated, getMeetings);
router.get("/live", isAuthenticated, getLiveMeetings);
router.get("/upcoming", isAuthenticated, getUpcomingMeetings);
router.get("/previous", isAuthenticated, getPreviousMeetings);
router.get("/recordings", isAuthenticated, getRecordings);
router.get("/enrolled-students", isAuthenticated, getEnrolledStudents);

// Status & delete
router.patch("/:meetingId/status", isAuthenticated, updateMeetingStatus);
router.delete("/:meetingId", isAuthenticated, deleteMeeting);

// ── Waiting room ──────────────────────────────────────────────
router.post("/:meetingId/knock", isAuthenticated, knockMeeting);           // Student knocks
router.get("/:meetingId/waiting-room", isAuthenticated, getWaitingRoom);   // Teacher fetches list
router.post("/:meetingId/admit/:userId", isAuthenticated, admitStudent);   // Teacher admits one
router.post("/:meetingId/reject/:userId", isAuthenticated, rejectStudent); // Teacher rejects one
router.post("/:meetingId/admit-all", isAuthenticated, admitAllStudents);   // Teacher admits all

// Attendance
router.post("/attendance/join", isAuthenticated, recordJoin);
router.post("/attendance/leave", isAuthenticated, recordLeave);
router.get("/attendance/my", isAuthenticated, getMyAttendance);
router.get("/:meetingId/attendance", isAuthenticated, getMeetingAttendance);

// Must be last (param catch-all)
router.get("/:meetingId", isAuthenticated, getMeetingById);

export default router;