// utils/apiKeyGenerator.js
const crypto = require('crypto');

// Generate a secure API key
exports.generateApiKey = () => {
  const prefix = 'api_';
  const key = crypto.randomBytes(24).toString('hex');
  return `${prefix}${key}`;
};

// Validate API key format
exports.validateApiKey = (key) => {
  const pattern = /^api_[a-f0-9]{48}$/;
  return pattern.test(key);
};