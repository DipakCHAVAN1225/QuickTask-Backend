
// // backend/server.js

// // Load env vars (only used locally; Vercel uses dashboard envs)
// require('dotenv').config();

// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// const multer = require('multer');

// const app = express();

// /* =========================
//    BASIC MIDDLEWARE
// ========================= */
// app.use(express.json({ limit: '50mb' }));
// app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// /* =========================
//    CONFIGURATION
// ========================= */
// const NODE_ENV = process.env.NODE_ENV || 'production';
// const MONGODB_URI = process.env.MONGODB_URI;
// const JWT_SECRET = process.env.JWT_SECRET;
// const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';

// // Hard fail if critical envs missing (prevents silent crashes)
// if (!MONGODB_URI) throw new Error('MONGODB_URI is not defined');
// if (!JWT_SECRET) throw new Error('JWT_SECRET is not defined');

// console.log('🔧 Configuration loaded');
// console.log(`   Environment: ${NODE_ENV}`);
// console.log(`   CORS Origin: ${CORS_ORIGIN}`);

// /* =========================
//    CORS
// ========================= */
// app.use(
//   cors({
//     origin: CORS_ORIGIN,
//     credentials: true,
//     methods: ['GET', 'POST', 'PUT', 'DELETE'],
//   })
// );

// /* =========================
//    DATABASE (Serverless-safe)
// ========================= */
// let isConnected = false;

// async function connectToDatabase() {
//   if (isConnected) return;

//   try {
//     await mongoose.connect(process.env.MONGODB_URI);
//     isConnected = true;
//     console.log('✅ MongoDB connected');
//   } catch (err) {
//     console.error('❌ MongoDB connection error:', err.message);
//     throw err;
//   }
// }

// // Connect once on cold start
// connectToDatabase();

// /* =========================
//    MULTER (Memory Storage)
// ========================= */
// const upload = multer({
//   storage: multer.memoryStorage(),
//   limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
//   fileFilter: (req, file, cb) => {
//     const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
//     allowed.includes(file.mimetype)
//       ? cb(null, true)
//       : cb(new Error('Invalid image type'));
//   },
// });

// /* =========================
//    USER SCHEMA
// ========================= */
// const userSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   email: { type: String, required: true, unique: true, lowercase: true },
//   password: { type: String, required: true },
//   role: { type: String, enum: ['user', 'provider'], required: true },

//   phone: String,
//   address: String,
//   city: String,
//   state: String,
//   zipcode: String,

//   businessName: String,
//   serviceType: String,
//   services: [String],

//   pricePerHour: { type: Number, default: 500 },
//   maxPrice: { type: Number, default: 1500 },

//   dp: String,
//   dpMimeType: { type: String, default: 'image/jpeg' },
//   bio: String,

//   rating: { type: Number, default: 4.5 },
//   totalReviews: { type: Number, default: 0 },

//   profileCompleted: { type: Boolean, default: false },
//   createdAt: { type: Date, default: Date.now },
//   updatedAt: { type: Date, default: Date.now },
// });

// const User = mongoose.model('User', userSchema);

// /* =========================
//    AUTH MIDDLEWARE
// ========================= */
// const authMiddleware = async (req, res, next) => {
//   try {
//     const token = req.header('Authorization')?.replace('Bearer ', '');
//     if (!token) return res.status(401).json({ error: 'No token provided' });

//     const decoded = jwt.verify(token, JWT_SECRET);
//     const user = await User.findById(decoded.userId);

//     if (!user) return res.status(401).json({ error: 'User not found' });

//     req.user = user;
//     next();
//   } catch (err) {
//     res.status(401).json({ error: 'Authentication failed' });
//   }
// };

// /* =========================
//    ROUTES
// ========================= */
// app.post('/api/auth/register', async (req, res) => {
//   try {
//     const { name, email, password, role } = req.body;

//     if (!name || !email || !password || !role)
//       return res.status(400).json({ error: 'Missing fields' });

//     const exists = await User.findOne({ email });
//     if (exists) return res.status(400).json({ error: 'Email already exists' });

//     const hashed = await bcrypt.hash(password, 10);
//     const user = await User.create({
//       name,
//       email,
//       password: hashed,
//       role,
//     });

//     const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
//       expiresIn: '7d',
//     });

//     res.status(201).json({ token, user: { id: user._id, email } });
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// });

// app.post('/api/auth/login', async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     const user = await User.findOne({ email });
//     if (!user) return res.status(401).json({ error: 'Invalid credentials' });

//     const ok = await bcrypt.compare(password, user.password);
//     if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

//     const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
//       expiresIn: '7d',
//     });

//     res.json({ token });
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// });

// app.get('/api/user/profile', authMiddleware, async (req, res) => {
//   res.json({ user: req.user });
// });

// app.put(
//   '/api/user/profile',
//   authMiddleware,
//   upload.single('profileImage'),
//   async (req, res) => {
//     try {
//       const update = { ...req.body, updatedAt: Date.now() };

//       if (req.file) {
//         update.dp = req.file.buffer.toString('base64');
//         update.dpMimeType = req.file.mimetype;
//       }

//       const user = await User.findByIdAndUpdate(req.user._id, update, {
//         new: true,
//       }).select('-password');

//       res.json({ user });
//     } catch (err) {
//       res.status(400).json({ error: err.message });
//     }
//   }
// );

// /* =========================
//    HEALTH CHECK
// ========================= */
// app.get('/api/health', (req, res) => {
//   res.json({ status: 'ok', environment: NODE_ENV });
// });

// /* =========================
//    ERROR HANDLER
// ========================= */
// app.use((err, req, res, next) => {
//   console.error(err);
//   res.status(500).json({ error: 'Internal Server Error' });
// });

// /* =========================
//    EXPORT (NO app.listen!)
// ========================= */
// module.exports = app;












// backend/server.js
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const bookingRoutes = require("./routes/Bookings");
const providerRoutes = require("./routes/Providers");
const paymentRoutes = require("./routes/paymentRoutes");

const app = express();

/* =========================
   MIDDLEWARE
========================= */
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

/* =========================
   DATABASE
========================= */
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => {
    console.error("❌ MongoDB error:", err.message);
    process.exit(1);
  });

/* =========================
   ROUTES
========================= */
app.use("/api/auth", authRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/providers", providerRoutes);
app.use("/api/payments", paymentRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

/* =========================
   ERROR HANDLER
========================= */
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Internal Server Error" });
});

module.exports = app;