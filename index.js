// server.js
require('dotenv').config();
const app = require('./app');
const config = require('./config/default');
const connectDB = require('./config/db');
const { checkAndRenewSubscriptions } = require('./services/paymentService');

// Connect to database
connectDB();

// Set up subscription renewal job
const startSubscriptionRenewalJob = () => {
  // Run once at startup
  checkAndRenewSubscriptions();
  
  // Then run daily
  setInterval(() => {w
    checkAndRenewSubscriptions();
  }, 24 * 60 * 60 * 1000); // 24 hours
};

// Start subscription renewal job
startSubscriptionRenewalJob();

// Start server
const PORT = config.port;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});