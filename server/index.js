import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./database/db.js";
import fs from "fs";
import http from "http";
import { Server as SocketServer } from "socket.io";

dotenv.config();

// ── Routes ────────────────────────────────────────────────────
import userRoutes           from "./routes/user.route.js";
import courseRoutes         from "./routes/course.route.js";
import courseProgressRoutes from "./routes/courseProgress.route.js";
import purchaseRoutes       from "./routes/purchase.route.js";
import meetingRoutes        from "./routes/meeting.route.js";
import summaryRoutes        from "./routes/summary.route.js";
import mediaRoutes          from "./routes/media.route.js";
import doubtRoutes          from "./routes/doubt.route.js";
import certificateRoutes    from "./routes/certificate.route.js";
import chatbotRoutes        from "./routes/chatbot.route.js";
import whiteboardRoutes     from "./routes/whiteboard.route.js";
import taskRoutes           from "./routes/task.route.js";
import notificationRoutes   from "./routes/notification.route.js";
import chatRoutes           from "./routes/chat.route.js";
import pollRoutes           from "./routes/poll.route.js";
import questionRoutes       from "./routes/question.route.js";
import testRoutes           from "./routes/test.route.js";
import breakoutRoomRoutes   from "./routes/breakoutRoom.route.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app       = express();
const server    = http.createServer(app);

const io = new SocketServer(server, {
  maxHttpBufferSize: 2e6,
  cors: {
    origin:      process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  },
});

// Ensure directories exist
fs.mkdirSync(path.join(__dirname, "../uploads"),          { recursive: true });
fs.mkdirSync(path.join(__dirname, "../public/summaries"), { recursive: true });

// ── Middleware ────────────────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
  origin:      process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
}));
app.use("/summaries", express.static(path.join(__dirname, "../public/summaries")));

// Attach io to every request so controllers can use req.io
app.use((req, _, next) => { req.io = io; next(); });

// ── API Routes ────────────────────────────────────────────────
app.use("/api/v1/user",          userRoutes);
app.use("/api/v1/course",        courseRoutes);
app.use("/api/v1/progress",      courseProgressRoutes);
app.use("/api/v1/purchase",      purchaseRoutes);
app.use("/api/v1/meeting",       meetingRoutes);
app.use("/api/v1/summary",       summaryRoutes);
app.use("/api/v1/media",         mediaRoutes);
app.use("/api/v1/doubt",         doubtRoutes);
app.use("/api/v1/certificate",   certificateRoutes);
app.use("/api/v1/chatbot",       chatbotRoutes);
app.use("/api/v1/whiteboard",    whiteboardRoutes);
app.use("/api/v1/tasks",         taskRoutes);
app.use("/api/v1/notifications", notificationRoutes);
app.use("/api/v1/chat",          chatRoutes);
app.use("/api/v1/poll",          pollRoutes);
app.use("/api/v1/question",      questionRoutes);
app.use("/api/v1/test",          testRoutes);
app.use("/api/v1/breakout",      breakoutRoomRoutes);

app.get("/health", (_, res) => res.json({ status: "ok", service: "LearnSphere Unified Platform" }));

