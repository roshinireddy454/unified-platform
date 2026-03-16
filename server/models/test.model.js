import mongoose from "mongoose";

const testQuestionSchema = new mongoose.Schema({
  question: { type: mongoose.Schema.Types.ObjectId, ref: "Question", required: true },
  marks: { type: Number, required: true },
  negativeMarks: { type: Number, default: 0 },
});

const testSchema = new mongoose.Schema(
  {
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    creator: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    instructions: { type: String, default: "" },
    duration: { type: Number, required: true }, // in minutes
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    questions: [testQuestionSchema],
    totalMarks: { type: Number, default: 0 },
    negativeMarkingEnabled: { type: Boolean, default: false },
    attemptsAllowed: { type: Number, default: 1 },
    isPublished: { type: Boolean, default: false },
    randomizeQuestions: { type: Boolean, default: false },
    randomizeOptions: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Test = mongoose.model("Test", testSchema);
