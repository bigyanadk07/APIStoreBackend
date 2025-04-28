// models/ApiKey.js
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const ApiKeySchema = new mongoose.Schema({
  _id: {
    type: String,
    default: uuidv4
  },
  userId: {
    type: String,
    ref: 'User',
    required: true
  },
  apiId: {
    type: String,
    ref: 'Api',
    required: true
  },
  key: {
    type: String,
    required: true,
    unique: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('ApiKey', ApiKeySchema);