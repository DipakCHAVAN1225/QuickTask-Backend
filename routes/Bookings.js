const express = require("express");
const Booking = require("../models/Booking.model");
const auth = require("../middleware/auth");

const router = express.Router();

/* USER BOOKINGS */
router.get("/user", auth, async (req, res) => {
  const bookings = await Booking.find({ userId: req.user._id });
  res.json({ success: true, bookings });
});

/* CREATE BOOKING */
router.post("/", auth, async (req, res) => {
  const booking = await Booking.create({
    ...req.body,
    userId: req.user._id
  });

  res.status(201).json({ success: true, booking });
});

module.exports = router;