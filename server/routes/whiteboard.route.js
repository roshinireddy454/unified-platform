import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import {
  getWhiteboard,
  saveWhiteboard,
  toggleStudentDrawing,
} from "../controllers/whiteboard.controller.js";

const router = express.Router();

router.get("/:meetingId",              isAuthenticated, getWhiteboard);
router.post("/:meetingId/save",        isAuthenticated, saveWhiteboard);
router.patch("/:meetingId/permissions",isAuthenticated, toggleStudentDrawing);

export default router;