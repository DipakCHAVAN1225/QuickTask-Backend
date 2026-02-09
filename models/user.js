

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      match: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
    },
    
    // User role - 'user' or 'provider'
    role: {
      type: String,
      enum: ['user', 'provider'],
      default: 'user'
    },
    
    // Basic Info
    phone: {
      type: String,
      default: ''
    },
    address: {
      type: String,
      default: ''
    },
    
    // Provider-specific fields
    businessName: {
      type: String,
      default: ''
    },
    serviceType: {
      type: String,
      default: ''
    },
    services: [String],
    
    // Pricing & Experience
    pricePerHour: {
      type: Number,
      default: 500
    },
    maxPrice: {
      type: Number,
      default: 1500
    },
    yearsOfExperience: {
      type: Number,
      default: 5
    },
    responseTime: {
      type: String,
      default: '15 mins'
    },
    completionRate: {
      type: Number,
      default: 98
    },
    
    // Profile
    dp: {
      type: String,
      default: ''
    },
    bio: {
      type: String,
      default: ''
    },
    rating: {
      type: Number,
      default: 4.5,
      min: 0,
      max: 5
    },
    totalReviews: {
      type: Number,
      default: 0
    },
    languages: [String],
    
    // Cancellation Policy
    cancellationPolicy: {
      hoursBeforeCancel: {
        type: Number,
        default: 2
      },
      allowRescheduling: {
        type: Boolean,
        default: true
      },
      guaranteeType: {
        type: String,
        default: '100% satisfaction guarantee'
      }
    },
    
    // Availability
    isAvailable: {
      type: Boolean,
      default: true
    },
    workingDays: [String],
    workingHours: {
      start: {
        type: String,
        default: '09:00 AM'
      },
      end: {
        type: String,
        default: '06:00 PM'
      }
    },
    
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('user', userSchema);
