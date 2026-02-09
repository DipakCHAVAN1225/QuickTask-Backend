// routes/paymentRoutes.js
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Middleware to verify JWT token
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'change-this-secret-key';

const verifyToken = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: 'No token provided' 
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = { id: decoded.userId };
    next();
  } catch (error) {
    res.status(401).json({ 
      success: false,
      message: 'Invalid token' 
    });
  }
};

// Auth middleware that gets full user object
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
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

// ============ GET USER BOOKINGS ============
router.get('/user-bookings', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    console.log('📖 Fetching bookings for user:', userId);
    
    // Get the Payment collection
    const db = mongoose.connection;
    const Payment = db.collection('payments');
    
    const bookings = await Payment.find({ userId: new mongoose.Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .toArray();
    
    console.log('  Found', bookings.length, 'bookings');
    res.json({ 
      success: true, 
      bookings: bookings || [] 
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching bookings',
      error: error.message
    });
  }
});

// Dummy payment endpoint for testing
router.post("/dummy-pay", async (req, res) => {
  try {
    const { amount, paymentMethod } = req.body;

    if (!amount) {
      return res.status(400).json({ 
        success: false, 
        message: 'Amount is required' 
      });
    }

    console.log('💳 Processing dummy payment:', {
      amount,
      paymentMethod,
      timestamp: new Date().toISOString()
    });

    // Simulate payment processing
    setTimeout(() => {
      res.json({
        success: true,
        message: 'Payment processed successfully',
        transactionId: `TXN${Date.now()}`,
        amount,
        paymentMethod
      });
    }, 1000);
  } catch (error) {
    console.error('Payment error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// Verify payment endpoint
router.post("/verify", verifyToken, async (req, res) => {
  try {
    const { transactionId } = req.body;

    if (!transactionId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Transaction ID is required' 
      });
    }

    console.log('  Verifying payment:', transactionId);

    res.json({
      success: true,
      message: 'Payment verified',
      transactionId,
      status: 'completed'
    });
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

module.exports = router;