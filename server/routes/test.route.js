import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import {
  createTest,
  addQuestionsToTest,
  getTestsByCourse,
  getTestById,
  updateTest,
  togglePublishTest,
  deleteTest,
  getTestAnalytics,
  getStudentTests,
  startTest,
  submitTest,
  getMyResult,
  getMyAllResults,
} from "../controllers/test.controller.js";

const router = express.Router();

// ── Instructor routes ──
router.post("/", isAuthenticated, createTest);
router.get("/instructor/course/:courseId", isAuthenticated, getTestsByCourse);
router.get("/:testId/details", isAuthenticated, getTestById);
router.put("/:testId", isAuthenticated, updateTest);
router.post("/:testId/questions", isAuthenticated, addQuestionsToTest);
router.patch("/:testId/publish", isAuthenticated, togglePublishTest);
router.delete("/:testId", isAuthenticated, deleteTest);
router.get("/:testId/analytics", isAuthenticated, getTestAnalytics);

// ── Student routes ──
router.get("/student/course/:courseId", isAuthenticated, getStudentTests);
router.get("/my-results", isAuthenticated, getMyAllResults);
router.get("/:testId/start", isAuthenticated, startTest);
router.post("/:testId/submit", isAuthenticated, submitTest);
router.get("/:testId/result", isAuthenticated, getMyResult);

export default router;
