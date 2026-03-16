import mongoose from "mongoose";

const meetingSchema = new mongoose.Schema(
  {
    meetingId:       { type: String, required: true, unique: true },
    title:           { type: String, default: "Untitled Meeting" },
    description:     { type: String, default: "" },
    createdBy:       { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    scheduledAt:     { type: Date },
    startedAt:       { type: Date },
    endedAt:         { type: Date },
    status: {
      type: String,
      enum: ["scheduled", "live", "ended", "cancelled"],
      default: "scheduled",
    },
    courseId:        { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
    isPersonalRoom:  { type: Boolean, default: false },
    recordingUrl:    { type: String },

    // ── Waiting room ─────────────────────────────────────────
    // Students who knocked and are waiting for the teacher to admit them
    waitingRoom: [
      {
        userId:   { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        name:     { type: String },
        photoUrl: { type: String, default: "" },
        joinedAt: { type: Date, default: Date.now },
      },
    ],

    // Students who have been admitted at least once (fast-track on re-join)
    admittedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    // Soft-delete
    deletedByCreator: { type: Boolean, default: false },
    deletedForAll:    { type: Boolean, default: false },
    deletedAt:        { type: Date },
  },
  { timestamps: true }
);

export const Meeting = mongoose.model("Meeting", meetingSchema);