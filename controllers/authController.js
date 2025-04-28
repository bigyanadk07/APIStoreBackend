const jwt = require('jsonwebtoken');
const config = require('../config/default');
const User = require('../models/User');
const otpService = require('../services/otpService');

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { user: { _id: user._id } },
    config.jwtSecret,
    { expiresIn: config.jwtExpiration }
  );
};

// Send verification code to user
exports.login = async (req, res) => {
  try {
    console.log("Full request body:", req.body);
    console.log("Request headers:", req.headers);
    
    const { phone } = req.body;
    console.log("Extracted phone:", phone);
    
    if (!phone) {
      return res.status(400).json({ message: 'Phone number is required' });
    }
    
    // Send verification code via Twilio Verify
    const codeSent = await otpService.sendVerificationCode(phone);
    
    if (!codeSent) {
      return res.status(500).json({ message: 'Failed to send verification code' });
    }
    
    return res.json({ success: true, message: 'Verification code sent successfully' });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Verify OTP and generate token
exports.verifyOTP = async (req, res) => {
  try {
    const { phone, code } = req.body;
    
    if (!phone || !code) {
      return res.status(400).json({ message: 'Phone number and verification code are required' });
    }
    
    // Verify code
    const isValid = await otpService.verifyCode(phone, code);
    
    if (!isValid) {
      return res.status(400).json({ message: 'Invalid or expired verification code' });
    }
    
    // Find or create user
    let user = await User.findOne({ phone });
    
    if (!user) {
      // First-time login, we'll create a minimal user
      // They'll need to complete registration later
      user = new User({ phone, name: 'User' });
      await user.save();
    }
    
    // Create JWT token
    const token = generateToken(user);
    
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone
      }
    });
  } catch (err) {
    console.error('Code verification error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Register or update user
exports.register = async (req, res) => {
  try {
    const { name, phone } = req.body;
    
    if (!name || !phone) {
      return res.status(400).json({ message: 'Name and phone number are required' });
    }
    
    // Check if user already exists
    const phoneExists = await User.findOne({ phone });
    
    let user;
    if (phoneExists) {
      // Update existing user
      user = phoneExists;
      user.name = name;
      await user.save();
    } else {
      // Create new user
      user = new User({ name, phone });
      await user.save();
    }
    
    // Create JWT token
    const token = generateToken(user);
    
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone
      }
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get current user profile
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({
      id: user._id,
      name: user.name,
      phone: user.phone
    });
  } catch (err) {
    console.error('Get user error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};