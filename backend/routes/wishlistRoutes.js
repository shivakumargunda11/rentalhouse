import express from 'express';
import User from '../models/User.js';
import Property from '../models/Property.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/role.js';

const router = express.Router();

// @desc    Get tenant's wishlist properties
// @route   GET /api/wishlist
// @access  Private (Tenant)
router.get('/', protect, authorize('tenant'), async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'wishlist',
      match: { isApproved: true }, // Only retrieve approved properties
      populate: {
        path: 'owner',
        select: 'name email phone',
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user.wishlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Add property to wishlist
// @route   POST /api/wishlist/:propertyId
// @access  Private (Tenant)
router.post('/:propertyId', protect, authorize('tenant'), async (req, res) => {
  try {
    const { propertyId } = req.params;

    // Check if property exists
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    const user = await User.findById(req.user._id);

    if (user.wishlist.includes(propertyId)) {
      return res.status(400).json({ message: 'Property already in wishlist' });
    }

    user.wishlist.push(propertyId);
    await user.save();

    res.json({ message: 'Property added to wishlist', wishlist: user.wishlist });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Remove property from wishlist
// @route   DELETE /api/wishlist/:propertyId
// @access  Private (Tenant)
router.delete('/:propertyId', protect, authorize('tenant'), async (req, res) => {
  try {
    const { propertyId } = req.params;
    const user = await User.findById(req.user._id);

    user.wishlist = user.wishlist.filter(
      (id) => id.toString() !== propertyId
    );

    await user.save();
    res.json({ message: 'Property removed from wishlist', wishlist: user.wishlist });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
