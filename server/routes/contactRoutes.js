const express = require('express');
const router = express.Router();
const {
    getContact,
    unlockContact,
    requestCallback,
    getMyCallbacks
} = require('../controllers/contactController');
const { protect } = require('../middleware/auth');

// All contact routes require authentication
router.get('/:propertyId', protect, getContact);
router.post('/unlock', protect, unlockContact);
router.post('/callback', protect, requestCallback);
router.get('/callbacks/mine', protect, getMyCallbacks);

module.exports = router;
