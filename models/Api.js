// models/Api.js
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const ApiSchema = new mongoose.Schema({
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
  category: {
    type: String,
    required: true
  },
  endpoint: {
    type: String,
    required: true
  },
  usageLimit: {
    type: Number,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Api', ApiSchema);