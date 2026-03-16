import { StreamClient } from "@stream-io/node-sdk";
import { Meeting }      from "../models/meeting.model.js";
import { Attendance }   from "../models/attendance.model.js";
import { User }         from "../models/user.model.js";
import { notify }       from "../utils/notify.js";

const STREAM_API_KEY    = process.env.STREAM_API_KEY;
const STREAM_API_SECRET = process.env.STREAM_SECRET_KEY;

const sanitizeMeetingId = (raw) => raw.replace(/[^a-z0-9_-]/gi, "_").toLowerCase();
const getStreamClient   = () => new StreamClient(STREAM_API_KEY, STREAM_API_SECRET);

// ─── Stream Token ─────────────────────────────────────────────
export const getStreamToken = async (req, res) => {
  try {
    const userId = req.id;
    const user   = await User.findById(userId).select("-password");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const client = getStreamClient();
    await client.upsertUsers([{
      id:    userId.toString(),
      name:  user.name,
      image: user.photoUrl || "",
      role:  user.role === "instructor" ? "admin" : "user",
    }]);

    const exp   = Math.floor(Date.now() / 1000) + 3600;
    const iat   = Math.floor(Date.now() / 1000) - 60;
    const token = client.createToken(userId.toString(), exp, iat);

    return res.status(200).json({
      success: true, token,
      apiKey: STREAM_API_KEY,
      userId: userId.toString(),
      userName: user.name,
      userPhoto: user.photoUrl || "",
      userRole:  user.role,
    });
  } catch (error) {
    console.error("Stream token error:", error);
    return res.status(500).json({ success: false, message: "Failed to generate token" });
  }
};

// ─── Create Meeting ───────────────────────────────────────────
export const createMeeting = async (req, res) => {
  try {
    let { meetingId, title, description, scheduledAt, courseId, isPersonalRoom } = req.body;
    const userId = req.id;
    if (!meetingId) return res.status(400).json({ success: false, message: "meetingId is required" });

    meetingId        = sanitizeMeetingId(meetingId);
    const existing   = await Meeting.findOne({ meetingId });
    if (existing) return res.status(200).json({ success: true, meeting: existing });

    const isLive = !scheduledAt;
    const meeting = await Meeting.create({
      meetingId,
      title:          title || "Untitled Meeting",
      description:    description || "",
      createdBy:      userId,
      scheduledAt:    scheduledAt ? new Date(scheduledAt) : null,
      status:         isLive ? "live" : "scheduled",
      courseId:       courseId || null,
      isPersonalRoom: isPersonalRoom || false,
    });

    const instructor = await User.findById(userId).select("name");

    if (isLive) {
      // Live class started — notify all students
      if (req.io) {
        req.io.emit("class-live-update", {
          meetingId, title: meeting.title,
          teacherName: instructor?.name || "Instructor", isLive: true,
        });
      }
      const students = await User.find({ role: "student" }).select("_id");
      await notify(req.io, students.map((s) => ({
        recipient: s._id,
        type:      "class_started",
        title:     "🔴 Live Class Started",
        message:   `${instructor?.name || "Your instructor"} has started a live class: "${meeting.title}". Join now!`,
        link:      `/meeting/${encodeURIComponent(meetingId)}`,
        metadata:  { meetingId },
      })));
    } else {
      // Scheduled class — notify all students
      const students = await User.find({ role: "student" }).select("_id");
      await notify(req.io, students.map((s) => ({
        recipient: s._id,
        type:      "class_scheduled",
        title:     "📅 New Class Scheduled",
        message:   `${instructor?.name || "Your instructor"} scheduled a class: "${meeting.title}" on ${new Date(scheduledAt).toLocaleString()}.`,
        link:      `/meetings`,
        metadata:  { meetingId, scheduledAt },
      })));
    }

    return res.status(201).json({ success: true, meeting });
  } catch (error) {
    console.error("Create meeting error:", error);
    return res.status(500).json({ success: false, message: "Failed to create meeting" });
  }
};

// ─── Get Meetings ─────────────────────────────────────────────
export const getMeetings = async (req, res) => {
  try {
    const user  = await User.findById(req.id).select("role");
    const query = user.role === "instructor"
      ? { createdBy: req.id, deletedByCreator: { $ne: true } }
      : { deletedForAll: { $ne: true } };
    const meetings = await Meeting.find(query)
      .populate("createdBy", "name photoUrl role")
      .sort({ createdAt: -1 });
    return res.status(200).json({ success: true, meetings });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch meetings" });
  }
};

