// controllers/notificationFeedController.js
import asyncHandler from 'express-async-handler';
import Notification from '../models/Notification.js';

/**
 * In-app notification feed endpoints.
 * Settings/permission endpoints live in notificationController.js.
 */

// @desc    List my notifications
// @route   GET /api/notifications
export const getNotifications = asyncHandler(async (req, res) => {
  const { page = 1, limit = 30, unread, type } = req.query;
  const filter = { user: req.user._id };

  if (unread === 'true') filter.isRead = false;
  if (type) filter.type = type;

  const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
  const pageSize = Math.min(Math.max(parseInt(limit, 10) || 30, 1), 100);

  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find(filter)
      .populate('actor', 'fullName avatar')
      .sort({ createdAt: -1 })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize),
    Notification.countDocuments(filter),
    Notification.countDocuments({ user: req.user._id, isRead: false }),
  ]);

  res.json({
    success: true,
    notifications,
    unreadCount,
    pagination: {
      total,
      page: pageNumber,
      pages: Math.ceil(total / pageSize) || 1,
      hasMore: pageNumber * pageSize < total,
    },
  });
});

// @desc    Unread badge count
// @route   GET /api/notifications/unread-count
export const getUnreadCount = asyncHandler(async (req, res) => {
  const unreadCount = await Notification.countDocuments({
    user: req.user._id,
    isRead: false,
  });
  res.json({ success: true, unreadCount });
});

// @desc    Mark one notification read
// @route   PATCH /api/notifications/:id/read
export const markNotificationRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!notification) {
    res.status(404);
    throw new Error('Notification not found');
  }

  await notification.markRead();
  const unreadCount = await Notification.countDocuments({
    user: req.user._id,
    isRead: false,
  });

  res.json({ success: true, notification, unreadCount });
});

// @desc    Mark all notifications read
// @route   PATCH /api/notifications/read-all
export const markAllRead = asyncHandler(async (req, res) => {
  const result = await Notification.updateMany(
    { user: req.user._id, isRead: false },
    { $set: { isRead: true, readAt: new Date() } }
  );

  res.json({ success: true, modified: result.modifiedCount, unreadCount: 0 });
});

// @desc    Delete one notification
// @route   DELETE /api/notifications/:id
export const deleteNotification = asyncHandler(async (req, res) => {
  const deleted = await Notification.findOneAndDelete({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!deleted) {
    res.status(404);
    throw new Error('Notification not found');
  }

  const unreadCount = await Notification.countDocuments({
    user: req.user._id,
    isRead: false,
  });

  res.json({ success: true, unreadCount });
});

// @desc    Clear the whole feed
// @route   DELETE /api/notifications
export const clearNotifications = asyncHandler(async (req, res) => {
  await Notification.deleteMany({ user: req.user._id });
  res.json({ success: true, unreadCount: 0 });
});
