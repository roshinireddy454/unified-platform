import { ChatMessage } from "../models/chatMessage.model.js";
import { Meeting }     from "../models/meeting.model.js";
import { User }        from "../models/user.model.js";

// ─── GET /api/v1/chat/:meetingId ──────────────────────────────
// Returns the last 200 messages for a meeting (newest first → sorted asc for display)
export const getChatHistory = async (req, res) => {
  try {
    const { meetingId } = req.params;

    const messages = await ChatMessage.find({
      meetingId,
      isDeleted: false,
    })
      .sort({ createdAt: 1 })
      .limit(200)
      .select("-__v");

    return res.status(200).json({ success: true, messages });
  } catch (err) {
    console.error("getChatHistory:", err);
    return res.status(500).json({ success: false, message: "Failed to fetch chat history." });
  }
};

// ─── POST /api/v1/chat/:meetingId ─────────────────────────────
// HTTP fallback to send a message (socket is primary path)
// This handles the case where the socket is not available or the
// client prefers HTTP.
export const sendMessage = async (req, res) => {
  try {
    const { meetingId } = req.params;
    const { message }   = req.body;
    const userId        = req.id;

    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: "Message cannot be empty." });
    }

    const user = await User.findById(userId).select("name role photoUrl");
    if (!user) return res.status(404).json({ success: false, message: "User not found." });

    // Check if chat is disabled
    const meeting = await Meeting.findOne({ meetingId }).select("chatDisabled");
    if (meeting?.chatDisabled && user.role !== "instructor") {
      return res.status(403).json({ success: false, message: "Chat has been disabled by the host." });
    }

    const msg = await ChatMessage.create({
      meetingId,
      sender:      userId,
      senderName:  user.name,
      senderRole:  user.role,
      senderPhoto: user.photoUrl || "",
      message:     message.trim().slice(0, 2000),
    });

    const payload = {
      _id:         msg._id.toString(),
      meetingId:   msg.meetingId,
      sender:      msg.sender.toString(),
      senderName:  msg.senderName,
      senderRole:  msg.senderRole,
      senderPhoto: msg.senderPhoto,
      message:     msg.message,
      createdAt:   msg.createdAt,
      isDeleted:   false,
    };

    // Broadcast via socket to everyone in the chat room
    if (req.io) {
      req.io.to(`chat:${meetingId}`).emit("chat-message", payload);
    }

    return res.status(201).json({ success: true, message: payload });
  } catch (err) {
    console.error("sendMessage:", err);
    return res.status(500).json({ success: false, message: "Failed to send message." });
  }
};

// ─── DELETE /api/v1/chat/:messageId ──────────────────────────
export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId        = req.id;
    const user          = await User.findById(userId).select("role");

    const msg = await ChatMessage.findById(messageId);
    if (!msg) return res.status(404).json({ success: false, message: "Message not found." });

    const isOwner      = msg.sender.toString() === userId.toString();
    const isInstructor = user.role === "instructor";
    if (!isOwner && !isInstructor)
      return res.status(403).json({ success: false, message: "Not authorised to delete this message." });

    msg.isDeleted = true;
    msg.deletedAt = new Date();
    await msg.save();

    if (req.io) {
      req.io.to(`chat:${msg.meetingId}`).emit("chat-message-deleted", { messageId });
    }

    return res.status(200).json({ success: true, messageId });
  } catch (err) {
    console.error("deleteMessage:", err);
    return res.status(500).json({ success: false, message: "Failed to delete message." });
  }
};

// ─── PATCH /api/v1/chat/:meetingId/toggle-chat ───────────────
export const toggleChat = async (req, res) => {
  try {
    const { meetingId } = req.params;
    const userId        = req.id;
    const user          = await User.findById(userId).select("role");

    if (user.role !== "instructor")
      return res.status(403).json({ success: false, message: "Only instructors can toggle chat." });

    const meeting = await Meeting.findOne({ meetingId });
    if (!meeting) return res.status(404).json({ success: false, message: "Meeting not found." });

    const newValue = !meeting.chatDisabled;
    await Meeting.findOneAndUpdate({ meetingId }, { $set: { chatDisabled: newValue } });

    if (req.io) {
      req.io.to(`chat:${meetingId}`).emit("chat-toggled", { chatDisabled: newValue });
    }

    return res.status(200).json({ success: true, chatDisabled: newValue });
  } catch (err) {
    console.error("toggleChat:", err);
    return res.status(500).json({ success: false, message: "Failed to toggle chat." });
  }
};