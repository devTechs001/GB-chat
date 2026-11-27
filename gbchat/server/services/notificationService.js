// server/services/notificationService.js
import Notification from "../models/Notification.js";
import { emitToUser } from "./socketService.js";

/**
 * Notification fan-out: persist → push → realtime.
 *
 * `Notification.createFor` already handles persistence + Web Push (registered
 * devices, so it reaches a closed browser). What was missing is the third
 * channel: a user with the app open saw nothing until the feed was refetched,
 * because no `notification` socket event was emitted when a notification was
 * created. (The client already listens for it — hooks/useSocket.js.)
 *
 * Every function here swallows its own failures: a notification is a side
 * effect and must never fail the action that produced it.
 */

const shape = (notification) => ({
  _id: String(notification._id),
  type: notification.type,
  title: notification.title,
  body: notification.body,
  actor: notification.actor,
  chatId: notification.chatId,
  storyId: notification.storyId,
  groupId: notification.groupId,
  callId: notification.callId,
  actionUrl: notification.actionUrl,
  data: notification.data,
  isRead: Boolean(notification.isRead),
  createdAt: notification.createdAt,
});

/**
 * Create a notification for one user and deliver it on both channels.
 *
 * @param {object} payload  Notification fields (`user` is required)
 * @param {{ realtime?: boolean }} options
 * @returns {Promise<object|null>} the created document, or null on failure
 */
export const notifyUser = async (payload, { realtime = true } = {}) => {
  if (!payload?.user || !payload?.title) return null;

  try {
    const notification = await Notification.createFor(payload);
    if (!notification) return null;

    if (realtime) {
      emitToUser(notification.user, "notification:new", shape(notification));
      emitToUser(notification.user, "notification", shape(notification));
    }

    return notification;
  } catch (error) {
    console.error("[notifications] could not notify user:", error.message);
    return null;
  }
};

/** Notify many users with the same payload (e.g. every member of a group). */
export const notifyUsers = async (userIds = [], payload = {}, options) => {
  const unique = [...new Set((userIds || []).filter(Boolean).map(String))];
  const created = [];
  for (const user of unique) {
    // Sequential on purpose: a fan-out to 200 members should not open 200
    // concurrent writes against a connection pool of 10.
    // eslint-disable-next-line no-await-in-loop
    const notification = await notifyUser({ ...payload, user }, options);
    if (notification) created.push(notification);
  }
  return created;
};

/** Mark one notification read and keep other tabs in sync. */
export const markRead = async (notification) => {
  if (!notification) return null;
  try {
    if (typeof notification.markRead === "function") await notification.markRead();
    else {
      notification.isRead = true;
      notification.readAt = new Date();
      await notification.save();
    }
    emitToUser(notification.user, "notification:read", {
      notificationId: String(notification._id),
    });
    return notification;
  } catch (error) {
    console.error("[notifications] markRead failed:", error.message);
    return notification;
  }
};

/** Push an unread count so the badge updates without a refetch. */
export const broadcastUnreadCount = async (userId) => {
  try {
    const unreadCount = await Notification.countDocuments({ user: userId, isRead: false });
    emitToUser(userId, "notification:count", { unreadCount });
    return unreadCount;
  } catch {
    return null;
  }
};

export default { notifyUser, notifyUsers, markRead, broadcastUnreadCount };
