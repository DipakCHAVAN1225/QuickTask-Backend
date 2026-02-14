// const mongoose = require('mongoose');

// const bookingschema = new mongoose.Schema({
//   userId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true
//   },
//   userName: String,
//   providerId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true
//   },
//   providerName: String,
//   serviceType: {
//     type: String,
//     required: true
//   },
//   scheduledTime: {
//     type: Date,
//     required: true
//   },
//   location: String,
//   description: String,
//   amount: {
//     type: Number,
//     required: true
//   },
//   status: {
//     type: String,
//     enum: ['pending', 'accepted', 'completed', 'cancelled', 'rejected'],
//     default: 'pending'
//   },
//   rating: {
//     type: Number,
//     min: 1,
//     max: 5
//   },
//   review: String,
//   createdAt: {
//     type: Date,
//     default: Date.now
//   },
//   acceptedAt: Date,
//   completedAt: Date
// });

// module.exports = mongoose.model('Booking', bookingschema);










const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    providerId: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    serviceType: String,
    scheduledTime: Date,
    amount: Number,
    status: {
      type: String,
      enum: ["pending", "accepted", "completed", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);