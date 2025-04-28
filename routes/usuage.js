// routes/usage.js
const express = require('express');
const router = express.Router();
const usageController = require('../controllers/usageController');
const auth = require('../middleware/auth');

// GET /usage/stats - Get usage statistics
router.get('/stats', auth, usageController.getUsageStats);

module.exports = router;