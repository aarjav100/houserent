const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { protect } = require('../middleware/auth');
const User = require('../models/User');

// Initialize Razorpay only if keys are present
let razorpay;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_ID !== 'your_razorpay_key_id') {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
} else {
  console.warn('⚠️ Razorpay credentials are missing or using placeholders. Payment features will be disabled.');
}

// @desc    Create a Razorpay order (or Mock Order)
router.post('/create-order', protect, async (req, res) => {
  const { amount } = req.body; // Amount in paise

  if (!razorpay) {
    console.log('--- MOCK PAYMENT MODE ACTIVE ---');
    return res.json({
      id: `mock_order_${Date.now()}`,
      amount: amount || 1000,
      currency: 'INR',
      status: 'created',
      mock: true
    });
  }

  try {
    const options = {
      amount: amount || 1000, 
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating Razorpay order' });
  }
});

// @desc    Verify Razorpay payment
router.post('/verify', protect, async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  if (!razorpay || razorpay_order_id?.startsWith('mock_')) {
    console.log('--- MOCK VERIFICATION SUCCESS ---');
    return res.json({ message: "Mock payment verified successfully", success: true });
  }

  const sign = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSign = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(sign.toString())
    .digest("hex");

  if (razorpay_signature === expectedSign) {
    res.json({ message: "Payment verified successfully", success: true });
  } else {
    res.status(400).json({ message: "Invalid signature", success: false });
  }
});

module.exports = router;
