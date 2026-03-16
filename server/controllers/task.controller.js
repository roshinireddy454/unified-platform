import { Task }    from "../models/task.model.js";
import { Meeting } from "../models/meeting.model.js";
import { User }    from "../models/user.model.js";

// ─────────────────────────────────────────────────────────────
// GET /api/v1/tasks
// Returns all tasks for the logged-in user, with optional
// query params:  ?status=pending|completed  ?priority=low|medium|high
//               ?sort=dueDate|priority|createdAt  ?order=asc|desc
// ─────────────────────────────────────────────────────────────
export const getMyTasks = async (req, res) => {
  try {
    const userId = req.id;
    const { status, priority, sort = "dueDate", order = "asc" } = req.query;

    const filter = { user: userId };
    if (status   && ["pending", "completed"].includes(status))       filter.status   = status;
    if (priority && ["low", "medium", "high"].includes(priority))    filter.priority = priority;

    // Build sort object
    const sortDir    = order === "desc" ? -1 : 1;
    const sortField  = ["dueDate", "priority", "createdAt", "title"].includes(sort) ? sort : "dueDate";

    // Priority sort: high > medium > low — handled in-memory after fetch for simplicity
    let tasks = await Task.find(filter).sort({ [sortField]: sortDir }).lean();

    if (sortField === "priority") {
      const order_ = { high: 0, medium: 1, low: 2 };
      tasks = tasks.sort((a, b) =>
        sortDir === 1
          ? order_[a.priority] - order_[b.priority]
          : order_[b.priority] - order_[a.priority]
      );
    }

    // Null dueDates go to the end when sorting by date
    if (sortField === "dueDate") {
      tasks = tasks.sort((a, b) => {
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return sortDir * (new Date(a.dueDate) - new Date(b.dueDate));
      });
    }

    return res.status(200).json({ success: true, tasks });
  } catch (err) {
    console.error("getMyTasks:", err);
    return res.status(500).json({ success: false, message: "Failed to fetch tasks." });
  }
};

// ─────────────────────────────────────────────────────────────
// POST /api/v1/tasks
// ─────────────────────────────────────────────────────────────
export const createTask = async (req, res) => {
  try {
    const { title, description, dueDate, priority, status } = req.body;

    if (!title || !title.trim())
      return res.status(400).json({ success: false, message: "Task title is required." });

    const task = await Task.create({
      user:        req.id,
      title:       title.trim(),
      description: description?.trim() || "",
      dueDate:     dueDate ? new Date(dueDate) : null,
      priority:    priority || "medium",
      status:      status   || "pending",
      source:      "manual",
    });

    return res.status(201).json({ success: true, task });
  } catch (err) {
    console.error("createTask:", err);
    return res.status(500).json({ success: false, message: "Failed to create task." });
  }
};

// ─────────────────────────────────────────────────────────────
// PUT /api/v1/tasks/:taskId
// ─────────────────────────────────────────────────────────────
export const updateTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const task       = await Task.findOne({ _id: taskId, user: req.id });
    if (!task) return res.status(404).json({ success: false, message: "Task not found." });

    const { title, description, dueDate, priority, status } = req.body;

    if (title       !== undefined) task.title       = title.trim();
    if (description !== undefined) task.description = description.trim();
    if (dueDate     !== undefined) task.dueDate     = dueDate ? new Date(dueDate) : null;
    if (priority    !== undefined) task.priority    = priority;
    if (status      !== undefined) task.status      = status;

    await task.save();
    return res.status(200).json({ success: true, task });
  } catch (err) {
    console.error("updateTask:", err);
    return res.status(500).json({ success: false, message: "Failed to update task." });
  }
};

// ─────────────────────────────────────────────────────────────
// PATCH /api/v1/tasks/:taskId/toggle
// Toggles status between pending ↔ completed
// ─────────────────────────────────────────────────────────────
export const toggleTaskStatus = async (req, res) => {
  try {
    const { taskId } = req.params;
    const task       = await Task.findOne({ _id: taskId, user: req.id });
    if (!task) return res.status(404).json({ success: false, message: "Task not found." });

    task.status = task.status === "completed" ? "pending" : "completed";
    await task.save();
    return res.status(200).json({ success: true, task });
  } catch (err) {
    console.error("toggleTaskStatus:", err);
    return res.status(500).json({ success: false, message: "Failed to toggle task status." });
  }
};

// ─────────────────────────────────────────────────────────────
// DELETE /api/v1/tasks/:taskId
// ─────────────────────────────────────────────────────────────
export const deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const task       = await Task.findOneAndDelete({ _id: taskId, user: req.id });
    if (!task) return res.status(404).json({ success: false, message: "Task not found." });
    return res.status(200).json({ success: true, taskId });
  } catch (err) {
    console.error("deleteTask:", err);
    return res.status(500).json({ success: false, message: "Failed to delete task." });
  }
};

// ─────────────────────────────────────────────────────────────
// DELETE /api/v1/tasks/completed
// Bulk-clear all completed tasks for the user
// ─────────────────────────────────────────────────────────────
export const clearCompleted = async (req, res) => {
  try {
    const result = await Task.deleteMany({ user: req.id, status: "completed" });
    return res.status(200).json({ success: true, deletedCount: result.deletedCount });
  } catch (err) {
    console.error("clearCompleted:", err);
    return res.status(500).json({ success: false, message: "Failed to clear completed tasks." });
  }
};

// ─────────────────────────────────────────────────────────────
// POST /api/v1/tasks/sync-lms
// Pulls upcoming scheduled meetings for this user and creates
// pending tasks for any that don't already have one.
// Call this from the frontend on page load of the To-Do page.
// ─────────────────────────────────────────────────────────────
export const syncLmsTasks = async (req, res) => {
  try {
    const userId = req.id;
    const now    = new Date();

    // 1. Upcoming scheduled meetings (visible to all roles)
    const upcomingMeetings = await Meeting.find({
      scheduledAt:      { $gte: now },
      status:           "scheduled",
      deletedForAll:    { $ne: true },
      deletedByCreator: { $ne: true },
    }).select("meetingId title scheduledAt").lean();

    let created = 0;

    for (const m of upcomingMeetings) {
      // Check if this user already has a task for this meeting
      const exists = await Task.findOne({ user: userId, source: "meeting", sourceId: m.meetingId });
      if (!exists) {
        await Task.create({
          user:     userId,
          title:    `📅 Live Class: ${m.title}`,
          dueDate:  m.scheduledAt,
          priority: "high",
          status:   "pending",
          source:   "meeting",
          sourceId: m.meetingId,
        });
        created++;
      }
    }

    // 2. Remove auto-meeting tasks whose meeting has already ended / been deleted
    const activeMeetingIds = upcomingMeetings.map((m) => m.meetingId);
    await Task.deleteMany({
      user:     userId,
      source:   "meeting",
      status:   "pending",
      sourceId: { $nin: activeMeetingIds },
    });

    return res.status(200).json({ success: true, created });
  } catch (err) {
    console.error("syncLmsTasks:", err);
    return res.status(500).json({ success: false, message: "Failed to sync LMS tasks." });
  }
};