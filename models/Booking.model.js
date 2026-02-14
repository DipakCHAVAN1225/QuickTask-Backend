const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    providerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    serviceType: String,
    scheduledTime: Date,
    amount: Number,
    status: {
      type: String,
      enum: ["pending", "accepted", "completed", "cancelled", "rejected"],
      default: "pending"
    },
    rating: Number,
    review: String
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);