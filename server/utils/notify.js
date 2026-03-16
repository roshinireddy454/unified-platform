import { Notification } from "../models/notification.model.js";

/**
 * Create one or more notifications and push them via Socket.io.
 *
 * @param {object} io           - Socket.io server instance (from req.io)
 * @param {object|object[]} payload - Single notification object or array of them.
 *   Each object: { recipient, type, title, message, link?, metadata? }
 */
export const notify = async (io, payload) => {
  try {
    const items = Array.isArray(payload) ? payload : [payload];
    if (items.length === 0) return;

    const docs = await Notification.insertMany(
      items.map((n) => ({
        recipient: n.recipient,
        type:      n.type,
        title:     n.title,
        message:   n.message,
        link:      n.link   || "",
        metadata:  n.metadata || {},
      }))
    );

    // Push each notification over socket to the recipient's personal room
    if (io) {
      docs.forEach((doc) => {
        io.to(`user-${doc.recipient.toString()}`).emit("new-notification", {
          _id:       doc._id,
          type:      doc.type,
          title:     doc.title,
          message:   doc.message,
          link:      doc.link,
          metadata:  doc.metadata,
          isRead:    false,
          createdAt: doc.createdAt,
        });
      });
    }

    return docs;
  } catch (err) {
    // Non-fatal — log but don't crash the parent request
    console.error("notify() error:", err.message);
  }
};