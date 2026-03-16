import { Doubt }  from "../models/doubt.model.js";
import { User }   from "../models/user.model.js";
import { notify } from "../utils/notify.js";

export const createDoubt = async (req, res) => {
  try {
    const { question, courseId } = req.body;
    if (!question || !question.trim())
      return res.status(400).json({ success: false, message: "Question is required" });

    const doubt = await Doubt.create({
      student:  req.id,
      courseId: courseId || null,
      question: question.trim(),
    });

    const populated = await Doubt.findById(doubt._id)
      .populate("student", "name photoUrl")
      .populate("courseId", "courseTitle");

    return res.status(201).json({ success: true, doubt: populated });
  } catch (error) {
    console.error("Create doubt error:", error);
    return res.status(500).json({ success: false, message: "Failed to create doubt" });
  }
};

export const getMyDoubts = async (req, res) => {
  try {
    const doubts = await Doubt.find({ student: req.id })
      .populate("student", "name photoUrl")
      .populate("courseId", "courseTitle")
      .populate("replies.sender", "name photoUrl role")
      .sort({ createdAt: -1 });
    return res.status(200).json({ success: true, doubts });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch doubts" });
  }
};

export const getAllDoubts = async (req, res) => {
  try {
    const user = await User.findById(req.id).select("role");
    if (user.role !== "instructor")
      return res.status(403).json({ success: false, message: "Only instructors can access all doubts" });

    const doubts = await Doubt.find()
      .populate("student", "name photoUrl email")
      .populate("courseId", "courseTitle")
      .populate("replies.sender", "name photoUrl role")
      .sort({ createdAt: -1 });
    return res.status(200).json({ success: true, doubts });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch doubts" });
  }
};

export const replyToDoubt = async (req, res) => {
  try {
    const { doubtId } = req.params;
    const { message } = req.body;
    if (!message || !message.trim())
      return res.status(400).json({ success: false, message: "Reply message is required" });

    const doubt = await Doubt.findById(doubtId);
    if (!doubt) return res.status(404).json({ success: false, message: "Doubt not found" });

    const user = await User.findById(req.id).select("role name");
    if (user.role === "student" && doubt.student.toString() !== req.id)
      return res.status(403).json({ success: false, message: "Not authorized" });

    doubt.replies.push({ sender: req.id, message: message.trim() });
    await doubt.save();

    const updated = await Doubt.findById(doubtId)
      .populate("student", "name photoUrl")
      .populate("courseId", "courseTitle")
      .populate("replies.sender", "name photoUrl role");

    // Notify the student that the teacher replied (only when instructor replies)
    if (user.role === "instructor") {
      await notify(req.io, {
        recipient: doubt.student,
        type:      "doubt_replied",
        title:     "Teacher Replied to Your Doubt 💬",
        message:   `${user.name} replied to your doubt: "${doubt.question.slice(0, 60)}${doubt.question.length > 60 ? "…" : ""}"`,
        link:      `/doubts`,
        metadata:  { doubtId },
      });
    }

    return res.status(200).json({ success: true, doubt: updated });
  } catch (error) {
    console.error("Reply error:", error);
    return res.status(500).json({ success: false, message: "Failed to reply" });
  }
};

export const resolveDoubt = async (req, res) => {
  try {
    const { doubtId } = req.params;
    const user        = await User.findById(req.id).select("role");
    if (user.role !== "instructor")
      return res.status(403).json({ success: false, message: "Only instructors can resolve doubts" });

    const doubt = await Doubt.findByIdAndUpdate(doubtId, { isResolved: true }, { new: true });
    if (!doubt) return res.status(404).json({ success: false, message: "Doubt not found" });
    return res.status(200).json({ success: true, doubt });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to resolve doubt" });
  }
};