// middleware/rateLimiter.js
const rateLimit = require('express-rate-limit');
const ApiKey = require('../models/ApiKey');
const Api = require('../models/Api');
const ApiUsage = require('../models/ApiUsuage');

// Rate limiter middleware for API endpoints
const apiRateLimiter = async (req, res, next) => {
  const apiKey = req.header('X-API-Key');
  
  if (!apiKey) {
    return res.status(401).json({ message: 'API key is required' });
  }
  
  try {
    // Find the API key in the database
    const apiKeyDoc = await ApiKey.findOne({ key: apiKey, isActive: true });
    
    if (!apiKeyDoc) {
      return res.status(401).json({ message: 'Invalid or inactive API key' });
    }
    
    // Get the API details to check usage limits
    const api = await Api.findById(apiKeyDoc.apiId);
    
    if (!api) {
      return res.status(404).json({ message: 'API not found' });
    }
    
    // Count the current usage for the current month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const usage = await ApiUsage.countDocuments({
      apiKeyId: apiKeyDoc._id,
      timestamp: { $gte: startOfMonth }
    });
    
    // Check if usage exceeds the limit
    if (usage >= api.usageLimit) {
      return res.status(429).json({ message: 'API usage limit exceeded' });
    }
    
    // Store the API key info for later logging
    req.apiKeyInfo = {
      apiKeyId: apiKeyDoc._id,
      apiId: api._id,
      endpoint: req.originalUrl
    };
    
    next();
  } catch (err) {
    console.error('Rate limiter error:', err);
    res.status(500).json({ message: 'Server error during rate limiting' });
  }
};

// General rate limiter for public endpoints
const publicRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { message: 'Too many requests from this IP, please try again later' }
});

module.exports = {
  apiRateLimiter,
  publicRateLimiter
};