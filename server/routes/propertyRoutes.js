const express = require('express');
const router = express.Router();
const {
    getProperties,
    getPropertyById,
    createProperty,
    updateProperty,
    deleteProperty
} = require('../controllers/propertyController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
    .get(getProperties)
    .post(protect, authorize('owner'), createProperty);

router.route('/:id')
    .get(getPropertyById)
    .put(protect, authorize('owner'), updateProperty)
    .delete(protect, authorize('owner'), deleteProperty);

module.exports = router;
