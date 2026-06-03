import express from 'express';
import Property from '../models/Property.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/role.js';

const router = express.Router();

// @desc    Get all properties (public, with filters)
// @route   GET /api/properties
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { search, city, type, minPrice, maxPrice, amenities, bedrooms, bathrooms } = req.query;

    let query = { isApproved: true };

    // Search query matches title, description, or location
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
      ];
    }

    // Specific city/location filter
    if (city) {
      query.location = { $regex: city, $options: 'i' };
    }

    // Property type filter
    if (type && type !== 'all') {
      query.type = type;
    }

    // Price range filters
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Bedrooms filter
    if (bedrooms && bedrooms !== 'any') {
      query.bedrooms = Number(bedrooms);
    }

    // Bathrooms filter
    if (bathrooms && bathrooms !== 'any') {
      query.bathrooms = Number(bathrooms);
    }

    // Amenities filter (all selected must be present)
    if (amenities) {
      const amenitiesList = Array.isArray(amenities)
        ? amenities
        : amenities.split(',');
      if (amenitiesList.length > 0) {
        query.amenities = { $all: amenitiesList };
      }
    }

    const properties = await Property.find(query)
      .populate('owner', 'name email phone')
      .sort({ createdAt: -1 });

    res.json(properties);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get landlord properties
// @route   GET /api/properties/my-listings
// @access  Private (Landlord/Admin)
router.get(
  '/my-listings',
  protect,
  authorize('landlord', 'admin'),
  async (req, res) => {
    try {
      const properties = await Property.find({ owner: req.user._id }).sort({
        createdAt: -1,
      });
      res.json(properties);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// @desc    Get single property details
// @route   GET /api/properties/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const property = await Property.findById(req.params.id).populate(
      'owner',
      'name email phone'
    );

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    res.json(property);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Create a property listing
// @route   POST /api/properties
// @access  Private (Landlord/Admin)
router.post(
  '/',
  protect,
  authorize('landlord', 'admin'),
  async (req, res) => {
    try {
      const {
        title,
        description,
        price,
        location,
        type,
        amenities,
        bedrooms,
        bathrooms,
        size,
        images,
      } = req.body;

      const property = new Property({
        title,
        description,
        price: Number(price),
        location,
        type,
        amenities: amenities || [],
        bedrooms: Number(bedrooms),
        bathrooms: Number(bathrooms),
        size: Number(size),
        images: images || [],
        owner: req.user._id,
      });

      const createdProperty = await property.save();
      res.status(201).json(createdProperty);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
);

// @desc    Update a property listing
// @route   PUT /api/properties/:id
// @access  Private (Landlord/Admin)
router.put(
  '/:id',
  protect,
  authorize('landlord', 'admin'),
  async (req, res) => {
    try {
      const {
        title,
        description,
        price,
        location,
        type,
        amenities,
        bedrooms,
        bathrooms,
        size,
        images,
        availability,
      } = req.body;

      const property = await Property.findById(req.params.id);

      if (!property) {
        return res.status(404).json({ message: 'Property not found' });
      }

      // Check if user is the property owner or an admin
      if (property.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res
          .status(403)
          .json({ message: 'Not authorized to edit this property listing' });
      }

      property.title = title || property.title;
      property.description = description || property.description;
      property.price = price !== undefined ? Number(price) : property.price;
      property.location = location || property.location;
      property.type = type || property.type;
      property.amenities = amenities || property.amenities;
      property.bedrooms = bedrooms !== undefined ? Number(bedrooms) : property.bedrooms;
      property.bathrooms = bathrooms !== undefined ? Number(bathrooms) : property.bathrooms;
      property.size = size !== undefined ? Number(size) : property.size;
      property.images = images || property.images;
      property.availability =
        availability !== undefined ? availability : property.availability;

      const updatedProperty = await property.save();
      res.json(updatedProperty);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
);

// @desc    Delete a property listing
// @route   DELETE /api/properties/:id
// @access  Private (Landlord/Admin)
router.delete(
  '/:id',
  protect,
  authorize('landlord', 'admin'),
  async (req, res) => {
    try {
      const property = await Property.findById(req.params.id);

      if (!property) {
        return res.status(404).json({ message: 'Property not found' });
      }

      // Check if user is the property owner or an admin
      if (property.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res
          .status(403)
          .json({ message: 'Not authorized to delete this property listing' });
      }

      await property.deleteOne();
      res.json({ message: 'Property listing removed' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

export default router;
