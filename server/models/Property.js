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
        enum: ['apartment', 'house', 'villa', 'condo', 'studio', 'penthouse', 'townhouse', 'pg', 'flat', 'mess', 'restaurant', 'hotel', 'hostel'],
        required: [true, 'Please select a property type']
    },
    status: {
        type: String,
        enum: ['for-rent', 'for-sale', 'rented', 'sold', 'active', 'closed'],
        default: 'for-rent'
    },
    price: {
        type: Number,
        required: [true, 'Please add a price']
    },
    // Geospatial Location
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
        }
    },
    latitude: {
        type: Number,
    },
    longitude: {
        type: Number,
    },
    priceType: {
        type: String,
        enum: ['month', 'year', 'total', 'meal'],
        default: 'month'
    },
    area: {
        type: Number,
        required: function() { return this.type === 'flat' || this.type === 'apartment'; }
    },
    bedrooms: {
        type: Number,
        default: 0
    },
    bathrooms: {
        type: Number,
        default: 0
    },
    parking: {
        type: Number,
        default: 0
    },
    furnished: {
        type: String,
        enum: ['furnished', 'semi-furnished', 'unfurnished', 'none'],
        default: 'none'
    },
    address: {
        street: { type: String, default: '' },
        city: { type: String, required: [true, 'Please add a city'] },
        state: { type: String, required: [true, 'Please add a state'] },
        zipCode: { type: String, default: '' },
        country: { type: String, default: 'India' },
        fullAddress: { type: String, default: '' }
    },
    amenities: [{
        type: String
    }],
    images: {
        type: [String],
        required: [true, 'Please add at least one image URL'],
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
    premiumGallery: {
        type: Boolean,
        default: false
    },
    views: {
        type: Number,
        default: 0
    },
    // Contact Info
    agentName: { type: String, default: '' },
    phone: { type: String, default: '' },
    whatsapp: { type: String, default: '' },
    verified: { type: Boolean, default: false },
    
    // PG Specific
    pgDetails: {
        genderAllowed: { type: String, enum: ['boys', 'girls', 'co-ed', 'none'], default: 'none' },
        sharingType: { type: String, enum: ['single', 'double', 'triple', 'four-plus', 'none'], default: 'none' },
        foodIncluded: { type: Boolean, default: false },
        foodType: { type: String, enum: ['veg', 'non-veg', 'both', 'none'], default: 'none' }
    },

    // Mess & Tiffin Specific
    messDetails: {
        mealPlans: [{
            name: String, // e.g. "Monthly Full Meal"
            price: Number,
            description: String
        }],
        menuPreview: [String],
        deliveryAvailable: { type: Boolean, default: false },
        pureVeg: { type: Boolean, default: false },
        tiffinService: { type: Boolean, default: false }
    },

    // Restaurant Specific
    restaurantDetails: {
        cuisines: [String],
        averagePriceForTwo: Number,
        openingHours: String,
        deliveryRadius: Number // in km
    },

    rating: {
        average: { type: Number, default: 0 },
        count: { type: Number, default: 0 }
    },
}, { timestamps: true });

propertySchema.index({ location: '2dsphere' });
propertySchema.index({ 'address.city': 1, price: 1, type: 1 });
propertySchema.index({ status: 1 });

module.exports = mongoose.model('Property', propertySchema);
