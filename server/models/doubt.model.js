import mongoose from "mongoose";

const replySchema = new mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    message: { type: String, required: true },
  },
  { timestamps: true }
);

const doubtSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
    question: { type: String, required: true },
    replies: [replySchema],
    isResolved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Doubt = mongoose.model("Doubt", doubtSchema);