import { CourseProgress } from "../models/courseProgress.model.js";
import { Course } from "../models/course.model.js";
import { Certificate } from "../models/certificate.model.js";
import { v4 as uuidv4 } from "uuid";

// Auto-issue certificate if course is 100% complete
async function autoIssueCertificate(userId, courseId) {
  try {
    // Don't duplicate
    const existing = await Certificate.findOne({ student: userId, course: courseId });
    if (existing) return existing;

    const certificateId = `CERT-${uuidv4().split("-")[0].toUpperCase()}-${Date.now()}`;
    const cert = await Certificate.create({ student: userId, course: courseId, certificateId });
    console.log(`✅ Certificate auto-issued: ${certificateId} for user ${userId}, course ${courseId}`);
    return cert;
  } catch (err) {
    console.error("Auto-certificate error:", err.message);
    return null;
  }
}

export const getCourseProgress = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.id;
    let courseProgress = await CourseProgress.findOne({ courseId, userId }).populate("courseId");
    const courseDetails = await Course.findById(courseId).populate("lectures");
    if (!courseDetails) return res.status(404).json({ message: "Course not found" });
    if (!courseProgress) {
      return res.status(200).json({ data: { courseDetails, progress: [], completed: false } });
    }
    return res.status(200).json({
      data: {
        courseDetails,
        progress: courseProgress.lectureProgress,
        completed: courseProgress.completed,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Failed to get course progress" });
  }
};

export const updateLectureProgress = async (req, res) => {
  try {
    const { courseId, lectureId } = req.params;
    const userId = req.id;
    let courseProgress = await CourseProgress.findOne({ courseId, userId });
    if (!courseProgress) {
      courseProgress = new CourseProgress({ userId, courseId, completed: false, lectureProgress: [] });
    }
    const lectureIndex = courseProgress.lectureProgress.findIndex((l) => l.lectureId === lectureId);
    if (lectureIndex !== -1) {
      courseProgress.lectureProgress[lectureIndex].viewed = true;
    } else {
      courseProgress.lectureProgress.push({ lectureId, viewed: true });
    }
    const viewedCount = courseProgress.lectureProgress.filter((l) => l.viewed).length;
    const course = await Course.findById(courseId);
    const isNowComplete = course.lectures.length > 0 && course.lectures.length === viewedCount;
    if (isNowComplete) {
      courseProgress.completed = true;
    }
    await courseProgress.save();

    // Auto-issue certificate if just completed
    if (isNowComplete) {
      await autoIssueCertificate(userId, courseId);
    }

    return res.status(200).json({ message: "Lecture progress updated successfully.", completed: isNowComplete });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Failed to update lecture progress" });
  }
};

export const markAsCompleted = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.id;
    const courseProgress = await CourseProgress.findOne({ courseId, userId });
    if (!courseProgress) return res.status(404).json({ message: "Course progress not found" });
    courseProgress.lectureProgress.forEach((l) => (l.viewed = true));
    courseProgress.completed = true;
    await courseProgress.save();

    // Auto-issue certificate
    await autoIssueCertificate(userId, courseId);

    return res.status(200).json({ message: "Course marked as completed." });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Failed to mark as completed" });
  }
};

export const markAsInCompleted = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.id;
    const courseProgress = await CourseProgress.findOne({ courseId, userId });
    if (!courseProgress) return res.status(404).json({ message: "Course progress not found" });
    courseProgress.lectureProgress.forEach((l) => (l.viewed = false));
    courseProgress.completed = false;
    await courseProgress.save();
    return res.status(200).json({ message: "Course marked as incompleted." });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Failed to mark as incompleted" });
  }
};

// Backfill: issue certificates for all already-completed courses
// Called once manually via POST /api/v1/progress/backfill-certificates
export const backfillCertificates = async (req, res) => {
  try {
    const completedProgresses = await CourseProgress.find({ completed: true });
    let issued = 0;
    for (const cp of completedProgresses) {
      const existing = await Certificate.findOne({ student: cp.userId, course: cp.courseId });
      if (!existing) {
        const certificateId = `CERT-${uuidv4().split("-")[0].toUpperCase()}-${Date.now()}-${issued}`;
        await Certificate.create({
          student: cp.userId,
          course: cp.courseId,
          certificateId,
        });
        issued++;
      }
    }
    return res.status(200).json({ success: true, issued, message: `Backfilled ${issued} certificates` });
  } catch (error) {
    console.error("Backfill error:", error);
    return res.status(500).json({ success: false, message: "Backfill failed" });
  }
};