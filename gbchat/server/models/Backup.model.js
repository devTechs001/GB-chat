import mongoose from 'mongoose';

const backupSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  // Backup Type
  type: {
    type: String,
    enum: ['full', 'chats', 'media', 'contacts', 'settings'],
    required: true
  },

  // Backup Status
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },

  // Backup Data
  data: {
    // Chats backup
    chats: [{
      chatId: mongoose.Schema.Types.ObjectId,
      messages: [{
        messageId: mongoose.Schema.Types.ObjectId,
        content: mongoose.Schema.Types.Mixed,
        timestamp: Date,
        sender: mongoose.Schema.Types.ObjectId
      }],
      metadata: mongoose.Schema.Types.Mixed
    }],

    // Contacts backup
    contacts: [{
      name: String,
      phoneNumber: String,
      email: String,
      avatar: String,
      isBlocked: Boolean,
      isFavorite: Boolean
    }],

    // Settings backup
    settings: {
      privacy: mongoose.Schema.Types.Mixed,
      notifications: mongoose.Schema.Types.Mixed,
      appearance: mongoose.Schema.Types.Mixed,
      chatSettings: mongoose.Schema.Types.Mixed
    },

    // Media references
    media: [{
      type: String,
      url: String,
      filename: String,
      size: Number,
      uploadedAt: Date
    }]
  },

  // Backup Metadata
  size: {
    type: Number,
    default: 0 // in bytes
  },

  messageCount: {
    type: Number,
    default: 0
  },

  contactCount: {
    type: Number,
    default: 0
  },

  // Storage Location
  storageLocation: {
    type: String,
    enum: ['local', 'cloudinary', 'email', 'google_drive', 'dropbox'],
    default: 'local'
  },

  // Email Backup
  emailBackup: {
    email: String,
    sentAt: Date,
    deliveryStatus: {
      type: String,
      enum: ['pending', 'sent', 'delivered', 'failed']
    }
  },

  // Encryption
  encrypted: {
    type: Boolean,
    default: true
  },

  encryptionKey: String, // Store encrypted key or reference

  // Backup Schedule
  isScheduled: {
    type: Boolean,
    default: false
  },

  scheduleConfig: {
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly'],
      default: 'weekly'
    },
    dayOfWeek: Number, // 0-6 (Sunday-Saturday)
    time: String, // HH:mm format
    lastBackup: Date,
    nextBackup: Date
  },

  // Expiration
  expiresAt: Date,
  autoDelete: {
    type: Boolean,
    default: false
  },
  retentionDays: {
    type: Number,
    default: 30
  }

}, {
  timestamps: true
});

// Indexes
backupSchema.index({ userId: 1, type: 1 });
backupSchema.index({ userId: 1, createdAt: -1 });
backupSchema.index({ status: 1 });

// Static method to create backup
backupSchema.statics.createBackup = async function(userId, type, data, options = {}) {
  const backup = await this.create({
    userId,
    type,
    data,
    status: 'completed',
    size: JSON.stringify(data).length,
    messageCount: data.chats?.reduce((sum, chat) => sum + (chat.messages?.length || 0), 0) || 0,
    contactCount: data.contacts?.length || 0,
    encrypted: options.encrypted !== false,
    storageLocation: options.storageLocation || 'local',
    isScheduled: options.isScheduled || false,
    scheduleConfig: options.scheduleConfig
  });

  return backup;
};

// Method to export backup data
backupSchema.methods.exportData = async function(format = 'json') {
  if (format === 'json') {
    return JSON.stringify(this.data, null, 2);
  }
  
  if (format === 'csv' && this.type === 'contacts') {
    const contacts = this.data.contacts || [];
    const headers = ['Name', 'Phone Number', 'Email', 'Avatar', 'Blocked', 'Favorite'];
    const rows = contacts.map(c => [
      c.name,
      c.phoneNumber,
      c.email,
      c.avatar,
      c.isBlocked,
      c.isFavorite
    ]);
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }
  
  throw new Error('Unsupported export format');
};

// Method to check if backup is expired
backupSchema.methods.isExpired = function() {
  if (this.expiresAt) {
    return new Date() > this.expiresAt;
  }
  return false;
};

export default mongoose.model('Backup', backupSchema);
