import mongoose from 'mongoose';

const permissionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
    // Index automatically created by unique: true
  },

  // Device Permissions
  devicePermissions: {
    contacts: {
      granted: { type: Boolean, default: false },
      grantedAt: Date,
      lastRequested: Date,
      requestCount: { type: Number, default: 0 }
    },
    camera: {
      granted: { type: Boolean, default: false },
      grantedAt: Date,
      lastRequested: Date,
      requestCount: { type: Number, default: 0 }
    },
    microphone: {
      granted: { type: Boolean, default: false },
      grantedAt: Date,
      lastRequested: Date,
      requestCount: { type: Number, default: 0 }
    },
    mediaLibrary: {
      granted: { type: Boolean, default: false },
      grantedAt: Date,
      lastRequested: Date,
      requestCount: { type: Number, default: 0 }
    },
    photos: {
      granted: { type: Boolean, default: false },
      grantedAt: Date,
      lastRequested: Date,
      requestCount: { type: Number, default: 0 }
    },
    storage: {
      granted: { type: Boolean, default: false },
      grantedAt: Date,
      lastRequested: Date,
      requestCount: { type: Number, default: 0 }
    },
    location: {
      granted: { type: Boolean, default: false },
      grantedAt: Date,
      lastRequested: Date,
      requestCount: { type: Number, default: 0 },
      accuracy: { type: String, enum: ['precise', 'approximate'], default: 'precise' }
    },
    notifications: {
      granted: { type: Boolean, default: true },
      grantedAt: Date,
      lastRequested: Date,
      requestCount: { type: Number, default: 0 },
      settings: {
        showPreview: { type: Boolean, default: true },
        sound: { type: Boolean, default: true },
        badge: { type: Boolean, default: true },
        banner: { type: Boolean, default: true },
        lockScreen: { type: Boolean, default: true }
      }
    },
    bluetooth: {
      granted: { type: Boolean, default: false },
      grantedAt: Date,
      lastRequested: Date,
      requestCount: { type: Number, default: 0 }
    },
    nearbyDevices: {
      granted: { type: Boolean, default: false },
      grantedAt: Date,
      lastRequested: Date,
      requestCount: { type: Number, default: 0 }
    },
    calendar: {
      granted: { type: Boolean, default: false },
      grantedAt: Date,
      lastRequested: Date,
      requestCount: { type: Number, default: 0 }
    },
    phone: {
      granted: { type: Boolean, default: false },
      grantedAt: Date,
      lastRequested: Date,
      requestCount: { type: Number, default: 0 }
    },
    sms: {
      granted: { type: Boolean, default: false },
      grantedAt: Date,
      lastRequested: Date,
      requestCount: { type: Number, default: 0 }
    }
  },

  // App Feature Permissions
  featurePermissions: {
    voiceMessages: { type: Boolean, default: true },
    videoCalls: { type: Boolean, default: true },
    locationSharing: { type: Boolean, default: true },
    fileSharing: { type: Boolean, default: true },
    screenSharing: { type: Boolean, default: true },
    readReceipts: { type: Boolean, default: true },
    typingIndicator: { type: Boolean, default: true },
    lastSeen: { type: Boolean, default: true },
    profilePhoto: { type: Boolean, default: true },
    statusUpdates: { type: Boolean, default: true }
  },

  // Privacy Permissions (who can see what)
  privacyPermissions: {
    whoCanSeeOnline: { 
      type: String, 
      enum: ['everyone', 'contacts', 'nobody'], 
      default: 'everyone' 
    },
    whoCanSeeLastSeen: { 
      type: String, 
      enum: ['everyone', 'contacts', 'nobody'], 
      default: 'everyone' 
    },
    whoCanSeeProfilePhoto: { 
      type: String, 
      enum: ['everyone', 'contacts', 'nobody'], 
      default: 'everyone' 
    },
    whoCanSeeStatus: { 
      type: String, 
      enum: ['everyone', 'contacts', 'nobody'], 
      default: 'everyone' 
    },
    whoCanAddToGroups: { 
      type: String, 
      enum: ['everyone', 'contacts', 'nobody'], 
      default: 'everyone' 
    },
    whoCanCall: { 
      type: String, 
      enum: ['everyone', 'contacts', 'nobody'], 
      default: 'everyone' 
    },
    readReceipts: { type: Boolean, default: true },
    typingIndicator: { type: Boolean, default: true }
  },

  // Blocked Users
  blockedUsers: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    blockedAt: { type: Date, default: Date.now },
    reason: String
  }],

  // Permission History
  permissionHistory: [{
    permissionType: String,
    action: { type: String, enum: ['granted', 'denied', 'revoked'] },
    timestamp: { type: Date, default: Date.now },
    device: String
  }]

}, {
  timestamps: true
});

// Note: userId index is automatically created by unique: true

// Method to update permission status
permissionSchema.methods.updatePermission = async function(permissionType, granted, device = 'unknown') {
  const parts = permissionType.split('.');
  let current = this.devicePermissions;
  
  for (let i = 0; i < parts.length - 1; i++) {
    current = current[parts[i]];
  }
  
  const lastPart = parts[parts.length - 1];
  current[lastPart].granted = granted;
  current[lastPart].lastRequested = new Date();
  current[lastPart].requestCount += 1;
  
  if (granted) {
    current[lastPart].grantedAt = new Date();
  }
  
  // Add to history
  this.permissionHistory.push({
    permissionType,
    action: granted ? 'granted' : 'denied',
    timestamp: new Date(),
    device
  });
  
  await this.save();
  return this;
};

// Method to check if permission is granted
permissionSchema.methods.hasPermission = function(permissionType) {
  const parts = permissionType.split('.');
  let current = this.devicePermissions;
  
  for (let i = 0; i < parts.length - 1; i++) {
    current = current[parts[i]];
  }
  
  const lastPart = parts[parts.length - 1];
  return current[lastPart]?.granted || false;
};

// Method to block user
permissionSchema.methods.blockUser = async function(userId, reason = '') {
  if (!this.blockedUsers.some(u => u.userId.toString() === userId.toString())) {
    this.blockedUsers.push({ userId, blockedAt: new Date(), reason });
    await this.save();
  }
  return this;
};

// Method to unblock user
permissionSchema.methods.unblockUser = async function(userId) {
  this.blockedUsers = this.blockedUsers.filter(u => u.userId.toString() !== userId.toString());
  await this.save();
  return this;
};

// Method to check if user is blocked
permissionSchema.methods.isUserBlocked = function(userId) {
  return this.blockedUsers.some(u => u.userId.toString() === userId.toString());
};

export default mongoose.model('Permission', permissionSchema);
