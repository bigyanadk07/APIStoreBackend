// services/otpService.js
const twilio = require('twilio');
const config = require('../config/default');

// Twilio client configuration
let twilioClient;
if (config.twilioService.accountSid && config.twilioService.authToken) {
  twilioClient = twilio(
    config.twilioService.accountSid,
    config.twilioService.authToken
  );
} else {
  console.warn('Twilio credentials not found. Verification functionality will not work.');
  // Create a mock client or set to null
  twilioClient = null;
}

// Send verification code via Twilio Verify
exports.sendVerificationCode = async (phone) => {
  try {
    if (!twilioClient) {
      throw new Error('Twilio client not configured');
    }
    
    const verification = await twilioClient.verify.v2
      .services(config.twilioService.verifyServiceId)
      .verifications
      .create({ to: phone, channel: 'sms' });
    
    return verification.status === 'pending';
  } catch (err) {
    console.error("Verification sending error:", err);
    return false;
  }
};

// Check verification code
exports.verifyCode = async (phone, code) => {
  try {
    if (!twilioClient) {
      throw new Error('Twilio client not configured');
    }
    
    const verificationCheck = await twilioClient.verify.v2
      .services(config.twilioService.verifyServiceId)
      .verificationChecks
      .create({ to: phone, code });
    
    return verificationCheck.status === 'approved';
  } catch (err) {
    console.error("Verification check error:", err);
    return false;
  }
};