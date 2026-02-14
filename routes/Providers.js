const express = require("express");
const User = require("../models/User.model");
const auth = require("../middleware/auth");

const router = express.Router();

router.get("/", async (req, res) => {
  const providers = await User.find({ role: "provider" }).select("-password");
  res.json({ success: true, providers });
});

router.get("/me", auth, async (req, res) => {
  if (req.user.role !== "provider")
    return res.status(403).json({ error: "Access denied" });

  res.json({ provider: req.user });
});

router.get("/:id", async (req, res) => {
  const provider = await User.findById(req.params.id).select("-password");
  if (!provider || provider.role !== "provider")
    return res.status(404).json({ error: "Provider not found" });

  res.json({ provider });
});

module.exports = router;