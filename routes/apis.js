// routes/apis.js
const express = require('express');
const router = express.Router();
const apiController = require('../controllers/apiController');
const auth = require('../middleware/auth');
const { publicRateLimiter } = require('../middleware/rateLimiter');

// GET /apis - Get all APIs
router.get('/', publicRateLimiter, apiController.getAllApis);

// GET /apis/keys - Get user's API keys
router.get('/keys', auth, apiController.getUserApiKeys);

// GET /apis/:id - Get API by ID
router.get('/:id', publicRateLimiter, apiController.getApiById);


// POST /apis/keys - Generate a new API key
router.post('/keys', auth, apiController.generateApiKey);

// DELETE /apis/keys/:keyId - Revoke an API key
router.delete('/keys/:keyId', auth, apiController.revokeApiKey);

module.exports = router;