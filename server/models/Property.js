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
        required: [true, 'Please add latitude']
    },
    longitude: {
        type: Number,
        required: [true, 'Please add longitude']
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
    images: [{
        type: String
    }],
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
}, { timestamps: true });

propertySchema.index({ 'address.city': 1, price: 1, type: 1 });
propertySchema.index({ status: 1 });

module.exports = mongoose.model('Property', propertySchema);
