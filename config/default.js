// config/default.js
module.exports = {
  port: process.env.PORT || 5000,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiration: '30d',
  otpExpiration: 300, // 5 minutes in seconds
  twilioService: {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    verifyServiceId: process.env.TWILIO_VERIFY_SERVICE_SID
  },
  // other configuration settings...
}