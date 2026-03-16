import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import {
  getMyTasks,
  createTask,
  updateTask,
  toggleTaskStatus,
  deleteTask,
  clearCompleted,
  syncLmsTasks,
} from "../controllers/task.controller.js";

const router = express.Router();

// All routes require authentication — users only see their own tasks
router.get("/",                   isAuthenticated, getMyTasks);
router.post("/",                  isAuthenticated, createTask);
router.post("/sync-lms",          isAuthenticated, syncLmsTasks);
router.delete("/completed",       isAuthenticated, clearCompleted);
router.put("/:taskId",            isAuthenticated, updateTask);
router.patch("/:taskId/toggle",   isAuthenticated, toggleTaskStatus);
router.delete("/:taskId",         isAuthenticated, deleteTask);

export default router;