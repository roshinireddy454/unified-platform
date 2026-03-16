import mongoose from "mongoose";

const meetingSummarySchema = new mongoose.Schema(
  {
    meetingId:        { type: String, required: true, unique: true },
    meetingTitle:     { type: String, default: "Meeting Summary" },
    transcript:       { type: String },
    summary:          { type: String },
    subtitles:        { type: String },
    aiGenerated:      { type: Boolean, default: false },
    pdfPath:          { type: String },
    generatedBy:      { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    expiresAt:        { type: Date },

    // Soft-delete — hides from both teacher and student views
    deletedByCreator: { type: Boolean, default: false },
    deletedAt:        { type: Date },
  },
  { timestamps: true }
);

export const MeetingSummary = mongoose.model("MeetingSummary", meetingSummarySchema);