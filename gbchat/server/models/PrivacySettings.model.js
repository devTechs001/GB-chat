// models/PrivacySettings.model.js
import mongoose from 'mongoose';

const privacySettingsSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    // Last Seen & Online
    lastSeen: {
        visible: {
            type: String,
            enum: ['everyone', 'contacts', 'nobody'],
            default: 'everyone'
        },
        customExclude: [mongoose.Schema.Types.ObjectId] // Hide from specific users
    },
    online: {
        visible: {
            type: String,
            enum: ['everyone', 'contacts', 'nobody'],
            default: 'everyone'
        }
    },
    
    // Profile Photo
    profilePhoto: {
        visible: {
            type: String,
            enum: ['everyone', 'contacts', 'nobody'],
            default: 'everyone'
        }
    },
    
    // About/Status
    about: {
        visible: {
            type: String,
            enum: ['everyone', 'contacts', 'nobody'],
            default: 'everyone'
        }
    },
    
    // Status/Stories
    status: {
        visible: {
            type: String,
            enum: ['everyone', 'contacts', 'custom'],
            default: 'everyone'
        },
        customInclude: [mongoose.Schema.Types.ObjectId], // Show to specific users
        customExclude: [mongoose.Schema.Types.ObjectId]  // Hide from specific users
    },
    
    // Read Receipts
    readReceipts: {
        enabled: {
            type: Boolean,
            default: true
        }
    },
    
    // Blue Ticks
    blueTicks: {
        enabled: {
            type: Boolean,
            default: true
        }
    },
    
    // Group Privacy
    groups: {
        whoCanAdd: {
            type: String,
            enum: ['everyone', 'contacts', 'contacts_except'],
            default: 'everyone'
        },
        customExclude: [mongoose.Schema.Types.ObjectId]
    },
    
    // Call Privacy
    calls: {
        whoCanCall: {
            type: String,
            enum: ['everyone', 'contacts', 'nobody'],
            default: 'everyone'
        },
        silentUnknown: {
            type: Boolean,
            default: false  // Silence calls from unknown numbers
        }
    },
    
    // Message Privacy
    messages: {
        disappearingMessages: {
            enabled: {
                type: Boolean,
                default: false
            },
            duration: {
                type: Number,  // in seconds
                enum: [86400, 604800, 7776000],  // 24h, 7 days, 90 days
                default: 604800
            }
        },
        defaultTimer: {
            type: Number,
            default: 0  // No default timer
        }
    },
    
    // Media Privacy
    media: {
        autoDownload: {
            mobileData: {
                photos: { type: Boolean, default: true },
                videos: { type: Boolean, default: false },
                documents: { type: Boolean, default: false }
            },
            wifi: {
                photos: { type: Boolean, default: true },
                videos: { type: Boolean, default: true },
                documents: { type: Boolean, default: true }
            },
            roaming: {
                photos: { type: Boolean, default: false },
                videos: { type: Boolean, default: false },
                documents: { type: Boolean, default: false }
            }
        },
        saveToGallery: {
            type: Boolean,
            default: true
        }
    },
    
    // Blocked Contacts
    blockedContacts: [{
        userId: mongoose.Schema.Types.ObjectId,
        blockedAt: {
            type: Date,
            default: Date.now
        },
        reason: String
    }],
    
    // Security
    security: {
        twoFactorAuth: {
            enabled: {
                type: Boolean,
                default: false
            },
            method: {
                type: String,
                enum: ['sms', 'email', 'authenticator'],
                default: 'sms'
            }
        },
        fingerprintLock: {
            enabled: {
                type: Boolean,
                default: false
            },
            lockAfter: {
                type: Number,  // seconds
                default: 60
            }
        },
        screenSecurity: {
            preventScreenshots: {
                type: Boolean,
                default: false
            },
            blurInRecents: {
                type: Boolean,
                default: false
            }
        }
    },
    
    // Activity Status
    activityStatus: {
        showActivity: {
            type: Boolean,
            default: true
        }
    },
    
    // Profile View Tracking
    profileViews: {
        trackViews: {
            type: Boolean,
            default: false
        },
        showVisitors: {
            type: Boolean,
            default: false
        }
    }
}, {
    timestamps: true
});

// Indexes
privacySettingsSchema.index({ userId: 1 });

// Static methods
privacySettingsSchema.statics.getDefaults = function() {
    return {
        lastSeen: { visible: 'everyone' },
        online: { visible: 'everyone' },
        profilePhoto: { visible: 'everyone' },
        about: { visible: 'everyone' },
        status: { visible: 'everyone' },
        readReceipts: { enabled: true },
        blueTicks: { enabled: true },
        groups: { whoCanAdd: 'everyone' },
        calls: { whoCanCall: 'everyone', silentUnknown: false },
        messages: { disappearingMessages: { enabled: false } },
        media: {
            autoDownload: {
                mobileData: { photos: true, videos: false, documents: false },
                wifi: { photos: true, videos: true, documents: true },
                roaming: { photos: false, videos: false, documents: false }
            },
            saveToGallery: true
        },
        security: {
            twoFactorAuth: { enabled: false },
            fingerprintLock: { enabled: false }
        }
    };
};

export default mongoose.models.PrivacySettings || mongoose.model('PrivacySettings', privacySettingsSchema);
