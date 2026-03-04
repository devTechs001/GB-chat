// models/Analytics.model.js
const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    date: {
        type: Date,
        required: true,
        index: true
    },
    period: {
        type: String,
        enum: ['daily', 'weekly', 'monthly', 'yearly'],
        default: 'daily'
    },
    messaging: {
        messagesSent: {
            type: Number,
            default: 0
        },
        messagesReceived: {
            type: Number,
            default: 0
        },
        messagesDeleted: {
            type: Number,
            default: 0
        },
        reactions: {
            type: Number,
            default: 0
        },
        replies: {
            type: Number,
            default: 0
        }
    },
    calls: {
        voiceCallsMade: {
            type: Number,
            default: 0
        },
        videoCallsMade: {
            type: Number,
            default: 0
        },
        groupCalls: {
            type: Number,
            default: 0
        },
        totalCallDuration: {
            type: Number,
            default: 0
        }
    },
    media: {
        photosSent: {
            type: Number,
            default: 0
        },
        videosSent: {
            type: Number,
            default: 0
        },
        voiceMessagesSent: {
            type: Number,
            default: 0
        },
        documentsSent: {
            type: Number,
            default: 0
        },
        totalMediaSize: {
            type: Number,
            default: 0
        }
    },
    chats: {
        activeChats: {
            type: Number,
            default: 0
        },
        newChats: {
            type: Number,
            default: 0
        },
        archivedChats: {
            type: Number,
            default: 0
        },
        mutedChats: {
            type: Number,
            default: 0
        },
        pinnedChats: {
            type: Number,
            default: 0
        }
    },
    groups: {
        groupsActive: {
            type: Number,
            default: 0
        },
        groupsCreated: {
            type: Number,
            default: 0
        },
        groupMessages: {
            type: Number,
            default: 0
        }
    },
    stories: {
        storiesViewed: {
            type: Number,
            default: 0
        },
        storiesPosted: {
            type: Number,
            default: 0
        },
        storyViews: {
            type: Number,
            default: 0
        },
        storyReplies: {
            type: Number,
            default: 0
        }
    },
    storage: {
        totalStorageUsed: {
            type: Number,
            default: 0
        },
        storageByType: {
            photos: Number,
            videos: Number,
            documents: Number,
            voiceMessages: Number
        }
    },
    activity: {
        mostActiveHour: Number,
        mostActiveDay: String,
        averageSessionTime: Number,
        sessionsCount: Number
    },
    topContacts: [{
        userId: mongoose.Schema.Types.ObjectId,
        messagesExchanged: Number,
        callsDuration: Number
    }]
}, {
    timestamps: true
});

// Indexes
analyticsSchema.index({ userId: 1, date: -1 });
analyticsSchema.index({ period: 1, date: -1 });

// Static methods
analyticsSchema.statics.getUserOverview = async function(userId, days = 7) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const stats = await this.aggregate([
        {
            $match: {
                userId: new mongoose.Types.ObjectId(userId),
                date: { $gte: startDate }
            }
        },
        {
            $group: {
                _id: null,
                totalMessagesSent: { $sum: '$messaging.messagesSent' },
                totalMessagesReceived: { $sum: '$messaging.messagesReceived' },
                totalCalls: { 
                    $sum: { 
                        $add: ['$calls.voiceCallsMade', '$calls.videoCallsMade'] 
                    }
                },
                totalMediaSize: { $sum: '$media.totalMediaSize' },
                avgActiveChats: { $avg: '$chats.activeChats' }
            }
        }
    ]);
    
    return stats[0] || {
        totalMessagesSent: 0,
        totalMessagesReceived: 0,
        totalCalls: 0,
        totalMediaSize: 0,
        avgActiveChats: 0
    };
};

module.exports = mongoose.models.Analytics || mongoose.model('Analytics', analyticsSchema);
