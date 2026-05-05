const Inquiry = require('../models/Inquiry');
const Property = require('../models/Property');

// @desc    Create an inquiry
// @route   POST /api/inquiries
// @access  Private
exports.createInquiry = async (req, res) => {
    try {
        const { propertyId, message, phone } = req.body;

        const property = await Property.findById(propertyId);

        if (!property) {
            return res.status(404).json({ message: 'Property not found' });
        }

        const inquiry = await Inquiry.create({
            property: propertyId,
            sender: req.user._id,
            receiver: property.owner,
            message,
            phone
        });

        res.status(201).json(inquiry);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all inquiries for a user (either as sender or receiver)
// @route   GET /api/inquiries
// @access  Private
exports.getInquiries = async (req, res) => {
    try {
        const inquiries = await Inquiry.find({
            $or: [
                { sender: req.user._id },
                { receiver: req.user._id }
            ]
        }).populate('property', 'title price images')
          .populate('sender', 'name email phone')
          .populate('receiver', 'name email phone');

        res.json(inquiries);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update inquiry status
// @route   PUT /api/inquiries/:id
// @access  Private
exports.updateInquiryStatus = async (req, res) => {
    try {
        const inquiry = await Inquiry.findById(req.params.id);

        if (inquiry) {
            if (inquiry.receiver.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
                return res.status(401).json({ message: 'Not authorized to update this inquiry' });
            }

            inquiry.status = req.body.status || inquiry.status;

            const updatedInquiry = await inquiry.save();
            res.json(updatedInquiry);
        } else {
            res.status(404).json({ message: 'Inquiry not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
