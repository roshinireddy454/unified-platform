import { Whiteboard } from "../models/whiteboard.model.js";
import { User }       from "../models/user.model.js";

// ── GET /api/v1/whiteboard/:meetingId ─────────────────────────
// Load the persisted canvas state for a meeting (or return empty)
export const getWhiteboard = async (req, res) => {
  try {
    const { meetingId } = req.params;
    const wb = await Whiteboard.findOne({ meetingId });
    return res.status(200).json({
      success: true,
      whiteboard: wb || { meetingId, canvasJSON: "{}", studentDrawing: false },
    });
  } catch (err) {
    console.error("getWhiteboard:", err);
    return res.status(500).json({ success: false, message: "Failed to fetch whiteboard." });
  }
};

// ── POST /api/v1/whiteboard/:meetingId/save ───────────────────
// Instructor saves the current canvas snapshot + optional thumbnail
export const saveWhiteboard = async (req, res) => {
  try {
    const { meetingId }           = req.params;
    const { canvasJSON, thumbnail } = req.body;
    const userId                  = req.id;

    const user = await User.findById(userId).select("role");
    if (user.role !== "instructor")
      return res.status(403).json({ success: false, message: "Only instructors can save the whiteboard." });

    const wb = await Whiteboard.findOneAndUpdate(
      { meetingId },
      {
        $set: {
          canvasJSON:  canvasJSON  || "{}",
          thumbnail:   thumbnail   || "",
          lastSavedAt: new Date(),
          createdBy:   userId,
        },
      },
      { upsert: true, new: true }
    );

    return res.status(200).json({ success: true, whiteboard: wb });
  } catch (err) {
    console.error("saveWhiteboard:", err);
    return res.status(500).json({ success: false, message: "Failed to save whiteboard." });
  }
};

// ── PATCH /api/v1/whiteboard/:meetingId/permissions ──────────
// Instructor toggles student drawing on/off
export const toggleStudentDrawing = async (req, res) => {
  try {
    const { meetingId }     = req.params;
    const { studentDrawing } = req.body;
    const userId            = req.id;

    const user = await User.findById(userId).select("role");
    if (user.role !== "instructor")
      return res.status(403).json({ success: false, message: "Only instructors can change permissions." });

    const wb = await Whiteboard.findOneAndUpdate(
      { meetingId },
      { $set: { studentDrawing: !!studentDrawing, createdBy: userId } },
      { upsert: true, new: true }
    );

    // Broadcast the permission change to everyone in the whiteboard room
    if (req.io) {
      req.io.to(`wb:${meetingId}`).emit("wb-permission", { studentDrawing: wb.studentDrawing });
    }

    return res.status(200).json({ success: true, studentDrawing: wb.studentDrawing });
  } catch (err) {
    console.error("toggleStudentDrawing:", err);
    return res.status(500).json({ success: false, message: "Failed to update permissions." });
  }
};