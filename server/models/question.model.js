import mongoose from "mongoose";

const optionSchema = new mongoose.Schema({
  label: { type: String, required: true }, // "A", "B", "C", "D"
  text: { type: String, required: true },
});

const questionSchema = new mongoose.Schema(
  {
    creator: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course" }, // optional course-level tagging
    questionText: { type: String, required: true },
    options: { type: [optionSchema], required: true },
    correctAnswer: { type: String, required: true }, // label of correct option e.g. "A"
    marks: { type: Number, required: true, default: 1 },
    negativeMarks: { type: Number, default: 0 },
    difficultyLevel: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      default: "Medium",
    },
    topic: { type: String, default: "" },
  },
  { timestamps: true }
);

export const Question = mongoose.model("Question", questionSchema);
