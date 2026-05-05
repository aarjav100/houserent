const mongoose = require('mongoose');

/**
 * CallbackRequest — user requests a phone callback from the agent.
 * status: pending → contacted → closed
 */
const callbackRequestSchema = new mongoose.Schema({
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
    name: {
        type: String,
        required: [true, 'Please provide your name'],
        trim: true
    },
    phone: {
        type: String,
        required: [true, 'Please provide your phone number']
    },
    preferredTime: {
        type: String,
        default: 'anytime'   // e.g. "Morning 9-12", "Evening 5-8"
    },
    message: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: ['pending', 'contacted', 'closed'],
        default: 'pending'
    }
}, { timestamps: true });

// Anti-spam: 1 pending request per user per property at a time
callbackRequestSchema.index(
    { userId: 1, propertyId: 1, status: 1 },
    { unique: false }
);

module.exports = mongoose.model('CallbackRequest', callbackRequestSchema);
