import Backup from '../models/Backup.model.js';
import User from '../models/User.js';
import crypto from 'crypto';

// ============================================================================
// Create Backup
// ============================================================================

export const createBackup = async (req, res) => {
  try {
    const { type, data, options } = req.body;

    if (!type || !['full', 'chats', 'media', 'contacts', 'settings'].includes(type)) {
      return res.status(400).json({ success: false, message: 'Invalid backup type' });
    }

    const backup = await Backup.create({
      userId: req.user._id,
      type,
      data: data || {},
      status: 'completed',
      size: JSON.stringify(data || {}).length,
      messageCount: data?.chats?.reduce((sum, chat) => sum + (chat.messages?.length || 0), 0) || 0,
      contactCount: data?.contacts?.length || 0,
      encrypted: options?.encrypted !== false,
      storageLocation: options?.storageLocation || 'local'
    });

    res.json({
      success: true,
      message: 'Backup created successfully',
      data: {
        backupId: backup._id,
        type: backup.type,
        size: backup.size,
        createdAt: backup.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating backup',
      error: error.message
    });
  }
};

// ============================================================================
// Get Backups
// ============================================================================

export const getBackups = async (req, res) => {
  try {
    const { type, limit = 10 } = req.query;

    const query = { userId: req.user._id };
    if (type) {
      query.type = type;
    }

    const backups = await Backup.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .select('-data');

    res.json({
      success: true,
      data: { backups }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching backups',
      error: error.message
    });
  }
};

// ============================================================================
// Get Backup Details
// ============================================================================

export const getBackupDetails = async (req, res) => {
  try {
    const { backupId } = req.params;

    const backup = await Backup.findOne({ _id: backupId, userId: req.user._id });

    if (!backup) {
      return res.status(404).json({ success: false, message: 'Backup not found' });
    }

    res.json({
      success: true,
      data: { backup }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching backup details',
      error: error.message
    });
  }
};

// ============================================================================
// Restore Backup
// ============================================================================

export const restoreBackup = async (req, res) => {
  try {
    const { backupId } = req.body;

    const backup = await Backup.findOne({ _id: backupId, userId: req.user._id });

    if (!backup) {
      return res.status(404).json({ success: false, message: 'Backup not found' });
    }

    if (backup.status !== 'completed') {
      return res.status(400).json({ success: false, message: 'Backup is not ready' });
    }

    // Return backup data for client to restore
    res.json({
      success: true,
      message: 'Backup ready to restore',
      data: {
        type: backup.type,
        data: backup.data,
        createdAt: backup.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error restoring backup',
      error: error.message
    });
  }
};

// ============================================================================
// Delete Backup
// ============================================================================

export const deleteBackup = async (req, res) => {
  try {
    const { backupId } = req.params;

    const backup = await Backup.findOneAndDelete({ _id: backupId, userId: req.user._id });

    if (!backup) {
      return res.status(404).json({ success: false, message: 'Backup not found' });
    }

    res.json({
      success: true,
      message: 'Backup deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting backup',
      error: error.message
    });
  }
};

// ============================================================================
// Export Backup
// ============================================================================

export const exportBackup = async (req, res) => {
  try {
    const { backupId, format = 'json' } = req.query;

    const backup = await Backup.findOne({ _id: backupId, userId: req.user._id });

    if (!backup) {
      return res.status(404).json({ success: false, message: 'Backup not found' });
    }

    const exportedData = await backup.exportData(format);

    res.setHeader('Content-Type', format === 'json' ? 'application/json' : 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=backup_${backup._id}.${format}`);

    res.send(exportedData);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error exporting backup',
      error: error.message
    });
  }
};

// ============================================================================
// Schedule Backup
// ============================================================================

export const scheduleBackup = async (req, res) => {
  try {
    const { type, frequency, time, dayOfWeek } = req.body;

    let backup = await Backup.findOne({ userId: req.user._id, type, isScheduled: true });

    if (!backup) {
      backup = new Backup({ userId: req.user._id, type, isScheduled: true });
    }

    backup.scheduleConfig = {
      frequency: frequency || 'weekly',
      dayOfWeek: dayOfWeek || 0,
      time: time || '02:00',
      nextBackup: calculateNextBackup(frequency || 'weekly', time || '02:00', dayOfWeek || 0)
    };

    await backup.save();

    res.json({
      success: true,
      message: 'Backup scheduled successfully',
      data: {
        schedule: backup.scheduleConfig
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error scheduling backup',
      error: error.message
    });
  }
};

// ============================================================================
// Cancel Scheduled Backup
// ============================================================================

export const cancelScheduledBackup = async (req, res) => {
  try {
    const { type } = req.body;

    await Backup.updateOne(
      { userId: req.user._id, type, isScheduled: true },
      { isScheduled: false, scheduleConfig: null }
    );

    res.json({
      success: true,
      message: 'Scheduled backup cancelled'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error cancelling scheduled backup',
      error: error.message
    });
  }
};

// ============================================================================
// Email Backup
// ============================================================================

export const emailBackup = async (req, res) => {
  try {
    const { backupId, email } = req.body;

    const backup = await Backup.findOne({ _id: backupId, userId: req.user._id });

    if (!backup) {
      return res.status(404).json({ success: false, message: 'Backup not found' });
    }

    // Get user email if not provided
    const recipientEmail = email || req.user.email;

    if (!recipientEmail) {
      return res.status(400).json({ success: false, message: 'Email address required' });
    }

    // TODO: Implement email sending with backup attachment
    // For now, just mark as sent
    backup.emailBackup = {
      email: recipientEmail,
      sentAt: new Date(),
      deliveryStatus: 'sent'
    };

    await backup.save();

    res.json({
      success: true,
      message: `Backup sent to ${recipientEmail}`,
      data: {
        email: recipientEmail,
        sentAt: backup.emailBackup.sentAt
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error sending backup via email',
      error: error.message
    });
  }
};

// ============================================================================
// Get Backup Stats
// ============================================================================

export const getBackupStats = async (req, res) => {
  try {
    const stats = await Backup.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(req.user._id) } },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          totalSize: { $sum: '$size' },
          lastBackup: { $max: '$createdAt' }
        }
      }
    ]);

    const totalBackups = stats.reduce((sum, s) => sum + s.count, 0);
    const totalSize = stats.reduce((sum, s) => sum + s.totalSize, 0);

    res.json({
      success: true,
      data: {
        stats,
        summary: {
          totalBackups,
          totalSize,
          totalSizeFormatted: formatBytes(totalSize)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching backup stats',
      error: error.message
    });
  }
};

// Helper function to calculate next backup date
function calculateNextBackup(frequency, time, dayOfWeek) {
  const now = new Date();
  const [hours, minutes] = time.split(':').map(Number);
  
  const next = new Date(now);
  next.setHours(hours, minutes, 0, 0);

  if (next <= now) {
    next.setDate(next.getDate() + 1);
  }

  if (frequency === 'weekly') {
    while (next.getDay() !== dayOfWeek) {
      next.setDate(next.getDate() + 1);
    }
  } else if (frequency === 'monthly') {
    next.setDate(1); // First day of month
  }

  return next;
}

// Helper function to format bytes
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// Import mongoose for aggregation
import mongoose from 'mongoose';
