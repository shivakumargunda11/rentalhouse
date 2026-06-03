import express from 'express';
import User from '../models/User.js';
import Property from '../models/Property.js';
import Booking from '../models/Booking.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/role.js';

const router = express.Router();

// Apply admin role protection to all routes in this file
router.use(protect);
router.use(authorize('admin'));

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin)
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Private (Admin)
router.put('/users/:id/role', async (req, res) => {
  try {
    const { role } = req.body;

    if (!['tenant', 'landlord', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid user role' });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent admin from changing their own role (accidental lockout)
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot change your own role' });
    }

    user.role = role;
    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @desc    Delete a user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent admin from deleting themselves
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot delete your own admin account' });
    }

    // Delete all bookings/properties associated with the user if they are landlord/tenant
    if (user.role === 'landlord') {
      await Property.deleteMany({ owner: user._id });
      await Booking.deleteMany({ landlord: user._id });
    } else if (user.role === 'tenant') {
      await Booking.deleteMany({ tenant: user._id });
    }

    await user.deleteOne();
    res.json({ message: 'User and all associated data deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get dashboard statistics
// @route   GET /api/admin/stats
// @access  Private (Admin)
router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalProperties = await Property.countDocuments();
    const totalBookings = await Booking.countDocuments();

    // Group users by role
    const tenantCount = await User.countDocuments({ role: 'tenant' });
    const landlordCount = await User.countDocuments({ role: 'landlord' });
    const adminCount = await User.countDocuments({ role: 'admin' });

    // Group bookings by status
    const pendingBookings = await Booking.countDocuments({ status: 'pending' });
    const approvedBookings = await Booking.countDocuments({ status: 'approved' });
    const rejectedBookings = await Booking.countDocuments({ status: 'rejected' });

    // Calculate total revenue generated (approved bookings)
    const approvedListings = await Booking.find({ status: 'approved' });
    const totalRevenue = approvedListings.reduce((sum, b) => sum + b.totalPrice, 0);

    res.json({
      users: {
        total: totalUsers,
        tenants: tenantCount,
        landlords: landlordCount,
        admins: adminCount,
      },
      properties: {
        total: totalProperties,
      },
      bookings: {
        total: totalBookings,
        pending: pendingBookings,
        approved: approvedBookings,
        rejected: rejectedBookings,
      },
      totalRevenue,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Approve/moderate a property listing
// @route   PUT /api/admin/properties/:id/approve
// @access  Private (Admin)
router.put('/properties/:id/approve', async (req, res) => {
  try {
    const { isApproved } = req.body;

    if (typeof isApproved !== 'boolean') {
      return res.status(400).json({ message: 'isApproved must be a boolean' });
    }

    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    property.isApproved = isApproved;
    const updatedProperty = await property.save();

    res.json(updatedProperty);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @desc    Get all listings for moderation (both approved and pending)
// @route   GET /api/admin/properties
// @access  Private (Admin)
router.get('/properties', async (req, res) => {
  try {
    const properties = await Property.find({})
      .populate('owner', 'name email phone')
      .sort({ createdAt: -1 });
    res.json(properties);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
