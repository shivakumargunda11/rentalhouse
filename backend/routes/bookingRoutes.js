import express from 'express';
import Booking from '../models/Booking.js';
import Property from '../models/Property.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/role.js';

const router = express.Router();

// @desc    Request a booking
// @route   POST /api/bookings
// @access  Private (Tenant)
router.post('/', protect, authorize('tenant'), async (req, res) => {
  try {
    const { propertyId, startDate, endDate, totalPrice } = req.body;

    const property = await Property.findById(propertyId);

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    if (!property.availability) {
      return res
        .status(400)
        .json({ message: 'Property is not available for booking' });
    }

    // Check if tenant is trying to book their own property (if they are also landlord somehow, but role is tenant here)
    if (property.owner.toString() === req.user._id.toString()) {
      return res
        .status(400)
        .json({ message: 'Cannot book your own property' });
    }

    const booking = new Booking({
      property: propertyId,
      tenant: req.user._id,
      landlord: property.owner,
      startDate,
      endDate,
      totalPrice: Number(totalPrice),
      status: 'pending',
    });

    const createdBooking = await booking.save();
    res.status(201).json(createdBooking);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @desc    Get bookings of the logged-in tenant
// @route   GET /api/bookings/my-bookings
// @access  Private (Tenant)
router.get('/my-bookings', protect, authorize('tenant'), async (req, res) => {
  try {
    const bookings = await Booking.find({ tenant: req.user._id })
      .populate('property')
      .populate('landlord', 'name email phone')
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get bookings for landlord's properties
// @route   GET /api/bookings/landlord-bookings
// @access  Private (Landlord/Admin)
router.get(
  '/landlord-bookings',
  protect,
  authorize('landlord', 'admin'),
  async (req, res) => {
    try {
      const bookings = await Booking.find({ landlord: req.user._id })
        .populate('property')
        .populate('tenant', 'name email phone')
        .sort({ createdAt: -1 });

      res.json(bookings);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// @desc    Approve or reject a booking
// @route   PUT /api/bookings/:id
// @access  Private (Landlord/Admin)
router.put(
  '/:id',
  protect,
  authorize('landlord', 'admin'),
  async (req, res) => {
    try {
      const { status } = req.body; // 'approved' or 'rejected'

      if (!['approved', 'rejected'].includes(status)) {
        return res.status(400).json({ message: 'Invalid booking status' });
      }

      const booking = await Booking.findById(req.params.id);

      if (!booking) {
        return res.status(404).json({ message: 'Booking not found' });
      }

      // Check authorization (only the property landlord or admin can approve/reject)
      if (booking.landlord.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res
          .status(403)
          .json({ message: 'Not authorized to moderate this booking' });
      }

      booking.status = status;
      const updatedBooking = await booking.save();

      // If booking is approved, update property availability to false
      if (status === 'approved') {
        await Property.findByIdAndUpdate(booking.property, {
          availability: false,
        });
      } else if (status === 'rejected') {
        // If rejected, make sure it is available (in case it was previously approved)
        await Property.findByIdAndUpdate(booking.property, {
          availability: true,
        });
      }

      res.json(updatedBooking);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
);

export default router;
