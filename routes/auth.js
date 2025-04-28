const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');
const { publicRateLimiter } = require('../middleware/rateLimiter');

// POST /auth/login - Send OTP for login
router.post('/login', publicRateLimiter, authController.login);

// POST /auth/verify-otp - Verify OTP and generate token
router.post('/verify-otp', publicRateLimiter, authController.verifyOTP);

// POST /auth/register - Register new user
router.post('/register', publicRateLimiter, authController.register);

// GET /auth/me - Get current user
router.get('/me', auth, authController.getCurrentUser);

module.exports = router;