export const getLiveMeetings = async (req, res) => {
  try {
    const meetings = await Meeting.find({ status: "live", deletedForAll: { $ne: true } })
      .populate("createdBy", "name photoUrl role")
      .sort({ startedAt: -1 });
    return res.status(200).json({ success: true, meetings });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch live meetings" });
  }
};

export const getMeetingById = async (req, res) => {
  try {
    const { meetingId } = req.params;
    const sanitized     = sanitizeMeetingId(meetingId);
    const meeting = await Meeting.findOne({ meetingId: sanitized })
      .populate("createdBy", "name photoUrl role");
    if (!meeting) return res.status(404).json({ success: false, message: "Meeting not found" });
    return res.status(200).json({ success: true, meeting });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch meeting" });
  }
};

export const getUpcomingMeetings = async (req, res) => {
  try {
    const user  = await User.findById(req.id).select("role");
    const now   = new Date();
    const query = user.role === "instructor"
      ? { createdBy: req.id, scheduledAt: { $gte: now }, status: "scheduled", deletedByCreator: { $ne: true } }
      : { scheduledAt: { $gte: now }, status: "scheduled", deletedForAll: { $ne: true } };
    const meetings = await Meeting.find(query)
      .populate("createdBy", "name photoUrl role")
      .sort({ scheduledAt: 1 });
    return res.status(200).json({ success: true, meetings });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch upcoming meetings" });
  }
};

export const getPreviousMeetings = async (req, res) => {
  try {
    const user  = await User.findById(req.id).select("role");
    const query = user.role === "instructor"
      ? { createdBy: req.id, status: "ended", deletedByCreator: { $ne: true } }
      : { status: "ended", deletedForAll: { $ne: true } };
    const meetings = await Meeting.find(query)
      .populate("createdBy", "name photoUrl role")
      .sort({ endedAt: -1 });
    return res.status(200).json({ success: true, meetings });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch previous meetings" });
  }
};

export const deleteMeeting = async (req, res) => {
  try {
    const { meetingId } = req.params;
    const userId        = req.id;
    const user          = await User.findById(userId).select("role");
    if (user.role !== "instructor")
      return res.status(403).json({ success: false, message: "Only instructors can delete meetings" });

    const meeting = await Meeting.findOne({ meetingId });
    if (!meeting) return res.status(404).json({ success: false, message: "Meeting not found" });
    if (meeting.createdBy.toString() !== userId)
      return res.status(403).json({ success: false, message: "You can only delete your own meetings" });

    await Meeting.findOneAndUpdate({ meetingId }, {
      deletedByCreator: true, deletedForAll: true, deletedAt: new Date(),
    });

    if (req.io) req.io.emit("meeting-deleted", { meetingId });
    return res.status(200).json({ success: true, message: "Meeting removed. Summary and attendance preserved." });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to delete meeting" });
  }
};

export const updateMeetingStatus = async (req, res) => {
  try {
    const { meetingId }                  = req.params;
    const { status, recordingUrl }       = req.body;
    const update                         = { status };
    if (status === "live")   update.startedAt  = new Date();
    if (status === "ended") { update.endedAt = new Date(); update.waitingRoom = []; }
    if (recordingUrl)        update.recordingUrl = recordingUrl;
    const meeting = await Meeting.findOneAndUpdate({ meetingId }, update, { new: true });
    if (!meeting) return res.status(404).json({ success: false, message: "Meeting not found" });

    if (status === "ended" && req.io) {
      req.io.emit("class-live-update", { meetingId, isLive: false });
      req.io.to(`meeting:${meetingId}`).emit("meeting-ended", { meetingId });
    }

    // If the instructor manually flips a scheduled meeting to "live"
    if (status === "live") {
      const instructor = await User.findById(req.id).select("name");
      const students   = await User.find({ role: "student" }).select("_id");
      await notify(req.io, students.map((s) => ({
        recipient: s._id,
        type:      "class_started",
        title:     "🔴 Live Class Started",
        message:   `${instructor?.name || "Your instructor"} has started "${meeting.title}". Join now!`,
        link:      `/meeting/${encodeURIComponent(meetingId)}`,
        metadata:  { meetingId },
      })));
    }

    return res.status(200).json({ success: true, meeting });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to update meeting" });
  }
};

