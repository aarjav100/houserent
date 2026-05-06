const express = require('express');
const router = express.Router();
const { Conversation, Message } = require('../models/Chat');
const { protect } = require('../middleware/auth');

// @desc    Get user conversations
// @route   GET /api/chat/conversations
router.get('/conversations', protect, async (req, res) => {
    try {
        const conversations = await Conversation.find({
            participants: { $in: [req.user._id] }
        }).populate('participants', 'name avatar').populate('property', 'title images');
        res.json(conversations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get messages for a conversation
// @route   GET /api/chat/messages/:conversationId
router.get('/messages/:conversationId', protect, async (req, res) => {
    try {
        const messages = await Message.find({ conversation: req.params.conversationId }).sort('createdAt');
        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Send a message
// @route   POST /api/chat/messages
router.post('/messages', protect, async (req, res) => {
    try {
        const { conversationId, text, recipientId, propertyId } = req.body;
        
        let convId = conversationId;
        
        // If no conversationId, check if one exists or create it
        if (!convId) {
            let conv = await Conversation.findOne({
                participants: { $all: [req.user._id, recipientId] },
                property: propertyId
            });
            
            if (!conv) {
                conv = await Conversation.create({
                    participants: [req.user._id, recipientId],
                    property: propertyId
                });
            }
            convId = conv._id;
        }

        const message = await Message.create({
            conversation: convId,
            sender: req.user._id,
            text
        });

        await Conversation.findByIdAndUpdate(convId, { lastMessage: message._id });

        res.status(201).json(message);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
