import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import {
  createDoubt,
  getMyDoubts,
  getAllDoubts,
  replyToDoubt,
  resolveDoubt,
} from "../controllers/doubt.controller.js";

const router = express.Router();

router.post("/", isAuthenticated, createDoubt);
router.get("/my", isAuthenticated, getMyDoubts);
router.get("/all", isAuthenticated, getAllDoubts);
router.post("/:doubtId/reply", isAuthenticated, replyToDoubt);
router.patch("/:doubtId/resolve", isAuthenticated, resolveDoubt);

export default router;