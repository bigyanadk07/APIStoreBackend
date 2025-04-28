// models/ApiUsage.js
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const ApiUsageSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: uuidv4
  },
  apiKeyId: {
    type: String,
    ref: 'ApiKey',
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  endpoint: {
    type: String,
    required: true
  },
  responseTime: {
    type: Number
  },
  statusCode: {
    type: Number
  }
});

// Index for efficient usage analytics queries
ApiUsageSchema.index({ apiKeyId: 1, timestamp: 1 });

module.exports = mongoose.model('ApiUsage', ApiUsageSchema);