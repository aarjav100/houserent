const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a title'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Please add a description']
    },
    type: {
        type: String,
        enum: ['apartment', 'house', 'villa', 'condo', 'studio', 'penthouse', 'townhouse', 'pg', 'hotel', 'hostel'],
        required: [true, 'Please select a property type']
    },
    status: {
        type: String,
        enum: ['for-rent', 'for-sale', 'rented', 'sold'],
        default: 'for-rent'
    },
    price: {
        type: Number,
        required: [true, 'Please add a price']
    },
    latitude: {
        type: Number,
        required: [true, 'Please pin your location on the map'],
        min: [8.0, 'Latitude must be within India (min 8.0)'],
        max: [38.0, 'Latitude must be within India (max 38.0)']
    },
    longitude: {
        type: Number,
        required: [true, 'Please pin your location on the map'],
        min: [68.0, 'Longitude must be within India (min 68.0)'],
        max: [98.0, 'Longitude must be within India (max 98.0)']
    },
    priceType: {
        type: String,
        enum: ['month', 'year', 'total'],
        default: 'month'
    },
    area: {
        type: Number,
        required: [true, 'Please add area in sqft']
    },
    bedrooms: {
        type: Number,
        required: true,
        default: 1
    },
    bathrooms: {
        type: Number,
        required: true,
        default: 1
    },
    parking: {
        type: Number,
        default: 0
    },
    furnished: {
        type: String,
        enum: ['furnished', 'semi-furnished', 'unfurnished'],
        default: 'unfurnished'
    },
    address: {
        street: { type: String, default: '' },
        city: { type: String, required: [true, 'Please add a city'] },
        state: { type: String, required: [true, 'Please add a state'] },
        zipCode: { type: String, default: '' },
        country: { type: String, default: 'India' }
    },
    amenities: [{
        type: String
    }],
    images: {
        type: [String],
        required: [true, 'Please add at least one image URL'],
        validate: [v => Array.isArray(v) && v.length > 0, 'Property must have at least one image']
    },
    virtualTour: {
        type: String,
        default: ''
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    featured: {
        type: Boolean,
        default: false
    },
    views: {
        type: Number,
        default: 0
    },
    // Agent / Owner Contact Info
    agentName: { type: String, default: '' },
    agencyName: { type: String, default: '' },
    // Phone is stored but only revealed after unlock
    phone: { type: String, default: '' },
    whatsapp: { type: String, default: '' },
    verified: { type: Boolean, default: false },
    // Free contact views allowed before requiring unlock
    freeViewsAllowed: { type: Number, default: 1 },
    videoUrl: {
        type: String,
        default: ''
    },
    pgDetails: {
        genderAllowed: { type: String, enum: ['boys', 'girls', 'co-ed', 'none'], default: 'none' },
        sharingType: { type: String, enum: ['single', 'double', 'triple', 'four-plus', 'none'], default: 'none' },
        foodIncluded: { type: Boolean, default: false },
        foodType: { type: String, enum: ['veg', 'non-veg', 'both', 'none'], default: 'none' },
        curfewTime: { type: String, default: '' }
    },
    rating: {
        average: { type: Number, default: 0 },
        count: { type: Number, default: 0 }
    },
}, { timestamps: true });

propertySchema.index({ 'address.city': 1, price: 1, type: 1 });
propertySchema.index({ status: 1 });

module.exports = mongoose.model('Property', propertySchema);
