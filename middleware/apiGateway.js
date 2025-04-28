// middleware/apiGateway.js
const { apiRateLimiter } = require('./rateLimiter');
const usageController = require('../controllers/usageController');

// API Gateway middleware to handle API requests
const apiGateway = async (req, res, next) => {
  // Start measuring response time
  const startTime = Date.now();
  
  // Apply rate limiting
  apiRateLimiter(req, res, async (err) => {
    if (err) return next(err);
    
    // Store the original end function
    const originalEnd = res.end;
    
    // Override the end function to track usage
    res.end = function(...args) {
      // Calculate response time
      const responseTime = Date.now() - startTime;
      
      // Track API usage asynchronously
      usageController.trackApiUsage(
        req.apiKeyInfo,
        responseTime,
        res.statusCode
      ).catch(err => {
        console.error('Error tracking API usage:', err);
      });
      
      // Call the original end function
      originalEnd.apply(this, args);
    };
    
    next();
  });
};

module.exports = apiGateway;