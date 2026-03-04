import mongoose from 'mongoose';

const gbFeaturesSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  
  // Privacy Features
  privacy: {
    // Hide online status while still seeing others
    hideOnlineStatus: { type: Boolean, default: false },
    
    // Freeze last seen at a specific time
    freezeLastSeen: { type: Boolean, default: false },
    frozenLastSeenTime: { type: Date },
    
    // Hide blue ticks (read receipts)
    hideBlueTicks: { type: Boolean, default: false },
    
    // Hide second tick (message delivery)
    hideSecondTick: { type: Boolean, default: false },
    
    // Hide forward label on forwarded messages
    hideForwardLabel: { type: Boolean, default: false },
    
    // Anti-status view (view status without sender knowing)
    antiStatusView: { type: Boolean, default: false },
    
    // Anti-delete status (save status before it deletes)
    antiDeleteStatus: { type: Boolean, default: false },
    
    // Anti-revoke (prevent message deletion by sender)
    antiRevoke: { type: Boolean, default: false },
    
    // View once bypass (save view once media)
    viewOnceBypass: { type: Boolean, default: false },
    
    // Incognito mode (browse without traces)
    incognitoMode: { type: Boolean, default: false }
  },
  
  // Customization Features
  customization: {
    // Custom themes
    customTheme: {
      enabled: { type: Boolean, default: false },
      themeId: { type: String },
      primaryColor: { type: String, default: '#25D366' },
      secondaryColor: { type: String, default: '#128C7E' },
      backgroundImage: { type: String },
      chatBubbles: { type: String, enum: ['default', 'rounded', 'square', 'modern'], default: 'default' }
    },
    
    // Custom fonts
    customFont: {
      enabled: { type: Boolean, default: false },
      fontFamily: { type: String, default: 'Inter' },
      fontSize: { type: Number, default: 14, min: 10, max: 24 }
    },
    
    // Icon pack
    iconPack: { type: String, enum: ['default', 'minimal', 'colorful', 'outline'], default: 'default' },
    
    // Home screen widget settings
    widgetSettings: {
      enabled: { type: Boolean, default: false },
      widgetType: { type: String, enum: ['chat', 'stories', 'quick-actions'], default: 'chat' },
      showUnreadCount: { type: Boolean, default: true },
      showProfilePicture: { type: Boolean, default: true }
    }
  },
  
  // Message Features
  messaging: {
    // Message scheduling
    scheduleMessages: { type: Boolean, default: true },
    
    // Auto-delete messages
    autoDelete: {
      enabled: { type: Boolean, default: false },
      timer: { type: Number, enum: [24, 48, 168, 720], default: 24 } // hours
    },
    
    // Message pinning (pin important messages)
    pinnedMessages: [{
      messageId: { type: mongoose.Schema.Types.ObjectId },
      chatId: { type: String },
      pinnedAt: { type: Date, default: Date.now }
    }],
    
    // Star messages
    starredMessages: [{
      messageId: { type: mongoose.Schema.Types.ObjectId },
      chatId: { type: String },
      starredAt: { type: Date, default: Date.now }
    }],
    
    // Chat filters
    chatFilters: [{
      id: { type: String },
      name: { type: String },
      chatIds: [{ type: String }],
      color: { type: String }
    }],
    
    // DND mode
    dndMode: {
      enabled: { type: Boolean, default: false },
      startTime: { type: String }, // HH:mm format
      endTime: { type: String }, // HH:mm format
      allowExceptions: { type: Boolean, default: true },
      exceptionContacts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
    }
  },
  
  // Media Features
  media: {
    // HD quality upload
    hdUpload: { type: Boolean, default: true },
    
    // Auto-download settings
    autoDownload: {
      mobileData: {
        photos: { type: Boolean, default: false },
        videos: { type: Boolean, default: false },
        audio: { type: Boolean, default: true },
        documents: { type: Boolean, default: true }
      },
      wifi: {
        photos: { type: Boolean, default: true },
        videos: { type: Boolean, default: true },
        audio: { type: Boolean, default: true },
        documents: { type: Boolean, default: true }
      }
    },
    
    // Media zoom
    mediaZoom: { type: Boolean, default: true },
    
    // Gallery viewer
    galleryViewer: { type: Boolean, default: true },
    
    // Save status automatically
    autoSaveStatus: { type: Boolean, default: false }
  },
  
  // Group Features
  groups: {
    // Join groups via link
    joinViaLink: { type: Boolean, default: true },
    
    // Group info customization
    groupInfoCustomization: {
      customGroupIcons: { type: Boolean, default: true },
      groupDescription: { type: Boolean, default: true },
      groupRules: { type: Boolean, default: true }
    },
    
    // Auto-join groups
    autoJoinGroups: { type: Boolean, default: false },
    
    // Hide from groups
    hiddenGroups: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Group' }]
  },
  
  // Advanced Features
  advanced: {
    // Copy sent messages
    copySentMessages: { type: Boolean, default: true },
    
    // Larger video status limit (60s instead of 30s)
    extendedStatusLimit: { type: Boolean, default: true },
    
    // Maximum video quality in calls
    maxCallQuality: { type: String, enum: ['SD', 'HD', 'FHD'], default: 'HD' },
    
    // Show exact message timestamp
    exactTimestamps: { type: Boolean, default: false },
    
    // Confirm before clearing chats
    confirmClearChats: { type: Boolean, default: true },
    
    // Archive on swipe
    archiveOnSwipe: { type: Boolean, default: false },
    
    // Enter key to send
    enterToSend: { type: Boolean, default: true },
    
    // Double tap to reply
    doubleTapToReply: { type: Boolean, default: true }
  },
  
  // Statistics
  stats: {
    messagesScheduled: { type: Number, default: 0 },
    statusesSaved: { type: Number, default: 0 },
    messagesUnrevoked: { type: Number, default: 0 },
    customThemesUsed: { type: Number, default: 0 }
  }
  
}, {
  timestamps: true
});

// Index for faster lookups
gbFeaturesSchema.index({ userId: 1 });

const GBFeatures = mongoose.model('GBFeatures', gbFeaturesSchema);

export default GBFeatures;
