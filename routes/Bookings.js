// ============================================================
// FILE: routes/bookings.js
// ============================================================

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

// ============ BOOKING SCHEMA ============
const bookingschema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userName: String,
  userEmail: String,
  
  providerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  providerName: String,
  providerEmail: String,
  
  serviceType: {
    type: String,
    required: true
  },
  scheduledTime: {
    type: Date,
    required: true
  },
  location: String,
  description: String,
  amount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'completed', 'cancelled', 'rejected'],
    default: 'pending'
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  review: String,
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  acceptedAt: Date,
  completedAt: Date
});

const Booking = mongoose.model('Booking', bookingschema);

// ============ AUTH MIDDLEWARE ============
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'change-this-secret-key');
    const User = mongoose.model('User');
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    
    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Please authenticate', details: error.message });
  }
};

// ============ ROUTES ============

// GET - User's all bookings
router.get('/user', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    console.log('📋 Fetching bookings for user:', userId);
    
    const bookings = await Booking.find({ userId })
      .sort({ createdAt: -1 })
      .lean();

    res.json({ 
      success: true, 
      bookings: bookings || [] 
    });
  } catch (error) {
    console.error('  Error fetching user bookings:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching bookings',
      error: error.message
    });
  }
});

// GET - Provider's pending requests
router.get('/provider/requests', authMiddleware, async (req, res) => {
  try {
    const providerId = req.user._id;
    console.log('📨 Fetching requests for provider:', providerId);
    
    const requests = await Booking.find({ 
      providerId,
      status: 'pending' 
    })
    .sort({ createdAt: -1 })
    .lean();

    res.json({ 
      success: true, 
      requests: requests || [] 
    });
  } catch (error) {
    console.error('  Error fetching requests:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching requests',
      error: error.message
    });
  }
});

// GET - Provider's confirmed bookings (accepted and completed)
router.get('/provider/bookings', authMiddleware, async (req, res) => {
  try {
    const providerId = req.user._id;
    console.log('📅 Fetching bookings for provider:', providerId);
    
    const bookings = await Booking.find({ 
      providerId,
      status: { $in: ['accepted', 'completed'] }
    })
    .sort({ scheduledTime: 1 })
    .lean();

    res.json({ 
      success: true, 
      bookings: bookings || [] 
    });
  } catch (error) {
    console.error('  Error fetching bookings:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching bookings',
      error: error.message
    });
  }
});

// POST - Create booking
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { providerId, serviceType, scheduledTime, location, description, amount } = req.body;
    const userId = req.user._id;

    // Validate required fields
    if (!providerId || !serviceType || !scheduledTime || !amount) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields: providerId, serviceType, scheduledTime, amount' 
      });
    }

    // Get user and provider details
    const User = mongoose.model('User');
    const user = await User.findById(userId).select('name email');
    const provider = await User.findById(providerId).select('name email');

    if (!user || !provider) {
      return res.status(404).json({ 
        success: false, 
        message: 'User or Provider not found' 
      });
    }

    const booking = new Booking({
      userId,
      userName: user.name,
      userEmail: user.email,
      providerId,
      providerName: provider.name,
      providerEmail: provider.email,
      serviceType,
      scheduledTime: new Date(scheduledTime),
      location,
      description,
      amount,
      status: 'pending',
      createdAt: new Date()
    });

    await booking.save();
    console.log(`  Booking created: ${booking._id}`);

    res.status(201).json({ 
      success: true, 
      message: 'Booking request sent successfully',
      booking 
    });
  } catch (error) {
    console.error('  Error creating booking:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error creating booking',
      error: error.message
    });
  }
});

// PUT - Accept booking request
router.put('/:bookingId/accept', authMiddleware, async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      { 
        status: 'accepted', 
        acceptedAt: new Date() 
      },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({ 
        success: false, 
        message: 'Booking not found' 
      });
    }

    console.log(`  Booking accepted: ${bookingId}`);

    res.json({ 
      success: true, 
      message: 'Booking accepted successfully',
      booking 
    });
  } catch (error) {
    console.error('  Error accepting booking:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error accepting booking',
      error: error.message
    });
  }
});

// PUT - Reject booking request
router.put('/:bookingId/reject', authMiddleware, async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      { status: 'rejected' },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({ 
        success: false, 
        message: 'Booking not found' 
      });
    }

    console.log(`  Booking rejected: ${bookingId}`);

    res.json({ 
      success: true, 
      message: 'Booking rejected successfully',
      booking 
    });
  } catch (error) {
    console.error('  Error rejecting booking:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error rejecting booking',
      error: error.message
    });
  }
});

// PUT - Complete booking
router.put('/:bookingId/complete', authMiddleware, async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      { 
        status: 'completed', 
        completedAt: new Date() 
      },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({ 
        success: false, 
        message: 'Booking not found' 
      });
    }

    console.log(`  Booking completed: ${bookingId}`);

    res.json({ 
      success: true, 
      message: 'Booking marked as completed',
      booking 
    });
  } catch (error) {
    console.error('  Error completing booking:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error completing booking',
      error: error.message
    });
  }
});

// PUT - Cancel booking
router.put('/:bookingId/cancel', authMiddleware, async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user._id;

    const booking = await Booking.findOne({ _id: bookingId, userId });
    
    if (!booking) {
      return res.status(404).json({ 
        success: false, 
        message: 'Booking not found' 
      });
    }

    if (!['pending', 'accepted'].includes(booking.status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot cancel this booking' 
      });
    }

    booking.status = 'cancelled';
    await booking.save();

    console.log(`  Booking cancelled: ${bookingId}`);

    res.json({ 
      success: true, 
      message: 'Booking cancelled successfully',
      booking 
    });
  } catch (error) {
    console.error('  Error cancelling booking:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error cancelling booking',
      error: error.message
    });
  }
});

// PUT - Rate booking
router.put('/:bookingId/rate', authMiddleware, async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { rating, review } = req.body;
    const userId = req.user._id;

    const booking = await Booking.findOne({ _id: bookingId, userId });
    
    if (!booking) {
      return res.status(404).json({ 
        success: false, 
        message: 'Booking not found' 
      });
    }

    if (booking.status !== 'completed') {
      return res.status(400).json({ 
        success: false, 
        message: 'Can only rate completed bookings' 
      });
    }

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ 
        success: false, 
        message: 'Rating must be between 1 and 5' 
      });
    }

    booking.rating = rating;
    booking.review = review || '';
    await booking.save();

    console.log(`  Booking rated: ${bookingId}`);

    res.json({ 
      success: true, 
      message: 'Rating submitted successfully',
      booking 
    });
  } catch (error) {
    console.error('  Error submitting rating:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error submitting rating',
      error: error.message
    });
  }
});

module.exports = router;