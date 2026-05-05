const Property = require('../models/Property');

// @desc    Get all properties with filtering
// @route   GET /api/properties
// @access  Public
exports.getProperties = async (req, res) => {
    try {
        const { city, type, minPrice, maxPrice, bedrooms, bathrooms, status } = req.query;
        let query = {};

        if (city) query['address.city'] = { $regex: city, $options: 'i' };
        if (type) query.type = type;
        if (status) query.status = status;
        if (bedrooms) query.bedrooms = { $gte: Number(bedrooms) };
        if (bathrooms) query.bathrooms = { $gte: Number(bathrooms) };

        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }

        const properties = await Property.find(query).populate('owner', 'name email');
        res.json(properties);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single property
// @route   GET /api/properties/:id
// @access  Public
exports.getPropertyById = async (req, res) => {
    try {
        const property = await Property.findById(req.params.id).populate('owner', 'name email bio avatar');
        
        if (property) {
            // Update views
            property.views += 1;
            await property.save();
            res.json(property);
        } else {
            res.status(404).json({ message: 'Property not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a property
// @route   POST /api/properties
// @access  Private (Agent/Admin)
exports.createProperty = async (req, res) => {
    try {
        const User = require('../models/User');
        const user = await User.findById(req.user._id);

        const {
            title, description, type, status, price, priceType, area,
            bedrooms, bathrooms, parking, furnished, address, 
            latitude, longitude, amenities, images, virtualTour
        } = req.body;

        const property = new Property({
            title,
            description,
            type,
            status,
            price,
            priceType,
            area,
            bedrooms,
            bathrooms,
            parking,
            furnished,
            address,
            latitude,
            longitude,
            amenities,
            images,
            virtualTour,
            owner: req.user._id
        });

        const createdProperty = await property.save();

        // Increment listing count
        user.listingCount += 1;
        await user.save();

        res.status(201).json(createdProperty);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a property
// @route   PUT /api/properties/:id
// @access  Private (Owner/Admin)
exports.updateProperty = async (req, res) => {
    try {
        const property = await Property.findById(req.params.id);

        if (property) {
            if (property.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
                return res.status(401).json({ message: 'Not authorized to update this property' });
            }

            property.title = req.body.title || property.title;
            property.description = req.body.description || property.description;
            property.type = req.body.type || property.type;
            property.status = req.body.status || property.status;
            property.price = req.body.price || property.price;
            property.priceType = req.body.priceType || property.priceType;
            property.area = req.body.area || property.area;
            property.bedrooms = req.body.bedrooms || property.bedrooms;
            property.bathrooms = req.body.bathrooms || property.bathrooms;
            property.parking = req.body.parking || property.parking;
            property.furnished = req.body.furnished || property.furnished;
            property.address = req.body.address || property.address;
            property.latitude = req.body.latitude || property.latitude;
            property.longitude = req.body.longitude || property.longitude;
            property.amenities = req.body.amenities || property.amenities;
            property.images = req.body.images || property.images;
            property.virtualTour = req.body.virtualTour || property.virtualTour;

            const updatedProperty = await property.save();
            res.json(updatedProperty);
        } else {
            res.status(404).json({ message: 'Property not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a property
// @route   DELETE /api/properties/:id
// @access  Private (Owner/Admin)
exports.deleteProperty = async (req, res) => {
    try {
        const property = await Property.findById(req.params.id);

        if (property) {
            if (property.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
                return res.status(401).json({ message: 'Not authorized to delete this property' });
            }

            await property.deleteOne();
            res.json({ message: 'Property removed' });
        } else {
            res.status(404).json({ message: 'Property not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
