const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { protect } = require('../middleware/auth');

router.post('/', protect, (req, res) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      console.error('Multer/Cloudinary Error:', err);
      return res.status(500).json({ 
        message: 'Upload failed', 
        error: err.message || 'Unknown error' 
      });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    // If it's a Cloudinary URL, it will start with 'http'
    // If it's local, we ensure it has a leading slash
    const finalPath = req.file.path.startsWith('http') 
      ? req.file.path 
      : `/${req.file.path.replace(/\\/g, '/')}`;

    res.send(finalPath);
  });
});

module.exports = router;
