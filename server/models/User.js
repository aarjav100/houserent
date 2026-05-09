const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please add a valid email']
    },
    password: {
        type: String,
        required: [true, 'Please add a password'],
        minlength: 6
    },
    phone: {
        type: String,
        required: [true, 'Please add a phone number']
    },
    listingCount: {
        type: Number,
        default: 0
    },
        role: {
            type: String,
            enum: ['user', 'renter', 'owner', 'pg-owner', 'agent', 'admin'],
            default: 'renter'
        },
        avatar: {
            type: String,
            default: ''
        },
        bio: {
            type: String,
            default: ''
        },
        socialLinks: {
            instagram: String,
            whatsapp: String
        },
        preferences: {
            sleepSchedule: { type: String, enum: ['early-bird', 'night-owl', 'flexible'] },
            cleanliness: { type: Number, min: 1, max: 5 },
            smoking: { type: Boolean, default: false },
            pets: { type: Boolean, default: false }
        },
        savedProperties: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Property'
        }],
        workplaceLocation: {
            type: {
                type: String,
                enum: ['Point'],
                default: 'Point'
            },
            coordinates: {
                type: [Number], // [longitude, latitude]
            },
            address: { type: String, default: '' },
            name: { type: String, default: '' }
        },
        preferredRadius: {
            type: Number,
            default: 5 // Default to 5km
        }
    }, { timestamps: true });

userSchema.index({ workplaceLocation: '2dsphere' });

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
