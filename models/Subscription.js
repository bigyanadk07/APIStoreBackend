// models/Subscription.js
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const SubscriptionSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: uuidv4
  },
  userId: {
    type: String,
    ref: 'User',
    required: true
  },
  packageId: {
    type: String,
    ref: 'Package',
    required: true
  },
  status: {
    type: String,
    required: true,
    enum: ['active', 'canceled', 'expired', 'past_due'],
    default: 'active'
  },
  currentPeriodStart: {
    type: Date,
    required: true
  },
  currentPeriodEnd: {
    type: Date,
    required: true
  },
  paymentDetails: {
    type: Object
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Subscription', SubscriptionSchema);