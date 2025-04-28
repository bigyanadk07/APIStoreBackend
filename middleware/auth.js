// middleware/auth.js
const jwt = require('jsonwebtoken');
const config = require('../config/default');
const User = require('../models/User');

module.exports = async function(req, res, next) {
  // Get token from header
  const token = req.header('Authorization')?.replace('Bearer ', '');

  // Check if no token
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, config.jwtSecret);
    
    // Get user from token
    const user = await User.findById(decoded.user._id);
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid user' });
    }
    
    // Only include fields that exist in the user model
    req.user = {
      _id: user._id,
      name: user.name,
      phone: user.phone
      // If you add email to your User model later, uncomment this:
      // email: user.email
    };
    
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    res.status(401).json({ message: 'Token is not valid' });
  }
};