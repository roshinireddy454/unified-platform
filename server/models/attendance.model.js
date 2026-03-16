import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    meetingId: { type: String, required: true }, // Stream call ID
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    joinTime: { type: Date, required: true },
    leaveTime: { type: Date },
    durationMinutes: { type: Number }, // calculated on leave
    sessionId: { type: String }, // Stream session ID
  },
  { timestamps: true }
);

// Compound index for fast lookup
attendanceSchema.index({ meetingId: 1, userId: 1 });

export const Attendance = mongoose.model("Attendance", attendanceSchema);
