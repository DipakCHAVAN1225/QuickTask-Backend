
// // backend/server.js
// // Load environment variables from .env file
// require('dotenv').config();

// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// const multer = require('multer');

// const app = express();

// app.use(express.json({ limit: '50mb' }));
// app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// // ============ CONFIGURATION ============
// // const PORT = process.env.PORT || 3000;
// const NODE_ENV = process.env.NODE_ENV || 'development';
// const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/quicktask';
// const JWT_SECRET = process.env.JWT_SECRET || 'change-this-secret-key';
// const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';

// console.log('🔧 Configuration:');
// console.log(`   Environment: ${NODE_ENV}`);
// // console.log(`   Port: ${PORT}`);
// console.log(`   MongoDB: ${MONGODB_URI.split('@')[1] || MONGODB_URI}`);
// console.log(`   CORS Origin: ${CORS_ORIGIN}`);
// console.log(`   JWT Secret: ${JWT_SECRET.substring(0, 10)}...`);

// // ============ MULTER CONFIGURATION (Memory Storage for MongoDB) ============
// const storage = multer.memoryStorage(); // Store image in memory temporarily

// const upload = multer({
//   storage: storage,
//   limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
//   fileFilter: (req, file, cb) => {
//     const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
//     if (allowedMimes.includes(file.mimetype)) {
//       cb(null, true);
//     } else {
//       cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP allowed.'));
//     }
//   }
// });

// // ============ MIDDLEWARE ============
// app.use(cors({
//   origin: CORS_ORIGIN,
//   credentials: true,
// }));

// // Request logging middleware (development only)
// if (NODE_ENV === 'development') {
//   app.use((req, res, next) => {
//     console.log(`📥 ${req.method} ${req.path}`);
//     next();
//   });
// }

// // ============ DATABASE CONNECTION ============
// let isConnected=false;

// async function connectToDatabase() {
//   try{
//     await mongoose.connect(process.env.MONGODB_URI, {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//     });
//     isConnected=true;
//     console.log('  MongoDB connected');
//   } catch(err){
//     console.error('  MongoDB connection error:', err.message);
//   }

// }

// app.use(async (req, res, next) => {
//   if (!isConnected) {
//     await connectToDatabase();
//   }
//   next();
// });
// //     console.error('  MongoDB connection error:', err.message);
// //     process.exit(1);
// //   });

// // ============ ENHANCED USER SCHEMA ============
// const userSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   email: { type: String, required: true, unique: true, lowercase: true },
//   password: { type: String, required: true },
//   role: { type: String, enum: ['user', 'provider'], required: true },
//   phone: { type: String, default: '' },
//   address: { type: String, default: '' },
//   city: { type: String, default: '' },
//   state: { type: String, default: '' },
//   zipcode: { type: String, default: '' },
  
//   // For service providers
//   businessName: { type: String, default: '' },
//   serviceType: { type: String, default: '' },
//   services: [String],
  
//   // Pricing & Experience
//   pricePerHour: { type: Number, default: 500 },
//   maxPrice: { type: Number, default: 1500 },
//   yearsOfExperience: { type: Number, default: 5 },
//   responseTime: { type: String, default: '15 mins' },
//   completionRate: { type: Number, default: 98 },
  
//   // Profile Picture - Stored as Base64 in MongoDB
//   dp: { type: String, default: '' }, // Base64 string
//   dpMimeType: { type: String, default: 'image/jpeg' }, // image type
//   bio: { type: String, default: '' },
//   rating: { type: Number, default: 4.5, min: 0, max: 5 },
//   totalReviews: { type: Number, default: 0 },
//   languages: [String],
  
//   // Cancellation Policy
//   cancellationPolicy: {
//     hoursBeforeCancel: { type: Number, default: 2 },
//     allowRescheduling: { type: Boolean, default: true },
//     guaranteeType: { type: String, default: '100% satisfaction guarantee' }
//   },
  
//   // Availability
//   isAvailable: { type: Boolean, default: true },
//   workingDays: [String],
//   workingHours: {
//     start: { type: String, default: '09:00 AM' },
//     end: { type: String, default: '06:00 PM' }
//   },
  
