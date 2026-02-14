const express = require("express");
const Payment = require("../models/Payment.model");
const auth = require("../middleware/auth");

const router = express.Router();

router.post("/dummy-pay", auth, async (req, res) => {
  const payment = await Payment.create({
    userId: req.user._id,
    providerId: req.body.providerId,
    amount: req.body.amount
  });

  res.json({ success: true, payment });
});

module.exports = router;