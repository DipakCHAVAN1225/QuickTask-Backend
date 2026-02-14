
// const express = require('express');
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// const User = require('./models/User');
// const auth = require('../middleware/Auth');

// const router = express.Router();

// /**
//  * @route   POST /api/auth/register
//  * @desc    Register user/provider
//  */
// router.post('/register', async (req, res) => {
//   try {
//     const { name, email, password, role, businessName, serviceType } = req.body;

//     //   Check based on role type
//     if (role === 'user') {
//       if (!name || !email || !password) {
//         return res.status(400).json({ error: 'Missing required fields' });
//       }
//     } else if (role === 'provider') {
//       if (!businessName || !serviceType || !email || !password) {
//         return res.status(400).json({ error: 'Missing required fields' });
//       }
//     } else {
//       return res.status(400).json({ error: 'Invalid role' });
//     }

//     let existing = await User.findOne({ email });
//     if (existing) {
//       return res.status(409).json({ error: 'User with that email already exists' });
//     }

//     const salt = await bcrypt.genSalt(10);
//     const hashed = await bcrypt.hash(password, salt);

//     const userData = {
//       email,
//       password: hashed,
//       role
//     };

//     if (role === 'user') {
//       userData.name = name;
//     } else if (role === 'provider') {
//       userData.name = businessName;
//       userData.serviceType = serviceType;
//     }

//     const user = new User(userData);
//     await user.save();

//     const payload = { id: user._id, role: user.role };
//     const token = jwt.sign(payload, process.env.JWT_SECRET, { 
//       expiresIn: process.env.JWT_EXPIRES_IN || '7d' 
//     });

//     res.status(201).json({
//       token,
//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//         role: user.role,
//         serviceType: user.serviceType || null
//       }
//     });
//   } catch (err) {
//     console.error('Register error:', err);
//     res.status(500).json({ error: 'Server error' });
//   }
// });

// /**
//  * @route   POST /api/auth/login
//  * @desc    Login user or provider
//  * @body    For User: { email, password }
//  *          For Provider: { email, password, businessName, serviceType }
//  */
// router.post('/login', async (req, res) => {
//   try {
//     const { email, password, businessName, serviceType, role } = req.body;

//     // Determine if this is a provider login
//     const isProviderLogin = businessName && serviceType;

//     if (!email || !password) {
//       return res.status(400).json({ error: 'Email and password are required' });
//     }

//     //   For provider login, also validate businessName and serviceType
//     if (isProviderLogin) {
//       if (!businessName || !serviceType) {
//         return res.status(400).json({ error: 'Business name and service type are required for provider login' });
//       }
//     }

//     // Find user by email
//     let user = await User.findOne({ email });
    
//     if (!user) {
//       return res.status(401).json({ error: 'Invalid credentials' });
//     }

//     //   For provider login, also check businessName and serviceType match
//     if (isProviderLogin) {
//       if (user.name !== businessName || user.serviceType !== serviceType) {
//         return res.status(401).json({ error: 'Invalid credentials - business name or service type mismatch' });
//       }
      
//       // Verify it's actually a provider
//       if (user.role !== 'provider') {
//         return res.status(401).json({ error: 'This account is not a provider account' });
//       }
//     } else {
//       // For regular user login, verify it's a user account (or doesn't matter)
//       if (user.role === 'provider') {
//         return res.status(401).json({ error: 'This is a provider account. Please use provider login' });
//       }
//     }

//     // Compare passwords
//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return res.status(401).json({ error: 'Invalid credentials' });
//     }

//     // Create JWT token
//     const payload = { id: user._id, role: user.role };
//     const token = jwt.sign(payload, process.env.JWT_SECRET, { 
//       expiresIn: process.env.JWT_EXPIRES_IN || '7d' 
//     });

//     res.json({
//       token,
//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//         role: user.role,
//         serviceType: user.serviceType || null
//       }
//     });
//   } catch (err) {
//     console.error('Login error:', err);
//     res.status(500).json({ error: 'Server error' });
//   }
// });

// /**
//  * @route   GET /api/auth/me
//  * @desc    Get logged-in user info (protected)
//  */
// router.get('/me', auth, async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const user = await User.findById(userId).select('-password');
//     if (!user) {
//       return res.status(404).json({ error: 'User not found' });
//     }
//     res.json({ user });
//   } catch (err) {
//     console.error('Get user error:', err);
//     res.status(500).json({ error: 'Server error' });
//   }
// });

// module.exports = router;






const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const auth = require("../middleware/auth");

const router = express.Router();

/* REGISTER */
router.post("/register", async (req, res) => {
  const { name, email, password, role, serviceType } = req.body;

  if (!email || !password || !role)
    return res.status(400).json({ error: "Missing fields" });

  const exists = await User.findOne({ email });
  if (exists) return res.status(409).json({ error: "Email exists" });

  const hashed = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    password: hashed,
    role,
    serviceType,
  });

  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.status(201).json({ token, user });
});

/* LOGIN */
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });

  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.json({ token, user });
});

/* ME */
router.get("/me", auth, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;