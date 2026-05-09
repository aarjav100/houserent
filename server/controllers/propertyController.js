const Property = require('../models/Property');
const User = require('../models/User');
const imagekit = require('../config/imagekit');

// Helper to upload to ImageKit
const uploadToImageKit = async (file) => {
    try {
        const response = await imagekit.upload({
            file: file.buffer,
            fileName: `${Date.now()}-${file.originalname}`,
            folder: '/properties'
        });
        console.log('ImageKit Upload Success:', response.url);
        return response.url;
    } catch (error) {
        console.error('ImageKit Upload Helper Error:', error);
        throw new Error('ImageKit upload failed');
    }
};

// @desc    Get all properties with filtering
// @route   GET /api/properties
// @access  Public
exports.getProperties = async (req, res) => {
    try {
        const { city, type, minPrice, maxPrice, bedrooms, bathrooms, status, lat, lng, radius } = req.query;
        let query = {};

        // Geospatial Proximity Search
        if (lat && lng) {
            const latitude = Number(lat);
            const longitude = Number(lng);
            const maxDistance = (Number(radius) || 5) * 1000; // Default 5km in meters

            // Use aggregation for $geoNear to get distance
            const pipeline = [
                {
                    $geoNear: {
                        near: { type: "Point", coordinates: [longitude, latitude] },
                        distanceField: "distanceFromWorkplace",
                        maxDistance: maxDistance,
                        spherical: true,
                        key: "location"
                    }
                }
            ];

            // Add other filters to the pipeline
            let match = {};
            if (city) match['address.city'] = { $regex: city, $options: 'i' };
            if (type) match.type = type;
            if (status) match.status = status;
            if (bedrooms && !isNaN(Number(bedrooms))) match.bedrooms = { $gte: Number(bedrooms) };
            if (bathrooms && !isNaN(Number(bathrooms))) match.bathrooms = { $gte: Number(bathrooms) };
            if (minPrice || maxPrice) {
                match.price = {};
                if (minPrice && !isNaN(Number(minPrice))) match.price.$gte = Number(minPrice);
                if (maxPrice && !isNaN(Number(maxPrice))) match.price.$lte = Number(maxPrice);
                if (Object.keys(match.price).length === 0) delete match.price;
            }

            if (Object.keys(match).length > 0) {
                pipeline.push({ $match: match });
            }

            const properties = await Property.aggregate(pipeline);
            return res.json(properties);
        }

        // Standard Search
        if (city) query['address.city'] = { $regex: city, $options: 'i' };
        if (type) query.type = type;
        if (status) query.status = status;
        if (bedrooms && !isNaN(Number(bedrooms))) query.bedrooms = { $gte: Number(bedrooms) };
        if (bathrooms && !isNaN(Number(bathrooms))) query.bathrooms = { $gte: Number(bathrooms) };

        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice && !isNaN(Number(minPrice))) query.price.$gte = Number(minPrice);
            if (maxPrice && !isNaN(Number(maxPrice))) query.price.$lte = Number(maxPrice);
            if (Object.keys(query.price).length === 0) delete query.price;
        }

        const properties = await Property.find(query).populate('owner', 'name email');
        res.json(properties);
    } catch (error) {
        console.error('Error in getProperties:', error);
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
            // Update views without triggering full validation (safer for old data)
            await Property.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });
            res.json(property);
        } else {
            res.status(404).json({ message: 'Property not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create new property
// @route   POST /api/properties
// @access  Private (Owner/Agent/Admin)
exports.createProperty = async (req, res) => {
    try {
        console.log('--- START PROPERTY CREATION ---');
        console.log('Body:', req.body);
        console.log('Files received:', req.files ? req.files.length : 0);

        let imageUrls = [];

        // MANDATORY STEP: Upload images to ImageKit (using memory buffer)
        if (req.files && req.files.length > 0) {
            const uploadPromises = req.files.map(async (file) => {
                console.log(`Uploading to ImageKit: ${file.originalname}`);
                const response = await imagekit.upload({
                    file: file.buffer, // Use buffer from memory storage
                    fileName: Date.now() + "-" + file.originalname,
                    folder: "/properties"
                });
                console.log("ImageKit Success URL:", response.url);
                return response.url;
            });
            imageUrls = await Promise.all(uploadPromises);
        }

        if (imageUrls.length === 0) {
            console.warn('--- REJECTED: No images uploaded or ImageKit failed ---');
            return res.status(400).json({ message: 'Please provide at least one image' });
        }

        // Parse fields from FormData
        const parseNum = (val) => (val === undefined || val === null || val === '' || val === 'null') ? undefined : Number(val);

        let address = req.body.address;
        if (typeof address === 'string') {
            try { address = JSON.parse(address); } catch (e) { address = {}; }
        }

        let pgDetails = req.body.pgDetails;
        if (typeof pgDetails === 'string') {
            try { pgDetails = JSON.parse(pgDetails); } catch (e) { pgDetails = {}; }
        }

        let amenities = req.body.amenities;
        if (typeof amenities === 'string') {
            try { amenities = JSON.parse(amenities); } catch (e) { amenities = amenities ? [amenities] : []; }
        }

        const lat = parseNum(req.body.latitude);
        const lng = parseNum(req.body.longitude);

        const propertyData = {
            ...req.body,
            price: parseNum(req.body.price),
            area: parseNum(req.body.area),
            bedrooms: parseNum(req.body.bedrooms),
            bathrooms: parseNum(req.body.bathrooms),
            latitude: lat,
            longitude: lng,
            location: {
                type: 'Point',
                coordinates: [lng, lat]
            },
            parking: parseNum(req.body.parking),
            address,
            pgDetails,
            messDetails: typeof req.body.messDetails === 'string' ? JSON.parse(req.body.messDetails) : req.body.messDetails,
            restaurantDetails: typeof req.body.restaurantDetails === 'string' ? JSON.parse(req.body.restaurantDetails) : req.body.restaurantDetails,
            amenities: Array.isArray(amenities) ? amenities : [],
            images: imageUrls,
            premiumGallery: req.body.premiumGallery === 'true' || req.body.premiumGallery === true,
            owner: req.user._id
        };

        const property = new Property(propertyData);
        const createdProperty = await property.save();

        // Increment listing count on the User model
        const user = await User.findById(req.user._id);
        if (user) {
            user.listingCount = (user.listingCount || 0) + 1;
            await user.save();
        }

        console.log('--- SUCCESS: Property created with ID:', createdProperty._id);
        res.status(201).json(createdProperty);
    } catch (error) {
        console.error('--- ERROR IN CREATE PROPERTY ---');
        console.error('Error Name:', error.name);
        console.error('Error Message:', error.message);
        
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ message: messages.join(', ') });
        }

        res.status(500).json({ message: 'Internal Server Error: ' + error.message });
    }
};