//   profileCompleted: { type: Boolean, default: false },
//   createdAt: { type: Date, default: Date.now },
//   updatedAt: { type: Date, default: Date.now }
// });

// const User = mongoose.model('User', userSchema);

// // ============ AUTH MIDDLEWARE ============
// const authMiddleware = async (req, res, next) => {
//   try {
//     const token = req.header('Authorization')?.replace('Bearer ', '');
//     if (!token) {
//       return res.status(401).json({ error: 'No token provided' });
//     }
    
//     const decoded = jwt.verify(token, JWT_SECRET);
//     const user = await User.findById(decoded.userId);
    
//     if (!user) {
//       return res.status(401).json({ error: 'User not found' });
//     }
    
//     req.user = user;
//     req.token = token;
//     next();
//   } catch (error) {
//     res.status(401).json({ error: 'Please authenticate', details: error.message });
//   }
// };

// const bookingsRouter = require('./routes/Bookings');
// const paymentRoutes = require("./routes/paymentRoutes");

// // ============ ROUTES ============
// app.use("/api/payment", paymentRoutes);
// app.use("/api/providers", require("./routes/Providers"));
// app.use('/api/bookings', bookingsRouter);

// // ============ AUTH ROUTES ============

// // Register
// app.post('/api/auth/register', async (req, res) => {
//   try {
//     let { name, email, password, role, phone, address, businessName, serviceType } = req.body;
    
//     if (role === 'service_provider') role = 'provider';
//     if (!name && businessName) name = businessName;

//     if (!name || !email || !password || !role) {
//       return res.status(400).json({ error: 'Missing required fields' });
//     }

//     const emailRegex = /^\S+@\S+\.\S+$/;
//     if (!emailRegex.test(email)) {
//       return res.status(400).json({ error: 'Invalid email format' });
//     }

//     if (password.length < 6) {
//       return res.status(400).json({ error: 'Password must be at least 6 characters' });
//     }

//     const existingUser = await User.findOne({ email: email.toLowerCase() });
//     if (existingUser) {
//       return res.status(400).json({ error: 'Email already registered' });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);

//     const userData = {
//       name,
//       email: email.toLowerCase(),
//       password: hashedPassword,
//       role,
//       phone: phone || '',
//       address: address || '',
//       profileCompleted: false
//     };

//     if (role === 'provider') {
//       userData.businessName = businessName || name;
//       userData.serviceType = serviceType || '';
//       userData.services = serviceType ? [serviceType] : [];
//     }

//     const user = new User(userData);
//     await user.save();

//     const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });

//     res.status(201).json({
//       token,
//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//         role: user.role,
//         businessName: user.businessName,
//         serviceType: user.serviceType,
//         profileCompleted: user.profileCompleted
//       }
//     });

//     console.log(`  User registered: ${user.email} (${user.role})`);
//   } catch (error) {
//     console.error('  Register error:', error);
//     res.status(400).json({ error: error.message });
//   }
// });

// // Login
// app.post('/api/auth/login', async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     if (!email || !password) {
//       return res.status(400).json({ error: 'Email and password required' });
//     }

//     const user = await User.findOne({ email: email.toLowerCase() });
//     if (!user) {
//       return res.status(401).json({ error: 'Invalid email or password' });
//     }

//     const isPasswordValid = await bcrypt.compare(password, user.password);
//     if (!isPasswordValid) {
//       return res.status(401).json({ error: 'Invalid email or password' });
//     }

//     const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });

//     // Convert DP to data URL for frontend
//     let dpDataUrl = '';
//     if (user.dp) {
//       dpDataUrl = `data:${user.dpMimeType || 'image/jpeg'};base64,${user.dp}`;
//     }

//     res.json({
//       token,
//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//         role: user.role,
//         businessName: user.businessName,
//         serviceType: user.serviceType,
//         phone: user.phone,
//         address: user.address,
//         city: user.city,
//         state: user.state,
//         zipcode: user.zipcode,
//         dp: dpDataUrl,
//         profileCompleted: user.profileCompleted
//       }
//     });

//     console.log(`  User logged in: ${user.email}`);
//   } catch (error) {
//     console.error('  Login error:', error);
//     res.status(400).json({ error: error.message });
//   }
// });