// ── Socket.io ─────────────────────────────────────────────────
io.on("connection", (socket) => {

  // ─────────────────────────────────────────────────────────────
  // PERSONAL NOTIFICATION ROOM
  // ─────────────────────────────────────────────────────────────
  socket.on("join-user-room", (userId) => {
    socket.join(`user-${userId}`);
  });

  // ─────────────────────────────────────────────────────────────
  // MEETING WAITING ROOM (admission flow)
  // ─────────────────────────────────────────────────────────────
  socket.on("join-host-room", ({ meetingId }) => {
    socket.join(`meeting:${meetingId}:host`);
  });

  socket.on("join-student-room", ({ meetingId, userId }) => {
    socket.join(`meeting:${meetingId}:student:${userId}`);
    // Also join the generic "all participants" room used by poll + whiteboard push
    socket.join(`meeting-room:${meetingId}`);
  });

  socket.on("leave-meeting-rooms", ({ meetingId, userId, isHost }) => {
    if (isHost) {
      socket.leave(`meeting:${meetingId}:host`);
    } else {
      socket.leave(`meeting:${meetingId}:student:${userId}`);
      socket.leave(`meeting-room:${meetingId}`);
    }
  });

  // ─────────────────────────────────────────────────────────────
  // LIVE CLASS SIGNALS
  // ─────────────────────────────────────────────────────────────
  socket.on("class-live", ({ meetingId, title, teacherName }) => {
    socket.broadcast.emit("class-live-update", { meetingId, title, teacherName, isLive: true });
  });
  socket.on("class-ended", ({ meetingId }) => {
    socket.broadcast.emit("class-live-update", { meetingId, isLive: false });
  });

  // ─────────────────────────────────────────────────────────────
  // LIVE CHAT
  // ─────────────────────────────────────────────────────────────
  socket.on("join-chat-room", ({ meetingId }) => {
    socket.join(`chat:${meetingId}`);
  });

  socket.on("leave-chat-room", ({ meetingId }) => {
    socket.leave(`chat:${meetingId}`);
  });

  socket.on("chat-send", async ({ meetingId, message, sender }) => {
    try {
      if (!meetingId || !message || !sender) return;

      // Lazy import to avoid circular dependency issues
      const { ChatMessage } = await import("./models/chatMessage.model.js");
      const { Meeting }     = await import("./models/meeting.model.js");

      // Check if chat is disabled for this meeting
      const meeting = await Meeting.findOne({ meetingId }).select("chatDisabled");
      if (meeting?.chatDisabled && sender.role !== "instructor") {
        socket.emit("chat-error", { message: "Chat has been disabled by the host." });
        return;
      }

      // Persist the message to MongoDB
      const msg = await ChatMessage.create({
        meetingId,
        sender:      sender.id,
        senderName:  sender.name || "Unknown",
        senderRole:  sender.role || "student",
        senderPhoto: sender.photo || "",
        message:     String(message).trim().slice(0, 2000),
      });

      // Build payload matching what the frontend expects
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

      // Broadcast to EVERYONE in the chat room (including the sender)
      io.to(`chat:${meetingId}`).emit("chat-message", payload);

    } catch (err) {
      console.error("[chat-send] error:", err.message);
      socket.emit("chat-error", { message: "Failed to send message. Please try again." });
    }
  });

  // ─────────────────────────────────────────────────────────────
  // POLL ROOM
  // ─────────────────────────────────────────────────────────────
  socket.on("join-poll-room", ({ meetingId }) => {
    socket.join(`meeting-room:${meetingId}`);
  });

  socket.on("leave-poll-room", ({ meetingId }) => {
    socket.leave(`meeting-room:${meetingId}`);
  });

  // ─────────────────────────────────────────────────────────────
  // LIVE WHITEBOARD
  // ─────────────────────────────────────────────────────────────
  socket.on("wb-join", ({ meetingId }) => {
    socket.join(`wb:${meetingId}`);
    // When a new user joins the whiteboard room, ask the host to sync canvas state
    socket.to(`meeting:${meetingId}:host`).emit("wb-request-sync", { meetingId });
  });

  socket.on("wb-leave", ({ meetingId }) => {
    socket.leave(`wb:${meetingId}`);
  });

  // Instructor opens whiteboard → push to ALL students in meeting
  socket.on("wb-open", ({ meetingId }) => {
    socket.to(`meeting-room:${meetingId}`).emit("wb-open", { meetingId });
  });

  // Instructor closes whiteboard → push to all students
  socket.on("wb-close", ({ meetingId }) => {
    socket.to(`meeting-room:${meetingId}`).emit("wb-close", { meetingId });
  });

  // Drawing op — broadcast to everyone in the whiteboard room except sender
  socket.on("wb-draw", ({ meetingId, type, data }) => {
    socket.to(`wb:${meetingId}`).emit("wb-draw", { type, data });
  });

  // Full canvas sync on late-join
  socket.on("wb-sync", ({ meetingId, canvasJSON }) => {
    socket.to(`wb:${meetingId}`).emit("wb-sync", { canvasJSON });
  });

  socket.on("wb-clear", ({ meetingId }) => {
    socket.to(`wb:${meetingId}`).emit("wb-clear");
  });

  socket.on("wb-pointer", ({ meetingId, x, y, active }) => {
    socket.to(`wb:${meetingId}`).emit("wb-pointer", { x, y, active });
  });

  socket.on("wb-permission", ({ meetingId, studentDrawing }) => {
    socket.to(`wb:${meetingId}`).emit("wb-permission", { studentDrawing });
  });

  // ─────────────────────────────────────────────────────────────
  // BREAKOUT ROOMS
  // ─────────────────────────────────────────────────────────────
  socket.on("join-breakout-room", ({ meetingId, streamCallId }) => {
    socket.join(`breakout:${streamCallId}`);
    // Also keep the student reachable in their original meeting room
    // (they stay in `meeting:${meetingId}:student:${userId}` throughout)
  });

  socket.on("leave-breakout-room", ({ streamCallId }) => {
    socket.leave(`breakout:${streamCallId}`);
  });

  // Relay host broadcast message to a specific breakout room
  socket.on("breakout-msg", ({ streamCallId, message, from }) => {
    socket.to(`breakout:${streamCallId}`).emit("breakout-broadcast", { message, from });
  });

  // ─────────────────────────────────────────────────────────────
  // PARTICIPANTS ROOM (for live participant list panel)
  // ─────────────────────────────────────────────────────────────
  socket.on("join-meeting-room", ({ meetingId }) => {
    socket.join(`meetingRoom:${meetingId}`);
    socket.to(`meetingRoom:${meetingId}`).emit("participant-joined", { socketId: socket.id });
  });

  socket.on("leave-meeting-room", ({ meetingId }) => {
    socket.leave(`meetingRoom:${meetingId}`);
    socket.to(`meetingRoom:${meetingId}`).emit("participant-left", { socketId: socket.id });
  });

  socket.on("disconnect", () => {});
});

export { io };

const PORT = process.env.PORT || 8080;
connectDB().then(() => {
  server.listen(PORT, () => console.log(`🚀 LearnSphere Unified Server running on port ${PORT}`));
});