// @desc    Update a property
// @route   PUT /api/properties/:id
// @access  Private (Owner/Admin)
exports.updateProperty = async (req, res) => {
    try {
        console.log('--- START PROPERTY UPDATE ---');
        let property = await Property.findById(req.params.id);

        if (!property) {
            return res.status(404).json({ message: 'Property not found' });
        }

        // Check if user is owner or admin
        if (property.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(401).json({ message: 'User not authorized to update this property' });
        }

        let imageUrls = property.images || [];

        // If new images are uploaded, add them to ImageKit
        if (req.files && req.files.length > 0) {
            const uploadPromises = req.files.map(async (file) => {
                console.log(`Uploading to ImageKit: ${file.originalname}`);
                const response = await imagekit.upload({
                    file: file.buffer,
                    fileName: Date.now() + "-" + file.originalname,
                    folder: "/properties"
                });
                return response.url;
            });
            const newUrls = await Promise.all(uploadPromises);
            // Replace existing images with new ones (or you could append if preferred)
            imageUrls = newUrls;
        }

        // Parse fields from FormData
        const parseNum = (val) => (val === undefined || val === null || val === '' || val === 'null') ? undefined : Number(val);

        let address = req.body.address || property.address;
        if (typeof address === 'string') {
            try { address = JSON.parse(address); } catch (e) { address = property.address; }
        }

        let pgDetails = req.body.pgDetails || property.pgDetails;
        if (typeof pgDetails === 'string') {
            try { pgDetails = JSON.parse(pgDetails); } catch (e) { pgDetails = property.pgDetails; }
        }

        let amenities = req.body.amenities || property.amenities;
        if (typeof amenities === 'string') {
            try { amenities = JSON.parse(amenities); } catch (e) { amenities = property.amenities; }
        }

        // Update fields
        Object.assign(property, req.body);
        
        // Ensure numbers are correctly updated
        if (req.body.price) property.price = parseNum(req.body.price);
        if (req.body.area) property.area = parseNum(req.body.area);
        if (req.body.bedrooms) property.bedrooms = parseNum(req.body.bedrooms);
        if (req.body.bathrooms) property.bathrooms = parseNum(req.body.bathrooms);
        if (req.body.latitude) property.latitude = parseNum(req.body.latitude);
        if (req.body.longitude) property.longitude = parseNum(req.body.longitude);
        if (req.body.parking) property.parking = parseNum(req.body.parking);

        property.address = address;
        property.pgDetails = pgDetails;
        property.amenities = Array.isArray(amenities) ? amenities : [];
        property.images = imageUrls;
        if (req.body.premiumGallery !== undefined) {
            property.premiumGallery = req.body.premiumGallery === 'true' || req.body.premiumGallery === true;
        }

        const updatedProperty = await property.save();
        res.json(updatedProperty);
    } catch (error) {
        console.error('Update Property Error:', error);
        res.status(500).json({ 
            message: error.name === 'ValidationError' ? Object.values(error.errors).map(e => e.message).join(', ') : error.message 
        });
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
