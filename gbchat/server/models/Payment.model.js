// models/Payment.model.js
const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    type: {
        type: String,
        enum: ['p2p', 'business', 'request', 'invoice'],
        required: true
    },
    amount: {
        type: Number,
        required: [true, 'Amount is required'],
        min: 0
    },
    currency: {
        type: String,
        default: 'USD',
        enum: ['USD', 'EUR', 'GBP', 'INR']
    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'failed', 'refunded'],
        default: 'pending',
        index: true
    },
    paymentMethod: {
        type: String,
        enum: ['upi', 'card', 'wallet', 'bank_transfer'],
        required: true
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    transactionId: {
        type: String,
        unique: true,
        sparse: true
    },
    gatewayTransactionId: {
        type: String
    },
    paymentGateway: {
        type: String,
        enum: ['stripe', 'razorpay', 'paypal']
    },
    invoice: {
        invoiceId: String,
        invoiceNumber: String,
        items: [{
            description: String,
            quantity: Number,
            unitPrice: Number,
            total: Number
        }],
        subtotal: Number,
        tax: Number,
        discount: Number
    },
    metadata: {
        note: String,
        purpose: String,
        category: String
    },
    failureReason: String,
    refundedAmount: {
        type: Number,
        default: 0
    },
    fee: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Indexes
paymentSchema.index({ userId: 1, createdAt: -1 });
paymentSchema.index({ sender: 1, recipient: 1 });
paymentSchema.index({ status: 1, createdAt: -1 });
paymentSchema.index({ transactionId: 1 });

// Virtual for net amount
paymentSchema.virtual('netAmount').get(function() {
    return this.amount - this.fee;
});

// Static methods
paymentSchema.statics.getUserAnalytics = async function(userId) {
    const stats = await this.aggregate([
        { $match: { $or: [{ sender: userId }, { recipient: userId }] } },
        {
            $group: {
                _id: '$status',
                totalAmount: { $sum: '$amount' },
                count: { $sum: 1 }
            }
        }
    ]);
    
    const result = { totalSent: 0, totalReceived: 0, transactions: 0 };
    stats.forEach(stat => {
        result.transactions += stat.count;
        result.totalAmount = stat.totalAmount;
    });
    
    return result;
};

module.exports = mongoose.models.Payment || mongoose.model('Payment', paymentSchema);
