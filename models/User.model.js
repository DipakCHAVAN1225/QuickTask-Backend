const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true, lowercase: true },
    password: String,
    role: { type: String, enum: ["user", "provider"], required: true },
    serviceType: String,
    services: [String],
    pricePerHour: { type: Number, default: 500 },
    maxPrice: { type: Number, default: 1500 },
    dp: String,
    bio: String,
    rating: { type: Number, default: 4.5 },
    totalReviews: { type: Number, default: 0 }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);