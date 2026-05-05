const Property = require('../models/Property');
const ContactUnlock = require('../models/ContactUnlock');
const CallbackRequest = require('../models/CallbackRequest');

// Pricing plans — switch 'enabled' to true when payment gateway is live
const PLANS = {
    single:  { price: 9,  label: '1 Contact',        contacts: 1  },
    pack10:  { price: 49, label: '10 Contacts',       contacts: 10 },
    monthly: { price: 99, label: 'Monthly Unlimited', contacts: -1 }
};

// ─────────────────────────────────────────────────
// @desc    Get contact info for a property
// @route   GET /api/contact/:propertyId
// @access  Private
// ─────────────────────────────────────────────────
exports.getContact = async (req, res) => {
    try {
        const property = await Property.findById(req.params.propertyId)
            .select('title agentName agencyName phone whatsapp verified owner');

        if (!property) {
            return res.status(404).json({ message: 'Property not found' });
        }

        // Check if user has already unlocked this property
        const unlock = await ContactUnlock.findOne({
            userId: req.user._id,
            propertyId: req.params.propertyId
        });

        // Owner can always see their own property contact
        const isOwner = property.owner.toString() === req.user._id.toString();

        if (unlock || isOwner) {
            // Full contact revealed
            return res.json({
                unlocked: true,
                agentName: property.agentName,
                agencyName: property.agencyName,
                phone: property.phone,
                whatsapp: property.whatsapp,
                verified: property.verified
            });
        }

        // Masked: show only first 2 and last 3 digits
        const maskedPhone = property.phone
            ? property.phone.slice(0, 2) + 'XXXXXX' + property.phone.slice(-2)
            : '98XXXXXX10';

        return res.json({
            unlocked: false,
            agentName: property.agentName,
            agencyName: property.agencyName,
            maskedPhone,
            verified: property.verified,
            plans: PLANS
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ─────────────────────────────────────────────────
// @desc    Unlock contact for a property
// @route   POST /api/contact/unlock
// @access  Private
// Payment gateway integration point:
//   Before creating unlock, verify paymentId with Razorpay/Stripe webhook
// ─────────────────────────────────────────────────
exports.unlockContact = async (req, res) => {
    try {
        const { propertyId, plan = 'free', paymentId = null, amountPaid = 0 } = req.body;

        if (!propertyId) {
            return res.status(400).json({ message: 'Property ID is required' });
        }

        const property = await Property.findById(propertyId);
        if (!property) {
            return res.status(404).json({ message: 'Property not found' });
        }

        // Prevent duplicate unlock
        const existing = await ContactUnlock.findOne({
            userId: req.user._id,
            propertyId
        });

        if (existing) {
            return res.json({
                success: true,
                message: 'Already unlocked',
                phone: property.phone,
                whatsapp: property.whatsapp
            });
        }

        // TODO: For paid plans, verify payment here with Razorpay/Stripe before proceeding

        const unlock = await ContactUnlock.create({
            userId: req.user._id,
            propertyId,
            paymentId,
            unlockType: paymentId ? 'paid' : 'free',
            plan,
            amountPaid
        });

        res.status(201).json({
            success: true,
            message: 'Contact unlocked successfully!',
            phone: property.phone,
            whatsapp: property.whatsapp,
            agentName: property.agentName,
            unlock
        });

    } catch (error) {
        // Handle duplicate key (race condition)
        if (error.code === 11000) {
            const property = await Property.findById(req.body.propertyId);
            return res.json({
                success: true,
                message: 'Already unlocked',
                phone: property?.phone,
                whatsapp: property?.whatsapp
            });
        }
        res.status(500).json({ message: error.message });
    }
};

// ─────────────────────────────────────────────────
// @desc    Submit a callback request
// @route   POST /api/contact/callback
// @access  Private
// ─────────────────────────────────────────────────
exports.requestCallback = async (req, res) => {
    try {
        const { propertyId, name, phone, preferredTime, message } = req.body;

        if (!propertyId || !name || !phone) {
            return res.status(400).json({ message: 'Property, name, and phone are required' });
        }

        // Anti-spam: limit 3 pending requests per user per property
        const pendingCount = await CallbackRequest.countDocuments({
            userId: req.user._id,
            propertyId,
            status: 'pending'
        });

        if (pendingCount >= 3) {
            return res.status(429).json({
                message: 'You already have pending callback requests for this property. Please wait.'
            });
        }

        const request = await CallbackRequest.create({
            userId: req.user._id,
            propertyId,
            name,
            phone,
            preferredTime: preferredTime || 'anytime',
            message: message || ''
        });

        res.status(201).json({
            success: true,
            message: 'Callback request submitted! The agent will contact you shortly.',
            request
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ─────────────────────────────────────────────────
// @desc    Get all callback requests for agent's properties
// @route   GET /api/contact/callbacks/mine
// @access  Private (Agent/Admin)
// ─────────────────────────────────────────────────
exports.getMyCallbacks = async (req, res) => {
    try {
        // Get all properties owned by this user
        const myProperties = await Property.find({ owner: req.user._id }).select('_id');
        const propertyIds = myProperties.map(p => p._id);

        const callbacks = await CallbackRequest.find({ propertyId: { $in: propertyIds } })
            .populate('propertyId', 'title address')
            .populate('userId', 'name email')
            .sort({ createdAt: -1 });

        res.json(callbacks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
