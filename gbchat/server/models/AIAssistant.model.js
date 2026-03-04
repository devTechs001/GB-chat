// models/AIAssistant.model.js
const mongoose = require('mongoose');

const aiAssistantSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    enabled: {
        type: Boolean,
        default: true
    },
    preferences: {
        autoReply: {
            enabled: {
                type: Boolean,
                default: false
            },
            customMessages: [String],
            learnFromChat: {
                type: Boolean,
                default: true
            }
        },
        smartReplies: {
            enabled: {
                type: Boolean,
                default: true
            },
            suggestionsCount: {
                type: Number,
                default: 3
            }
        },
        translation: {
            enabled: {
                type: Boolean,
                default: false
            },
            targetLanguage: {
                type: String,
                default: 'en'
            },
            autoDetect: {
                type: Boolean,
                default: true
            }
        },
        sentimentAnalysis: {
            enabled: {
                type: Boolean,
                default: false
            },
            alertOnNegative: {
                type: Boolean,
                default: true
            }
        },
        spamDetection: {
            enabled: {
                type: Boolean,
                default: true
            },
            autoBlock: {
                type: Boolean,
                default: false
            }
        },
        messageSummarization: {
            enabled: {
                type: Boolean,
                default: false
            },
            minLength: {
                type: Number,
                default: 100
            }
        }
    },
    conversationHistory: [{
        chatId: mongoose.Schema.Types.ObjectId,
        messageId: mongoose.Schema.Types.ObjectId,
        originalText: String,
        aiResponse: String,
        action: String,
        timestamp: Date,
        feedback: {
            helpful: Boolean,
            rating: Number
        }
    }],
    trainedOn: Date,
    modelVersion: {
        type: String,
        default: 'v2.0'
    },
    usageStats: {
        totalInteractions: {
            type: Number,
            default: 0
        },
        smartRepliesUsed: {
            type: Number,
            default: 0
        },
        translationsDone: {
            type: Number,
            default: 0
        },
        spamDetected: {
            type: Number,
            default: 0
        }
    }
}, {
    timestamps: true
});

// Indexes
aiAssistantSchema.index({ userId: 1, enabled: 1 });

module.exports = mongoose.models.AIAssistant || mongoose.model('AIAssistant', aiAssistantSchema);
