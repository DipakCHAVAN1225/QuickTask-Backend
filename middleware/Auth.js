

// // backend/middleware/Auth.js
// const jwt = require('jsonwebtoken');

// module.exports = function (req, res, next) {
//   try {
//     let token = null;

//     // Check standard headers
//     const authHeader = req.header('Authorization');
//     if (authHeader) {
//       token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
//     }

//     // Fallback: x-auth-token header
//     if (!token) {
//       token = req.header('x-auth-token');
//     }

//     if (!token) {
//       console.log('  No token provided');
//       return res.status(401).json({ message: 'Access denied. No token provided.' });
//     }

//     // Use the same JWT_SECRET from environment or default
//     const JWT_SECRET = process.env.JWT_SECRET || 'change-this-secret-key';
    
//     console.log(' Verifying token with JWT_SECRET:', JWT_SECRET.substring(0, 10) + '...');
    
//     const decoded = jwt.verify(token, JWT_SECRET);
    
//     console.log('  Token verified. Decoded:', decoded);
    
//     // Token contains userId, convert to id for consistency
//     req.user = {
//       id: decoded.userId,
//       userId: decoded.userId
//     };
    
//     next();
//   } catch (err) {
//     console.error('  Auth middleware error:', err.message);
//     return res.status(401).json({ 
//       message: 'Invalid or expired token.',
//       error: err.message 
//     });
//   }
// };










const jwt = require("jsonwebtoken");
const User = require("../models/user");

module.exports = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) return res.status(401).json({ error: "No token provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) return res.status(401).json({ error: "User not found" });

    req.user = user;
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
};