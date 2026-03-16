import { Notification } from "../models/notification.model.js";

// GET /api/v1/notifications  — get the logged-in user's notifications (latest 50)
export const getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.id })
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = await Notification.countDocuments({ recipient: req.id, isRead: false });

    return res.status(200).json({ success: true, notifications, unreadCount });
  } catch (err) {
    console.error("getMyNotifications:", err);
    return res.status(500).json({ success: false, message: "Failed to fetch notifications." });
  }
};

// PATCH /api/v1/notifications/:id/read  — mark one as read
export const markOneRead = async (req, res) => {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.id },
      { isRead: true }
    );
    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to mark as read." });
  }
};

// PATCH /api/v1/notifications/read-all  — mark ALL as read
export const markAllRead = async (req, res) => {
  try {
    await Notification.updateMany({ recipient: req.id, isRead: false }, { isRead: true });
    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to mark all as read." });
  }
};

// DELETE /api/v1/notifications/:id  — delete one
export const deleteOne = async (req, res) => {
  try {
    await Notification.findOneAndDelete({ _id: req.params.id, recipient: req.id });
    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to delete notification." });
  }
};

// DELETE /api/v1/notifications  — clear all
export const clearAll = async (req, res) => {
  try {
    await Notification.deleteMany({ recipient: req.id });
    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to clear notifications." });
  }
};