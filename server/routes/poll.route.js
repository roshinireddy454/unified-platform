import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import {
  createPoll,
  vote,
  closePoll,
  getPollsByMeeting,
  getPollById,
} from "../controllers/poll.controller.js";

const router = express.Router();

router.post("/:meetingId",          isAuthenticated, createPoll);
router.get("/single/:pollId",       isAuthenticated, getPollById);
router.get("/:meetingId",           isAuthenticated, getPollsByMeeting);
router.post("/:pollId/vote",        isAuthenticated, vote);
router.patch("/:pollId/close",      isAuthenticated, closePoll);

export default router;