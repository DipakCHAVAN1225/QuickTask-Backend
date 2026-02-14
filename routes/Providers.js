

const express = require("express");
const router = express.Router();

const auth = require("../middleware/Auth");
const User = require("../models/user");
const Payment = require("../models/payment");

/* ========================================================
   GET /api/providers
   Get all providers
======================================================== */
router.get("/", async (req, res) => {
  try {
    const providers = await User.find({ role: "provider" })
      .select("-password")
      .lean();

    res.json({
      success: true,
      providers: providers.map((p) => ({
        id: p._id,
        name: p.name,
        email: p.email,
        phone: p.phone || "",
        address: p.address || "",
        serviceType: p.serviceType || "",
        services: p.services || [],
        pricePerHour: p.pricePerHour ?? 500,
        maxPrice: p.maxPrice ?? 1500,
        rating: p.rating ?? 4.5,
        reviews: p.totalReviews ?? 0,
        bio: p.bio || "",
        dp: p.dp || "https://via.placeholder.com/150",
        isAvailable: p.isAvailable ?? true,
      })),
    });
  } catch (err) {
    console.error("Get providers error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* ========================================================
   GET /api/providers/me
   Provider dashboard (PROTECTED)
======================================================== */
router.get("/me", auth, async (req, res) => {
  try {
    if (req.user.role !== "provider") {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json({
      success: true,
      provider: req.user,
    });
  } catch (err) {
    console.error("Provider me error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ========================================================
   GET /api/providers/:id
   Get single provider
======================================================== */
router.get("/:id", async (req, res) => {
  try {
    const provider = await User.findById(req.params.id)
      .select("-password")
      .lean();

    if (!provider || provider.role !== "provider") {
      return res
        .status(404)
        .json({ success: false, message: "Provider not found" });
    }

    res.json({
      success: true,
      provider: {
        id: provider._id,
        name: provider.name,
        email: provider.email,
        phone: provider.phone || "",
        address: provider.address || "",
        serviceType: provider.serviceType || "",
        services: provider.services || [],
        pricePerHour: provider.pricePerHour ?? 500,
        maxPrice: provider.maxPrice ?? 1500,
        rating: provider.rating ?? 4.5,
        reviews: provider.totalReviews ?? 0,
        bio: provider.bio || "",
        dp: provider.dp || "https://via.placeholder.com/150",
      },
    });
  } catch (err) {
    console.error("Get provider error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* ========================================================
   GET /api/providers/:id/available-times
======================================================== */
router.get("/:id/available-times", async (req, res) => {
  try {
    // Mock data (replace later with real logic)
    const availableTimes = [
      "09:00 AM",
      "10:00 AM",
      "11:00 AM",
      "01:00 PM",
      "02:00 PM",
      "03:00 PM",
      "04:00 PM",
    ];

    res.json({ success: true, availableTimes });
  } catch (err) {
    console.error("Available times error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* ========================================================
   GET /api/providers/earnings/:providerId
======================================================== */
router.get("/earnings/:providerId", async (req, res) => {
  try {
    const payments = await Payment.find({
      providerId: req.params.providerId,
      status: "PAID",
    });

    const total = payments.reduce((sum, p) => sum + p.amount, 0);

    res.json({
      success: true,
      total,
      payments,
    });
  } catch (err) {
    console.error("Earnings error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;