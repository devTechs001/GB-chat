// server/socket/handlers/notificationHandler.js
import Notification from "../../models/Notification.js";
import { emitToUser } from "../../services/socketService.js";

/**
 * Notification socket handler.
 *
 * The client already listens for `notification` / `notification:new` and shows
 * a badge from `notification:count`, but nothing on the server ever registered
 * the matching listeners — this file was zero bytes and not imported by
 * `socket/index.js`. So "mark all read" and "mark read" were HTTP-only: a second
 * open tab kept showing a stale badge until it refetched.
 *
 * These handlers keep every device of the user in sync. They deliberately do
 * *not* replace the REST endpoints (those are what a fresh page load uses);
 * they are the live channel next to them.
 */
export const notificationHandler = (io, socket) => {
  const userId = socket.userId;

  /** Client asks for its current unread count (badge on connect). */
  socket.on("notification:unread", async () => {
    try {
      const unreadCount = await Notification.countDocuments({ user: userId, isRead: false });
      socket.emit("notification:count", { unreadCount });
    } catch (error) {
      console.error("[socket] unread count failed:", error.message);
    }
  });

  /** One notification read → tell the user's other tabs. */
  socket.on("notification:read", async ({ notificationId } = {}) => {
    if (!notificationId) return;
    try {
      const notification = await Notification.findOne({ _id: notificationId, user: userId });
      if (!notification || notification.isRead) return;

      notification.isRead = true;
      notification.readAt = new Date();
      await notification.save();

      emitToUser(userId, "notification:read", { notificationId: String(notificationId) });
      const unreadCount = await Notification.countDocuments({ user: userId, isRead: false });
      emitToUser(userId, "notification:count", { unreadCount });
    } catch (error) {
      console.error("[socket] mark read failed:", error.message);
    }
  });

  /** Mark everything read from any device. */
  socket.on("notification:read-all", async () => {
    try {
      await Notification.updateMany(
        { user: userId, isRead: false },
        { $set: { isRead: true, readAt: new Date() } }
      );
      emitToUser(userId, "notification:read-all", {});
      emitToUser(userId, "notification:count", { unreadCount: 0 });
    } catch (error) {
      console.error("[socket] mark all read failed:", error.message);
    }
  });

  /**
   * Typing/presence-style subscription: the feed subscribes once on mount and
   * unsubscribes on unmount instead of re-listening on every render.
   */
  socket.on("notification:subscribe", () => {
    socket.join(`notifications:${userId}`);
  });

  socket.on("notification:unsubscribe", () => {
    socket.leave(`notifications:${userId}`);
  });
};

export default notificationHandler;
