const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    providerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    amount: Number,
    status: { type: String, enum: ["PAID", "FAILED"], default: "PAID" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);