// ═══════════════════════════════════════════════════════════════
// WAITING ROOM SYSTEM (unchanged)
// ═══════════════════════════════════════════════════════════════

export const knockMeeting = async (req, res) => {
  try {
    const { meetingId } = req.params;
    const userId        = req.id;
    const user          = await User.findById(userId).select("name photoUrl role");
    const meeting       = await Meeting.findOne({ meetingId });
    if (!meeting) return res.status(404).json({ success: false, message: "Meeting not found" });

    if (meeting.status !== "live")
      return res.status(200).json({ success: true, status: "not-started", message: "Class hasn't started yet" });

    const alreadyAdmitted = meeting.admittedUsers.some((id) => id.toString() === userId.toString());
    if (alreadyAdmitted) return res.status(200).json({ success: true, status: "admitted" });

    const alreadyWaiting = meeting.waitingRoom.some((w) => w.userId.toString() === userId.toString());
    if (!alreadyWaiting) {
      await Meeting.findOneAndUpdate({ meetingId }, {
        $addToSet: { waitingRoom: { userId, name: user.name, photoUrl: user.photoUrl || "", joinedAt: new Date() } },
      });
    }

    if (req.io) {
      req.io.to(`meeting:${meetingId}:host`).emit("student-knocked", {
        meetingId, userId: userId.toString(), name: user.name, photoUrl: user.photoUrl || "",
      });
    }

    return res.status(200).json({ success: true, status: "waiting" });
  } catch (error) {
    console.error("Knock error:", error);
    return res.status(500).json({ success: false, message: "Failed to knock" });
  }
};

