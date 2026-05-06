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
const upload = require('../middleware/upload');

router.route('/')
    .get(getProperties)
    .post(protect, authorize('owner', 'agent', 'pg-owner', 'admin'), upload.array('images', 10), createProperty);

router.route('/:id')
    .get(getPropertyById)
    .put(protect, authorize('owner', 'agent', 'pg-owner', 'admin'), upload.array('images', 10), updateProperty)
    .delete(protect, authorize('owner', 'agent', 'pg-owner', 'admin'), deleteProperty);

module.exports = router;
