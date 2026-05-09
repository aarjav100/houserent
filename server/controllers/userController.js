const User = require('../models/User');

// @desc    Update user profile (including workplace)
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;
            user.phone = req.body.phone || user.phone;
            user.bio = req.body.bio || user.bio;
            user.avatar = req.body.avatar || user.avatar;
            user.preferredRadius = req.body.preferredRadius || user.preferredRadius;

            if (req.body.workplaceLocation) {
                const { lat, lng, address, name } = req.body.workplaceLocation;
                user.workplaceLocation = {
                    type: 'Point',
                    coordinates: [Number(lng), Number(lat)],
                    address: address || '',
                    name: name || ''
                };
            }

            if (req.body.password) {
                user.password = req.body.password;
            }

            const updatedUser = await user.save();
            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                workplaceLocation: updatedUser.workplaceLocation,
                preferredRadius: updatedUser.preferredRadius
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
