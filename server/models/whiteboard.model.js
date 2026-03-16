import mongoose from "mongoose";

/**
 * Stores the latest serialised whiteboard state for a meeting.
 * We use upsert-by-meetingId so there is always at most one document
 * per meeting – the full canvas data replaces the previous snapshot
 * on every save (we don't need a full event log here; real-time sync
 * is handled by Socket.io).
 */
const whiteboardSchema = new mongoose.Schema(
  {
    meetingId:      { type: String, required: true, unique: true, index: true },
    createdBy:      { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    // Full Fabric.js JSON snapshot of the canvas
    canvasJSON:     { type: String, default: "{}" },
    // Whether students are currently allowed to draw
    studentDrawing: { type: Boolean, default: false },
    // Optional: base64 PNG thumbnail saved on demand
    thumbnail:      { type: String, default: "" },
    lastSavedAt:    { type: Date, default: null },
  },
  { timestamps: true }
);

export const Whiteboard = mongoose.model("Whiteboard", whiteboardSchema);