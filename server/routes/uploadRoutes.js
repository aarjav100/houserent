const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { protect } = require('../middleware/auth');
const imagekit = require('../config/imagekit');

// @route   GET /api/upload/auth
// @desc    Get ImageKit authentication parameters
// @access  Private
router.get('/auth', protect, (req, res) => {
  try {
    const result = imagekit.getAuthenticationParameters();
    res.send(result);
  } catch (error) {
    console.error('ImageKit Auth Error:', error);
    res.status(500).json({ message: 'Authentication failed' });
  }
});

// @route   POST /api/upload
// @desc    Upload an image to ImageKit
// @access  Private
router.post('/', protect, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Upload to ImageKit using SDK
    const uploadResponse = await imagekit.upload({
      file: req.file.buffer,
      fileName: `${Date.now()}-${req.file.originalname}`,
      folder: '/uploads'
    });

    console.log('ImageKit Upload Success:', uploadResponse.url);
    
    // Return the full ImageKit URL
    res.json(uploadResponse.url);
  } catch (error) {
    console.error('ImageKit Upload Error:', error);
    res.status(500).json({ 
      message: 'Upload failed', 
      error: error.message || 'Unknown error' 
    });
  }
});

module.exports = router;
