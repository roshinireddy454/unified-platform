import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import {
  getChatHistory,
  sendMessage,
  deleteMessage,
  toggleChat,
} from "../controllers/chat.controller.js";

const router = express.Router();

// GET  /api/v1/chat/:meetingId          — load chat history
router.get("/:meetingId",              isAuthenticated, getChatHistory);

// POST /api/v1/chat/:meetingId          — HTTP fallback to send a message
router.post("/:meetingId",             isAuthenticated, sendMessage);

// DELETE /api/v1/chat/:messageId        — delete a single message
router.delete("/:messageId",           isAuthenticated, deleteMessage);

// PATCH /api/v1/chat/:meetingId/toggle-chat  — instructor enable/disable chat
router.patch("/:meetingId/toggle-chat", isAuthenticated, toggleChat);

export default router;