const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const { protect } = require('../middleware/auth');

// @desc    Get all reviews for a property
// @route   GET /api/reviews/property/:propertyId
router.get('/property/:propertyId', async (req, res) => {
    try {
        const reviews = await Review.find({ property: req.params.propertyId }).populate('user', 'name avatar');
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Add a review
// @route   POST /api/reviews
router.post('/', protect, async (req, res) => {
    try {
        const { property, rating, comment } = req.body;
        const review = await Review.create({
            user: req.user._id,
            property,
            rating,
            comment
        });
        res.status(201).json(review);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
