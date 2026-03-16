import mongoose from "mongoose";

/**
 * Notification types (used as the `type` field):
 *
 * STUDENT:
 *   course_published        – a new course was published on the platform
 *   payment_success         – student's payment succeeded
 *   course_enrolled         – course added to My Courses
 *   class_scheduled         – instructor scheduled a live class
 *   class_started           – instructor started a live class
 *   doubt_replied           – teacher replied to a doubt
 *   test_submitted          – student's test was auto/manually submitted
 *   test_analytics          – student can view their test result
 *   certificate_awarded     – certificate was generated for student
 *   test_created            – a new test was created for an enrolled course
 *   summary_available       – teacher generated a class summary
 *
 * INSTRUCTOR:
 *   student_enrolled        – a student enrolled in one of their courses
 */

const notificationSchema = new mongoose.Schema(
  {
    recipient:  { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type:       { type: String, required: true },
    title:      { type: String, required: true },
    message:    { type: String, required: true },
    link:       { type: String, default: "" },          // front-end route to navigate to
    isRead:     { type: Boolean, default: false, index: true },
    metadata:   { type: mongoose.Schema.Types.Mixed, default: {} }, // any extra data
  },
  { timestamps: true }
);

// TTL: auto-delete notifications older than 60 days
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 24 * 60 * 60 });

export const Notification = mongoose.model("Notification", notificationSchema);