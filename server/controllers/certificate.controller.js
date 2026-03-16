import { Certificate }    from "../models/certificate.model.js";
import { CourseProgress } from "../models/courseProgress.model.js";
import { Course }         from "../models/course.model.js";
import { User }           from "../models/user.model.js";
import { notify }         from "../utils/notify.js";
import { v4 as uuidv4 }  from "uuid";

export const generateCertificate = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.id;

    const progress = await CourseProgress.findOne({ userId, courseId });
    if (!progress) return res.status(400).json({ success: false, message: "No progress found for this course" });

    const total      = progress.lectureProgress?.length || 0;
    const viewed     = progress.lectureProgress?.filter((l) => l.viewed).length || 0;
    const percentage = total > 0 ? Math.round((viewed / total) * 100) : 0;

    if (percentage < 100 && !progress.completed) {
      return res.status(400).json({
        success: false,
        message: `Course not yet complete. Progress: ${percentage}%`,
        percentage,
      });
    }

    const existing = await Certificate.findOne({ student: userId, course: courseId });
    if (existing) {
      const cert = await Certificate.findById(existing._id)
        .populate("student", "name email")
        .populate("course", "courseTitle creator")
        .populate({ path: "course", populate: { path: "creator", select: "name" } });
      return res.status(200).json({ success: true, certificate: cert, alreadyIssued: true });
    }

    const certificateId = `CERT-${uuidv4().split("-")[0].toUpperCase()}-${Date.now()}`;
    const certificate   = await Certificate.create({ student: userId, course: courseId, certificateId });

    const populated = await Certificate.findById(certificate._id)
      .populate("student", "name email")
      .populate("course", "courseTitle creator")
      .populate({ path: "course", populate: { path: "creator", select: "name" } });

    // Notify the student
    await notify(req.io, {
      recipient: userId,
      type:      "certificate_awarded",
      title:     "🏆 Certificate Awarded!",
      message:   `Congratulations! You've been awarded a certificate for completing "${populated.course?.courseTitle}".`,
      link:      `/certificates`,
      metadata:  { courseId, certificateId },
    });

    return res.status(201).json({ success: true, certificate: populated });
  } catch (error) {
    console.error("Generate certificate error:", error);
    return res.status(500).json({ success: false, message: "Failed to generate certificate" });
  }
};

export const getMyCertificates = async (req, res) => {
  try {
    const certificates = await Certificate.find({ student: req.id })
      .populate("student", "name email")
      .populate("course", "courseTitle courseThumbnail creator")
      .populate({ path: "course", populate: { path: "creator", select: "name" } })
      .sort({ issuedAt: -1 });
    return res.status(200).json({ success: true, certificates });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch certificates" });
  }
};

export const verifyCertificate = async (req, res) => {
  try {
    const { certificateId } = req.params;
    const certificate       = await Certificate.findOne({ certificateId })
      .populate("student", "name email")
      .populate("course", "courseTitle")
      .populate({ path: "course", populate: { path: "creator", select: "name" } });
    if (!certificate)
      return res.status(404).json({ success: false, message: "Certificate not found or invalid" });
    return res.status(200).json({ success: true, certificate });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to verify certificate" });
  }
};