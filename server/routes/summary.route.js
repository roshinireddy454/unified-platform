import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import {
  generateSummary,
  getSummaries,
  getSummaryById,
  deleteSummary,
  downloadSummaryPdf,
} from "../controllers/summary.controller.js";

const router = express.Router();

// Generate summary (called from live class toolbar)
router.post("/generate", isAuthenticated, generateSummary);

// Download PDF — works for old AND new summaries.
// Regenerates on-the-fly if file is missing from disk.
// Must be defined BEFORE /:meetingId to avoid param collision.
router.get("/download/:meetingId", isAuthenticated, downloadSummaryPdf);

// List summaries
router.get("/", isAuthenticated, getSummaries);

// Get single summary detail
router.get("/:meetingId", isAuthenticated, getSummaryById);

// Delete summary (instructor only)
router.delete("/:meetingId", isAuthenticated, deleteSummary);

export default router;