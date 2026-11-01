// models/Notification.js
import mongoose from 'mongoose';

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

notificationSchema.statics.createFor = async function createFor(payload) {
  try {
    return await this.create(payload);
  } catch (error) {
    // Notifications must never break the main action
    console.error('Failed to create notification:', error.message);
    return null;
  }
};

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