// // Get current user
// app.get('/api/auth/me', authMiddleware, async (req, res) => {
//   try {
//     // Convert DP to data URL
//     let dpDataUrl = '';
//     if (req.user.dp) {
//       dpDataUrl = `data:${req.user.dpMimeType || 'image/jpeg'};base64,${req.user.dp}`;
//     }

//     res.json({
//       user: {
//         id: req.user._id,
//         name: req.user.name,
//         email: req.user.email,
//         role: req.user.role,
//         businessName: req.user.businessName,
//         serviceType: req.user.serviceType,
//         phone: req.user.phone,
//         address: req.user.address,
//         city: req.user.city,
//         state: req.user.state,
//         zipcode: req.user.zipcode,
//         dp: dpDataUrl,
//         bio: req.user.bio,
//         services: req.user.services,
//         rating: req.user.rating,
//         totalReviews: req.user.totalReviews,
//         profileCompleted: req.user.profileCompleted
//       }
//     });
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// });

// // ============ PROFILE ENDPOINTS ============

// // Get user profile (for profile page)
// app.get('/api/user/profile', authMiddleware, async (req, res) => {
//   try {
//     console.log('📥 GET /api/user/profile - User:', req.user.email);
    
//     // Convert DP to data URL for frontend
//     let dpDataUrl = '';
//     if (req.user.dp) {
//       dpDataUrl = `data:${req.user.dpMimeType || 'image/jpeg'};base64,${req.user.dp}`;
//     }

//     res.json({
//       user: {
//         id: req.user._id,
//         name: req.user.name,
//         email: req.user.email,
//         phone: req.user.phone,
//         address: req.user.address,
//         city: req.user.city,
//         state: req.user.state,
//         zipcode: req.user.zipcode,
//         bio: req.user.bio,
//         dp: dpDataUrl,
//         role: req.user.role,
//         createdAt: req.user.createdAt,
//         profileCompleted: req.user.profileCompleted
//       }
//     });

//     console.log('  Profile data sent');
//   } catch (error) {
//     console.error('  Error fetching profile:', error);
//     res.status(400).json({ error: error.message });
//   }
// });

// // Update user profile with image upload (stores image in MongoDB as Base64)
// app.put('/api/user/profile', authMiddleware, upload.single('profileImage'), async (req, res) => {
//   try {
//     const { phone, address, city, state, zipcode, bio } = req.body;

//     console.log('  PUT /api/user/profile - User:', req.user.email);

//     // Validate required fields
//     if (!phone || !address || !city || !state || !zipcode || !bio) {
//       return res.status(400).json({ error: 'All fields are required' });
//     }

//     // Validate bio length
//     if (bio.trim().length < 10) {
//       return res.status(400).json({ error: 'Bio must be at least 10 characters' });
//     }

//     // Validate zipcode
//     if (!/^[0-9]{5,}$/.test(zipcode.replace(/\s/g, ''))) {
//       return res.status(400).json({ error: 'Invalid zipcode format' });
//     }

//     // Validate phone
//     if (!/^[0-9+\-\s()]{10,}$/.test(phone)) {
//       return res.status(400).json({ error: 'Invalid phone number' });
//     }

//     // Handle profile image - Convert to Base64 and store in MongoDB
//     let dpBase64 = req.user.dp; // Keep existing image if no new upload
//     let dpMimeType = req.user.dpMimeType || 'image/jpeg';

//     if (req.file) {
//       console.log('   📸 Processing image...');
      
//       // Convert file buffer to Base64 string
//       dpBase64 = req.file.buffer.toString('base64');
//       dpMimeType = req.file.mimetype;
      
//       console.log(`   Image type: ${dpMimeType}`);
//       console.log(`   Image size: ${(req.file.buffer.length / 1024).toFixed(2)} KB`);
//     }

//     // Update user in MongoDB
//     const updatedUser = await User.findByIdAndUpdate(
//       req.user._id,
//       {
//         phone,
//         address,
//         city,
//         state,
//         zipcode,
//         bio,
//         dp: dpBase64,           // Base64 string stored in MongoDB
//         dpMimeType: dpMimeType, // Image type
//         profileCompleted: true,
//         updatedAt: Date.now()
//       },
//       { new: true }
//     ).select('-password');

