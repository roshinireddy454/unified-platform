import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { generateSummary, getSummaries, getSummaryById } from "../controllers/summary.controller.js";

const router = express.Router();
router.post("/generate", isAuthenticated, generateSummary);
router.get("/", isAuthenticated, getSummaries);
router.get("/:meetingId", isAuthenticated, getSummaryById);

export default router;
