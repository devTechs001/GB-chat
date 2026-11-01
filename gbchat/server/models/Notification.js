// models/Notification.js
import mongoose from 'mongoose';
import { sendToUser } from '../services/webPushService.js';

/**
 * In-app notification feed.
 * Separate from the per-user *settings* (notificationController) — this model
 * stores the actual events a user receives: story reactions/replies, group
 * invites, contact requests, call misses, security alerts.
 */
const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        'message',
        'story_reaction',
        'story_reply',
        'story_view',
        'group_invite',
        'group_mention',
        'contact_request',
        'contact_accepted',
        'missed_call',
        'security',
        'system',
      ],
      default: 'system',
      index: true,
    },
    title: { type: String, required: true, trim: true },
    body: { type: String, default: '', trim: true },
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    // Generic link targets so the client can deep-link
    chatId: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat', default: null },
    storyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Story', default: null },
    groupId: { type: mongoose.Schema.Types.ObjectId, default: null },
    callId: { type: mongoose.Schema.Types.ObjectId, ref: 'Call', default: null },
    actionUrl: { type: String, default: '' },
    data: { type: mongoose.Schema.Types.Mixed, default: {} },
    isRead: { type: Boolean, default: false, index: true },
    readAt: { type: Date, default: null },
  },
  { timestamps: true }
);

notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ user: 1, isRead: 1 });

notificationSchema.methods.markRead = async function markRead() {
  if (this.isRead) return this;
  this.isRead = true;
  this.readAt = new Date();
  await this.save();
  return this;
};

/**
 * Where a notification should take the user when they tap it.
 * Falls back to the type's natural screen when the caller did not set one.
 */
const deepLinkFor = (notification) => {
  if (notification.actionUrl) return notification.actionUrl;
  if (notification.chatId) return `/chats/${notification.chatId}`;
  if (notification.storyId) return `/stories`;
  if (notification.callId) return `/calls`;
  if (notification.groupId) return `/groups/${notification.groupId}`;
  return { contact_request: '/contacts', security: '/settings' }[notification.type] || '/notifications';
};

notificationSchema.statics.createFor = async function createFor(payload) {
  try {
    const notification = await this.create(payload);

    // Best-effort Web Push to every browser this user has registered. The
    // in-app feed is the source of truth; a push-service outage must never
    // fail the action that produced the notification, so this is not awaited.
    if (notification) {
      sendToUser(notification.user, {
        title: notification.title,
        body: notification.body,
        url: deepLinkFor(notification),
        tag: `notification-${notification.type}-${notification._id}`,
        type: notification.type,
        data: { notificationId: String(notification._id), type: notification.type },
      }).catch(() => {});
    }

    return notification;
  } catch (error) {
    // Notifications must never break the main action
    console.error('Failed to create notification:', error.message);
    return null;
  }
};

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
