// models/Contact.model.js
import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    name: {
        type: String,
        required: [true, 'Contact name is required'],
        trim: true
    },
    phoneNumber: {
        type: String,
        required: [true, 'Phone number is required'],
        trim: true,
        index: true
    },
    alternateNumbers: [String],
    email: {
        type: String,
        trim: true,
        lowercase: true
    },
    avatar: {
        type: String,
        default: ''
    },
    isBlocked: {
        type: Boolean,
        default: false
    },
    isFavorite: {
        type: Boolean,
        default: false,
        index: true
    },
    labels: [{
        type: String,
        enum: ['family', 'friends', 'work', 'business', 'other']
    }],
    notes: String,
    birthday: Date,
    socialLinks: {
        facebook: String,
        twitter: String,
        instagram: String,
        linkedin: String
    },
    addresses: [{
        type: {
            type: String,
            enum: ['home', 'work', 'other']
        },
        street: String,
        city: String,
        state: String,
        country: String,
        postalCode: String
    }],
    customFields: [{
        key: String,
        value: String
    }],
    syncedFrom: {
        type: String,
        enum: ['phone', 'google', 'icloud', 'manual'],
        default: 'manual'
    },
    lastContactedAt: Date,
    contactCount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Indexes
contactSchema.index({ userId: 1, name: 1 });
contactSchema.index({ userId: 1, isFavorite: 1 });
contactSchema.index({ userId: 1, isBlocked: 1 });
contactSchema.index({ phoneNumber: 1 });

// Static methods
contactSchema.statics.searchContacts = async function(userId, query) {
    return this.find({
        userId,
        $or: [
            { name: { $regex: query, $options: 'i' } },
            { phoneNumber: { $regex: query, $options: 'i' } },
            { email: { $regex: query, $options: 'i' } }
        ]
    }).limit(20);
};

contactSchema.statics.getContactStats = async function(userId) {
    const stats = await this.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(userId) } },
        {
            $group: {
                _id: null,
                total: { $sum: 1 },
                favorites: { $sum: { $cond: ['$isFavorite', 1, 0] } },
                blocked: { $sum: { $cond: ['$isBlocked', 1, 0] } }
            }
        }
    ]);
    return stats[0] || { total: 0, favorites: 0, blocked: 0 };
};

export default mongoose.models.Contact || mongoose.model('Contact', contactSchema);