//     // Convert DP to data URL for frontend
//     let dpDataUrl = '';
//     if (updatedUser.dp) {
//       dpDataUrl = `data:${updatedUser.dpMimeType};base64,${updatedUser.dp}`;
//     }

//     res.json({
//       message: 'Profile updated successfully',
//       user: {
//         id: updatedUser._id,
//         name: updatedUser.name,
//         email: updatedUser.email,
//         phone: updatedUser.phone,
//         address: updatedUser.address,
//         city: updatedUser.city,
//         state: updatedUser.state,
//         zipcode: updatedUser.zipcode,
//         bio: updatedUser.bio,
//         dp: dpDataUrl, // Return as data URL
//         role: updatedUser.role,
//         profileCompleted: updatedUser.profileCompleted
//       }
//     });

//     console.log(`  Profile updated: ${updatedUser.email}`);
//   } catch (error) {
//     console.error('  Profile update error:', error);
//     res.status(400).json({ error: error.message });
//   }
// });

// // Update profile (old endpoint - kept for backward compatibility)
// app.put('/api/auth/profile', authMiddleware, async (req, res) => {
//   try {
//     const { name, phone, address, businessName, serviceType, bio, dp } = req.body;
    
//     const updatedUser = await User.findByIdAndUpdate(
//       req.user._id,
//       {
//         name: name || req.user.name,
//         phone: phone !== undefined ? phone : req.user.phone,
//         address: address !== undefined ? address : req.user.address,
//         businessName: businessName !== undefined ? businessName : req.user.businessName,
//         serviceType: serviceType !== undefined ? serviceType : req.user.serviceType,
//         bio: bio !== undefined ? bio : req.user.bio,
//         dp: dp !== undefined ? dp : req.user.dp,
//         updatedAt: Date.now()
//       },
//       { new: true }
//     ).select('-password');

//     res.json({ user: updatedUser });
//     console.log(`  Profile updated: ${updatedUser.email}`);
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// });

// // Change password
// app.post('/api/auth/change-password', authMiddleware, async (req, res) => {
//   try {
//     const { currentPassword, newPassword } = req.body;

//     if (!currentPassword || !newPassword) {
//       return res.status(400).json({ error: 'Current and new password required' });
//     }

//     if (newPassword.length < 6) {
//       return res.status(400).json({ error: 'New password must be at least 6 characters' });
//     }

//     const isPasswordValid = await bcrypt.compare(currentPassword, req.user.password);
//     if (!isPasswordValid) {
//       return res.status(401).json({ error: 'Current password is incorrect' });
//     }

//     const hashedPassword = await bcrypt.hash(newPassword, 10);
//     await User.findByIdAndUpdate(req.user._id, { password: hashedPassword });

//     res.json({ message: 'Password changed successfully' });
//     console.log(`  Password changed: ${req.user.email}`);
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// });

// // Get all service providers
// app.get('/api/service-providers', async (req, res) => {
//   try {
//     const providers = await User.find({ role: 'provider' }).select('-password').lean();
    
//     // Convert DPs to data URLs
//     const providersWithDp = providers.map(provider => ({
//       ...provider,
//       dp: provider.dp ? `data:${provider.dpMimeType || 'image/jpeg'};base64,${provider.dp}` : ''
//     }));
    
//     res.json(providersWithDp);
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// });

// // Get single provider
// app.get('/api/service-providers/:id', async (req, res) => {
//   try {
//     const provider = await User.findById(req.params.id).select('-password');
    
//     if (!provider || provider.role !== 'provider') {
//       return res.status(404).json({ error: 'Provider not found' });
//     }
    
//     // Convert DP to data URL
//     if (provider.dp) {
//       provider.dp = `data:${provider.dpMimeType || 'image/jpeg'};base64,${provider.dp}`;
//     }
    
//     res.json(provider);
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// });

// // Health check
// app.get('/api/health', (req, res) => {
//   res.json({ status: 'Server is running', environment: NODE_ENV });
// });

// // 404 handler
// app.use((req, res) => {
//   res.status(404).json({ error: 'Route not found' });
// });

