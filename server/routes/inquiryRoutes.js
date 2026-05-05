const express = require('express');
const router = express.Router();
const {
    createInquiry,
    getInquiries,
    updateInquiryStatus
} = require('../controllers/inquiryController');
const { protect } = require('../middleware/auth');

router.route('/')
    .post(protect, createInquiry)
    .get(protect, getInquiries);

router.route('/:id')
    .put(protect, updateInquiryStatus);

module.exports = router;
