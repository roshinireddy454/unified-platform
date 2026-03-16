import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import {
  getCourseProgress,
  markAsCompleted,
  markAsInCompleted,
  updateLectureProgress,
  backfillCertificates,
} from "../controllers/courseProgress.controller.js";

const router = express.Router();

router.get("/:courseId", isAuthenticated, getCourseProgress);
router.post("/:courseId/lecture/:lectureId/view", isAuthenticated, updateLectureProgress);
router.post("/:courseId/complete", isAuthenticated, markAsCompleted);
router.post("/:courseId/incomplete", isAuthenticated, markAsInCompleted);

// One-time backfill: issues certificates for all existing completed courses
router.post("/backfill-certificates", isAuthenticated, backfillCertificates);

export default router;