// // ============ ERROR HANDLER ============
// app.use((error, req, res, next) => {
//   console.error('  Error:', error);
//   if (error instanceof multer.MulterError) {
//     return res.status(400).json({ error: 'File upload error: ' + error.message });
//   }
//   res.status(500).json({ error: error.message || 'Internal server error' });
// });

// // ============ START SERVER ============
// // app.listen(PORT, () => {
// //   console.log('\n🚀 QuickTask Server Started');
// //   console.log(`   🔗 http://localhost:${PORT}`);
// //   console.log(`   📡 API: http://localhost:${PORT}/api`);
// //   console.log(`   🏥 Health: http://localhost:${PORT}/api/health`);
// //   console.log(`   💾 Profile pictures stored in MongoDB\n`);
// // });

// module.exports = app; // Export app for testing or serverless deployment

















// backend/server.js

// Load env vars (only used locally; Vercel uses dashboard envs)
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');

const app = express();

/* =========================
   BASIC MIDDLEWARE
========================= */
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

/* =========================
   CONFIGURATION
========================= */
const NODE_ENV = process.env.NODE_ENV || 'production';
const MONGODB_URI = process.env.MONGODB_URI;
const JWT_SECRET = process.env.JWT_SECRET;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';

// Hard fail if critical envs missing (prevents silent crashes)
if (!MONGODB_URI) throw new Error('MONGODB_URI is not defined');
if (!JWT_SECRET) throw new Error('JWT_SECRET is not defined');

console.log('🔧 Configuration loaded');
console.log(`   Environment: ${NODE_ENV}`);
console.log(`   CORS Origin: ${CORS_ORIGIN}`);

/* =========================
   CORS
========================= */
app.use(
  cors({
    origin: CORS_ORIGIN,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  })
);

/* =========================
   DATABASE (Serverless-safe)
========================= */
let isConnected = false;

async function connectToDatabase() {
  if (isConnected) return;

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    isConnected = true;
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    throw err;
  }
}

// Connect once on cold start
connectToDatabase();

/* =========================
   MULTER (Memory Storage)
========================= */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    allowed.includes(file.mimetype)
      ? cb(null, true)
      : cb(new Error('Invalid image type'));
  },
});

/* =========================
   USER SCHEMA
========================= */
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'provider'], required: true },

  phone: String,
  address: String,
  city: String,
  state: String,
  zipcode: String,

  businessName: String,
  serviceType: String,
  services: [String],

  pricePerHour: { type: Number, default: 500 },
  maxPrice: { type: Number, default: 1500 },

  dp: String,
  dpMimeType: { type: String, default: 'image/jpeg' },
  bio: String,

  rating: { type: Number, default: 4.5 },
  totalReviews: { type: Number, default: 0 },

  profileCompleted: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const User = mongoose.model('User', userSchema);

/* =========================
   AUTH MIDDLEWARE
========================= */
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'No token provided' });

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) return res.status(401).json({ error: 'User not found' });

    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Authentication failed' });
  }
};

/* =========================
   ROUTES
========================= */
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role)
      return res.status(400).json({ error: 'Missing fields' });

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ error: 'Email already exists' });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashed,
      role,
    });

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
      expiresIn: '7d',
    });

    res.status(201).json({ token, user: { id: user._id, email } });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
      expiresIn: '7d',
    });

    res.json({ token });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/user/profile', authMiddleware, async (req, res) => {
  res.json({ user: req.user });
});

app.put(
  '/api/user/profile',
  authMiddleware,
  upload.single('profileImage'),
  async (req, res) => {
    try {
      const update = { ...req.body, updatedAt: Date.now() };

      if (req.file) {
        update.dp = req.file.buffer.toString('base64');
        update.dpMimeType = req.file.mimetype;
      }

      const user = await User.findByIdAndUpdate(req.user._id, update, {
        new: true,
      }).select('-password');

      res.json({ user });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
);

/* =========================
   HEALTH CHECK
========================= */
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', environment: NODE_ENV });
});

/* =========================
   ERROR HANDLER
========================= */
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal Server Error' });
});

/* =========================
   EXPORT (NO app.listen!)
========================= */
module.exports = app;