export const admitStudent = async (req, res) => {
  try {
    const { meetingId, userId: studentId } = req.params;
    const hostId = req.id;
    const meeting = await Meeting.findOne({ meetingId });
    if (!meeting) return res.status(404).json({ success: false, message: "Meeting not found" });
    if (meeting.createdBy.toString() !== hostId)
      return res.status(403).json({ success: false, message: "Only the host can admit students" });

    await Meeting.findOneAndUpdate({ meetingId }, {
      $pull:      { waitingRoom: { userId: studentId } },
      $addToSet:  { admittedUsers: studentId },
    });

    if (req.io) {
      req.io.to(`meeting:${meetingId}:student:${studentId}`).emit("student-admitted", { meetingId });
      req.io.to(`meeting:${meetingId}:host`).emit("waiting-room-update", { meetingId });
    }
    return res.status(200).json({ success: true, message: "Student admitted" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to admit student" });
  }
};

export const rejectStudent = async (req, res) => {
  try {
    const { meetingId, userId: studentId } = req.params;
    const hostId  = req.id;
    const meeting = await Meeting.findOne({ meetingId });
    if (!meeting) return res.status(404).json({ success: false, message: "Meeting not found" });
    if (meeting.createdBy.toString() !== hostId)
      return res.status(403).json({ success: false, message: "Only the host can reject students" });

    await Meeting.findOneAndUpdate({ meetingId }, { $pull: { waitingRoom: { userId: studentId } } });

    if (req.io) {
      req.io.to(`meeting:${meetingId}:student:${studentId}`).emit("student-rejected", { meetingId });
      req.io.to(`meeting:${meetingId}:host`).emit("waiting-room-update", { meetingId });
    }
    return res.status(200).json({ success: true, message: "Student rejected" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to reject student" });
  }
};

export const admitAllStudents = async (req, res) => {
  try {
    const { meetingId } = req.params;
    const hostId        = req.id;
    const meeting       = await Meeting.findOne({ meetingId });
    if (!meeting) return res.status(404).json({ success: false, message: "Meeting not found" });
    if (meeting.createdBy.toString() !== hostId)
      return res.status(403).json({ success: false, message: "Only the host can admit students" });

    const waitingIds = meeting.waitingRoom.map((w) => w.userId.toString());
    if (waitingIds.length === 0) return res.status(200).json({ success: true, message: "No students waiting" });

    await Meeting.findOneAndUpdate({ meetingId }, {
      $set:      { waitingRoom: [] },
      $addToSet: { admittedUsers: { $each: waitingIds } },
    });

    if (req.io) {
      waitingIds.forEach((sid) => {
        req.io.to(`meeting:${meetingId}:student:${sid}`).emit("student-admitted", { meetingId });
      });
      req.io.to(`meeting:${meetingId}:host`).emit("waiting-room-update", { meetingId });
    }
    return res.status(200).json({ success: true, admitted: waitingIds.length });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to admit all" });
  }
};

export const getWaitingRoom = async (req, res) => {
  try {
    const { meetingId } = req.params;
    const meeting = await Meeting.findOne({ meetingId }).populate("waitingRoom.userId", "name photoUrl");
    if (!meeting) return res.status(404).json({ success: false, message: "Meeting not found" });
    return res.status(200).json({ success: true, waitingRoom: meeting.waitingRoom });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch waiting room" });
  }
};

// ─── Recordings ───────────────────────────────────────────────
export const getRecordings = async (req, res) => {
  try {
    const user  = await User.findById(req.id).select("role");
    const query = user.role === "instructor"
      ? { createdBy: req.id, status: "ended", deletedByCreator: { $ne: true } }
      : { status: "ended", deletedForAll: { $ne: true } };

    const meetings = await Meeting.find(query).populate("createdBy", "name photoUrl").sort({ endedAt: -1 }).lean();
    const client   = getStreamClient();
    const results  = [];
    for (const meeting of meetings) {
      try {
        const call = client.video.call("default", meeting.meetingId);
        const resp = await call.listRecordings();
        const recs = resp?.recordings || [];
        if (recs.length > 0) {
          results.push({ meeting, recordings: recs.map((r) => ({ url: r.url, filename: r.filename, startTime: r.start_time, endTime: r.end_time, duration: r.duration })) });
        } else if (meeting.recordingUrl) {
          results.push({ meeting, recordings: [{ url: meeting.recordingUrl, filename: meeting.title }] });
        }
      } catch {
        if (meeting.recordingUrl) results.push({ meeting, recordings: [{ url: meeting.recordingUrl, filename: meeting.title }] });
      }
    }
    return res.status(200).json({ success: true, recordings: results });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch recordings" });
  }
};

// ─── Attendance ───────────────────────────────────────────────
export const recordJoin = async (req, res) => {
  try {
    const { meetingId } = req.body;
    const userId        = req.id;
    const existing      = await Attendance.findOne({ meetingId, userId, leaveTime: null });
    if (existing) return res.status(200).json({ success: true, attendance: existing });
    const attendance = await Attendance.create({ meetingId, userId, joinTime: new Date() });
    return res.status(201).json({ success: true, attendance });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to record join" });
  }
};

export const recordLeave = async (req, res) => {
  try {
    const { meetingId } = req.body;
    const userId        = req.id;
    const attendance    = await Attendance.findOne({ meetingId, userId, leaveTime: null });
    if (!attendance) return res.status(200).json({ success: true });
    const leaveTime           = new Date();
    attendance.leaveTime      = leaveTime;
    attendance.durationMinutes = Math.round((leaveTime - attendance.joinTime) / 60000);
    await attendance.save();
    return res.status(200).json({ success: true, attendance });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to record leave" });
  }
};

export const getMeetingAttendance = async (req, res) => {
  try {
    const { meetingId } = req.params;
    const attendance    = await Attendance.find({ meetingId })
      .populate("userId", "name email photoUrl role")
      .sort({ joinTime: 1 });
    return res.status(200).json({ success: true, attendance });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch attendance" });
  }
};

export const getMyAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.find({ userId: req.id }).sort({ joinTime: -1 });
    return res.status(200).json({ success: true, attendance });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch attendance" });
  }
};

export const getEnrolledStudents = async (req, res) => {
  try {
    const { Course } = await import("../models/course.model.js");
    const user       = await User.findById(req.id).select("role");
    if (user.role !== "instructor")
      return res.status(403).json({ success: false, message: "Only instructors" });
    const courses = await Course.find({ creator: req.id })
      .populate("enrolledStudents", "name email photoUrl createdAt")
      .select("courseTitle enrolledStudents");
    return res.status(200).json({ success: true, courses });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch enrolled students" });
  }
};