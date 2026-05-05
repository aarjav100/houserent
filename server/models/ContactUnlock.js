const mongoose = require('mongoose');

/**
 * ContactUnlock — tracks which users have unlocked contact for a property.
 * unlockType: 'free' = logged-in free view, 'paid' = real payment
 * paymentId: populated after Razorpay/Stripe integration
 */
const contactUnlockSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    propertyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Property',
        required: true
    },
    paymentId: {
        type: String,
        default: null   // null for free unlocks
    },
    unlockType: {
        type: String,
        enum: ['free', 'paid', 'subscription'],
        default: 'free'
    },
    plan: {
        type: String,
        enum: ['single', 'pack10', 'monthly', 'free'],
        default: 'free'
    },
    amountPaid: {
        type: Number,
        default: 0
    },
    unlockedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// Compound index prevents duplicate unlock records
contactUnlockSchema.index({ userId: 1, propertyId: 1 }, { unique: true });

module.exports = mongoose.model('ContactUnlock', contactUnlockSchema);
