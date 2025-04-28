// routes/packages.js
const express = require('express');
const router = express.Router();
const packageController = require('../controllers/packageController');
const auth = require('../middleware/auth');
const { publicRateLimiter } = require('../middleware/rateLimiter');

// GET /packages - Get all packages
router.get('/', publicRateLimiter, packageController.getAllPackages);

// GET /packages/:id - Get package by ID
router.get('/:id', publicRateLimiter, packageController.getPackageById);

// POST /packages/subscribe - Subscribe to a package
router.post('/subscribe', auth, packageController.subscribeToPackage);

// GET /packages/user/subscriptions - Get user's subscriptions
router.get('/user/subscriptions', auth, packageController.getUserSubscriptions);

module.exports = router;    