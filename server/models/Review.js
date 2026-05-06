const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    property: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Property',
        required: true
    },
    rating: {
        type: Number,
        required: [true, 'Please add a rating between 1 and 5'],
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        required: [true, 'Please add a comment'],
        trim: true
    }
}, { timestamps: true });

// Prevent user from submitting more than one review per property
reviewSchema.index({ property: 1, user: 1 }, { unique: true });

// Static method to get avg rating and save
reviewSchema.statics.getAverageRating = async function(propertyId) {
    const obj = await this.aggregate([
        {
            $match: { property: propertyId }
        },
        {
            $group: {
                _id: '$property',
                averageRating: { $avg: '$rating' },
                count: { $sum: 1 }
            }
        }
    ]);

    try {
        await this.model('Property').findByIdAndUpdate(propertyId, {
            'rating.average': obj[0] ? Math.round(obj[0].averageRating * 10) / 10 : 0,
            'rating.count': obj[0] ? obj[0].count : 0
        });
    } catch (err) {
        console.error(err);
    }
};

// Call getAverageRating after save
reviewSchema.post('save', function() {
    this.constructor.getAverageRating(this.property);
});

// Call getAverageRating before remove
reviewSchema.pre('remove', function() {
    this.constructor.getAverageRating(this.property);
});

module.exports = mongoose.model('Review', reviewSchema);
