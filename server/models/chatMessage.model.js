import mongoose from "mongoose";

const chatMessageSchema = new mongoose.Schema(
  {
    meetingId:   { type: String, required: true, index: true },
    sender:      { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    senderName:  { type: String, required: true },
    senderRole:  { type: String, enum: ["instructor", "student"], required: true },
    senderPhoto: { type: String, default: "" },
    message:     { type: String, required: true, maxlength: 2000 },
    isDeleted:   { type: Boolean, default: false },
    deletedAt:   { type: Date },
  },
  { timestamps: true }
);

// TTL: auto-purge messages older than 7 days to avoid unbounded growth
chatMessageSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7 * 24 * 60 * 60 });

export const ChatMessage = mongoose.model("ChatMessage", chatMessageSchema);