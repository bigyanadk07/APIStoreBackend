// models/Package.js
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const PackageSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: uuidv4
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  price: {
    type: Number,
    required: true
  },
  billingCycle: {
    type: String,
    required: true,
    enum: ['monthly', 'quarterly', 'yearly']
  },
  features: {
    type: [String]
  },
  isPopular: {
    type: Boolean,
    default: false
  },
  apis: [{
    type: String,
    ref: 'Api'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Package', PackageSchema);