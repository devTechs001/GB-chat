// models/BusinessProfile.model.js
const mongoose = require('mongoose');

const businessProfileSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    businessName: {
        type: String,
        required: [true, 'Business name is required'],
        trim: true
    },
    category: {
        type: String,
        required: true,
        enum: ['retail', 'restaurant', 'service', 'healthcare', 'education', 'technology', 'other']
    },
    description: {
        type: String,
        maxlength: 500
    },
    verified: {
        type: Boolean,
        default: false
    },
    verificationBadge: {
        type: String,
        enum: ['none', 'verified', 'premium', 'enterprise'],
        default: 'none'
    },
    businessHours: {
        monday: { open: String, close: String, isOpen: Boolean },
        tuesday: { open: String, close: String, isOpen: Boolean },
        wednesday: { open: String, close: String, isOpen: Boolean },
        thursday: { open: String, close: String, isOpen: Boolean },
        friday: { open: String, close: String, isOpen: Boolean },
        saturday: { open: String, close: String, isOpen: Boolean },
        sunday: { open: String, close: String, isOpen: Boolean }
    },
    contactInfo: {
        email: String,
        phone: String,
        website: String,
        address: {
            street: String,
            city: String,
            state: String,
            country: String,
            postalCode: String
        }
    },
    catalog: [{
        productId: mongoose.Schema.Types.ObjectId,
        name: String,
        description: String,
        price: Number,
        images: [String],
        category: String,
        inStock: Boolean,
        createdAt: Date
    }],
    quickReplies: [{
        shortcut: String,
        message: String,
        usageCount: {
            type: Number,
            default: 0
        }
    }],
    greetingMessage: {
        enabled: {
            type: Boolean,
            default: false
        },
        message: String
    },
    awayMessage: {
        enabled: {
            type: Boolean,
            default: false
        },
        message: String,
        schedule: {
            enabled: Boolean,
            startTime: String,
            endTime: String
        }
    },
    analytics: {
        messagesSent: {
            type: Number,
            default: 0
        },
        messagesDelivered: {
            type: Number,
            default: 0
        },
        averageResponseTime: {
            type: Number,
            default: 0
        },
        conversionRate: {
            type: Number,
            default: 0
        },
        customerSatisfaction: {
            type: Number,
            default: 0
        }
    },
    socialLinks: {
        facebook: String,
        instagram: String,
        twitter: String,
        linkedin: String
    },
    paymentMethods: [{
        type: String,
        enum: ['upi', 'card', 'wallet', 'bank_transfer']
    }],
    labels: [{
        name: String,
        color: String
    }]
}, {
    timestamps: true
});

// Indexes
businessProfileSchema.index({ businessName: 'text', description: 'text' });
businessProfileSchema.index({ category: 1, verified: 1 });
businessProfileSchema.index({ userId: 1 });

module.exports = mongoose.models.BusinessProfile || mongoose.model('BusinessProfile', businessProfileSchema);
