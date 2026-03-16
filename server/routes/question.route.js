import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import {
  createQuestion,
  getMyQuestions,
  updateQuestion,
  deleteQuestion,
} from "../controllers/question.controller.js";

const router = express.Router();

router.post("/", isAuthenticated, createQuestion);
router.get("/", isAuthenticated, getMyQuestions);
router.put("/:questionId", isAuthenticated, updateQuestion);
router.delete("/:questionId", isAuthenticated, deleteQuestion);

export default router;
