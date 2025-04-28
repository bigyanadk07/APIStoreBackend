// controllers/usageController.js
const ApiUsage = require('../models/ApiUsuage');
const ApiKey = require('../models/ApiKey');
const Api = require('../models/Api');

// Track API usage (for middleware to call)
exports.trackApiUsage = async (apiKeyInfo, responseTime, statusCode) => {
  try {
    const { apiKeyId, endpoint } = apiKeyInfo;
    
    const apiUsage = new ApiUsage({
      apiKeyId,
      endpoint,
      responseTime,
      statusCode
    });
    
    await apiUsage.save();
    return true;
  } catch (err) {
    console.error('Track API usage error:', err);
    return false;
  }
};

// Get usage statistics
exports.getUsageStats = async (req, res) => {
  try {
    const { apiId, from, to } = req.query;
    
    if (!from || !to) {
      return res.status(400).json({ message: 'From and to dates are required' });
    }
    
    const fromDate = new Date(from);
    const toDate = new Date(to);
    
    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
      return res.status(400).json({ message: 'Invalid date format' });
    }
    
    // Find the user's API keys
    let apiKeyQuery = { userId: req.user._id };
    
    if (apiId) {
      apiKeyQuery.apiId = apiId;
    }
    
    const apiKeys = await ApiKey.find(apiKeyQuery);
    const apiKeyIds = apiKeys.map(key => key._id);
    
    // Get usage data
    const usageQuery = {
      apiKeyId: { $in: apiKeyIds },
      timestamp: { $gte: fromDate, $lte: toDate }
    };
    
    const usageData = await ApiUsage.find(usageQuery).sort({ timestamp: 1 });
    
    // Get total count and breakdown by date
    const total = usageData.length;
    
    // Create a map of dates to counts
    const dateMap = new Map();
    
    usageData.forEach(usage => {
      const date = usage.timestamp.toISOString().split('T')[0];
      dateMap.set(date, (dateMap.get(date) || 0) + 1);
    });
    
    // Convert map to array
    const breakdown = Array.from(dateMap.entries()).map(([date, count]) => ({
      date,
      count
    }));
    
    // Get the user's subscription limit
    let limit = 0;
    
    if (apiId) {
      const api = await Api.findById(apiId);
      limit = api ? api.usageLimit : 0;
    } else {
      // If no specific API is queried, sum up limits for all APIs the user has access to
      const apis = await Api.find({ _id: { $in: apiKeys.map(key => key.apiId) } });
      limit = apis.reduce((sum, api) => sum + api.usageLimit, 0);
    }
    
    res.json({
      total,
      limit,
      breakdown,
      period: {
        from: fromDate,
        to: toDate
      }
    });
  } catch (err) {
    console.error('Get usage stats error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};