
// backend/routes/providers.js
const express = require("express");
const router = express.Router();
const auth = require("../middleware/Auth");
const User = require("../models/user");
const Payment = require("../models/payment");

// ========================================================
// GET /api/providers - Get all providers
// ========================================================
router.get("/", async (req, res) => {
  try {
    console.log('📖 Fetching all providers...');
    
    const providers = await User.find({ role: 'provider' })
      .select('-password')
      .lean();
    
    console.log(`  Found ${providers.length} providers`);
    
    res.json({
      success: true,
      providers: providers.map(provider => ({
        id: provider._id,
        name: provider.name,
        email: provider.email,
        phone: provider.phone || '',
        address: provider.address || '',
        businessName: provider.businessName || '',
        service: provider.serviceType || '',
        services: provider.services || [],
        price: provider.pricePerHour || 500,
        maxPrice: provider.maxPrice || 1500,
        experience: provider.yearsOfExperience ? `${provider.yearsOfExperience} years` : '5 years',
        responseTime: provider.responseTime || '15 mins',
        completionRate: provider.completionRate || 98,
        rating: provider.rating || 4.5,
        reviews: provider.totalReviews || 0,
        dp: provider.dp || 'https://via.placeholder.com/150',
        bio: provider.bio || '',
        location: provider.address || '',
        description: provider.bio || `Professional ${provider.serviceType} expert`,
        aboutMe: provider.bio || `I am a certified ${provider.serviceType} provider`,
        policies: {
          cancellation: `Free cancellation up to ${provider.cancellationPolicy?.hoursBeforeCancel || 2} hours before appointment`,
          rescheduling: provider.cancellationPolicy?.allowRescheduling ? 'You can reschedule anytime' : 'Limited rescheduling',
          guarantee: provider.cancellationPolicy?.guaranteeType || '100% satisfaction guarantee'
        },
        isAvailable: provider.isAvailable || true,
        workingHours: provider.workingHours || { start: '09:00 AM', end: '06:00 PM' },
        coverImage: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=500&h=300&fit=crop'
      }))
    });
  } catch (error) {
    console.error('  Error fetching providers:', error.message);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

// ========================================================
// GET /api/providers/:id - Get single provider by ID
// ========================================================
router.get("/:id", async (req, res) => {
  try {
    console.log('📖 Fetching provider:', req.params.id);
    
    const provider = await User.findById(req.params.id)
      .select('-password')
      .lean();
    
    if (!provider || provider.role !== 'provider') {
      return res.status(404).json({ 
        success: false,
        message: 'Provider not found' 
      });
    }
    
    console.log('  Found provider:', provider.name);
    
    res.json({
      success: true,
      id: provider._id,
      name: provider.name,
      email: provider.email,
      phone: provider.phone || '',
      address: provider.address || '',
      businessName: provider.businessName || '',
      service: provider.serviceType || '',
      services: provider.services || [],
      price: provider.pricePerHour || 500,
      maxPrice: provider.maxPrice || 1500,
      experience: provider.yearsOfExperience ? `${provider.yearsOfExperience} years` : '5 years',
      responseTime: provider.responseTime || '15 mins',
      completionRate: provider.completionRate || 98,
      rating: provider.rating || 4.5,
      reviews: provider.totalReviews || 0,
      dp: provider.dp || 'https://via.placeholder.com/150',
      bio: provider.bio || '',
      location: provider.address || '',
      description: provider.bio || `Professional ${provider.serviceType} expert`,
      aboutMe: provider.bio || `I am a certified ${provider.serviceType} provider`,
      policies: {
        cancellation: `Free cancellation up to ${provider.cancellationPolicy?.hoursBeforeCancel || 2} hours before appointment`,
        rescheduling: provider.cancellationPolicy?.allowRescheduling ? 'You can reschedule anytime' : 'Limited rescheduling',
        guarantee: provider.cancellationPolicy?.guaranteeType || '100% satisfaction guarantee'
      },
      isAvailable: provider.isAvailable || true,
      workingHours: provider.workingHours || { start: '09:00 AM', end: '06:00 PM' },
      coverImage: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=500&h=300&fit=crop'
    });
  } catch (error) {
    console.error('  Error fetching provider:', error.message);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

// ========================================================
// GET /api/providers/:id/available-times - Get available times
// ========================================================
router.get("/:id/available-times", async (req, res) => {
  try {
    const { date } = req.query;
    console.log('📅 Fetching available times for provider:', req.params.id, 'on date:', date);
    
    // Return mock available times for now
    const availableTimes = [
      '09:00 AM', '10:00 AM', '11:00 AM', 
      '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM'
    ];
    
    res.json({
      success: true,
      availableTimes
    });
  } catch (error) {
    console.error('  Error fetching available times:', error.message);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

// ========================================================
// GET /api/providers/me - provider's dashboard (provider-only)
// ========================================================
router.get("/me", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select("-passwordHash");
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.role !== "provider") return res.status(403).json({ message: "Access denied" });

    return res.json({ provider: user });
  } catch (err) {
    console.error("providers/me error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// ========================================================
// GET /api/providers/earnings/:providerId - Get provider earnings
// ========================================================
router.get("/earnings/:providerId", async (req, res) => {
  try {
    const payments = await Payment.find({
      providerId: req.params.providerId,
      status: "PAID",
    });

    const total = payments.reduce((sum, p) => sum + p.amount, 0);

    res.json({ payments, total });
  } catch (err) {
    console.error("earnings error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;