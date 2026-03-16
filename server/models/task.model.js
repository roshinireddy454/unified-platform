import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    user: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "User",
      required: true,
      index:    true,
    },

    title:       { type: String, required: true, maxlength: 200 },
    description: { type: String, default: "", maxlength: 1000 },
    dueDate:     { type: Date, default: null },

    priority: {
      type:    String,
      enum:    ["low", "medium", "high"],
      default: "medium",
    },

    status: {
      type:    String,
      enum:    ["pending", "completed"],
      default: "pending",
    },

    // ── Auto-generated task metadata ──────────────────────────
    // When a task is auto-created from an LMS event (meeting, test, etc.)
    // we store its source so we can avoid duplicates and link back to it.
    source: {
      type: String,
      enum: ["manual", "meeting", "test", "course"],
      default: "manual",
    },
    sourceId: {
      type: String,   // meetingId string, testId ObjectId as string, courseId as string
      default: null,
    },
  },
  { timestamps: true }
);

// Prevent creating duplicate auto-tasks for the same source event per user
taskSchema.index({ user: 1, sourceId: 1, source: 1 }, { unique: false, sparse: true });

export const Task = mongoose.model("Task", taskSchema);