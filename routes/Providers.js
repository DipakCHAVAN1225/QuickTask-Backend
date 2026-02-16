const express = require("express");
const User = require("../models/User.model");
const auth = require("../middleware/auth");

const router = express.Router();

/**
 * GET all providers
 * GET /api/providers
 */
router.get("/", async (req, res) => {
  try {
    const providers = await User.find({ role: "provider" }).select("-password");
    res.status(200).json({ success: true, providers });
  } catch (error) {
    console.error("Get providers error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/**
 * GET logged-in provider
 * GET /api/providers/me
 */
router.get("/me", auth, async (req, res) => {
  try {
    if (!req.user || req.user.role !== "provider") {
      return res.status(403).json({ error: "Access denied" });
    }

    res.status(200).json({ provider: req.user });
  } catch (error) {
    console.error("Get provider me error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * GET provider by ID
 * GET /api/providers/:id
 */
router.get("/:id", async (req, res) => {
  try {
    const provider = await User.findById(req.params.id).select("-password");

    if (!provider || provider.role !== "provider") {
      return res.status(404).json({ error: "Provider not found" });
    }

    res.status(200).json({ provider });
  } catch (error) {
    console.error("Get provider by id error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;