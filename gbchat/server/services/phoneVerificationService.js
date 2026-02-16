import crypto from 'crypto';
import User from '../models/User.js';

// Generate a random 6-digit verification code
const generateVerificationCode = () => {
  return crypto.randomInt(100000, 999999).toString();
};

// Send SMS verification (placeholder - in production, use a service like Twilio)
const sendSMS = async (phoneNumber, message) => {
  // In a real implementation, you would use an SMS service like Twilio
  console.log(`SMS sent to ${phoneNumber}: ${message}`);
  
  // For development/testing purposes, we'll just log the code
  // In production, replace this with actual SMS service integration
  return true;
};

// Initiate phone verification
export const initiatePhoneVerification = async (phoneNumber) => {
  try {
    // Validate phone number format (basic validation)
    if (!isValidPhoneNumber(phoneNumber)) {
      throw new Error('Invalid phone number format');
    }

    // Check if phone number is already registered
    const existingUser = await User.findOne({ phone: phoneNumber });
    if (existingUser) {
      throw new Error('Phone number already registered');
    }

    // Generate verification code
    const verificationCode = generateVerificationCode();
    const expiryTime = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

    // In a real implementation, you would store the code in a temporary storage
    // For now, we'll temporarily store it in the user document (not ideal for production)
    // A better approach would be to use Redis or a separate verification table
    
    // Create a temporary user record if not exists, or update existing
    let user = await User.findOne({ phone: phoneNumber });
    if (!user) {
      user = new User({ phone: phoneNumber });
    }
    
    user.otp = {
      code: verificationCode,
      expiresAt: expiryTime
    };
    
    await user.save();

    // Send SMS with verification code
    const message = `Your GBChat verification code is: ${verificationCode}. Valid for 10 minutes.`;
    await sendSMS(phoneNumber, message);

    return { success: true, message: 'Verification code sent to your phone' };
  } catch (error) {
    throw error;
  }
};

// Verify phone number with code
export const verifyPhoneNumber = async (phoneNumber, code) => {
  try {
    if (!isValidPhoneNumber(phoneNumber)) {
      throw new Error('Invalid phone number format');
    }

    if (!code || code.length !== 6) {
      throw new Error('Invalid verification code');
    }

    // Find user with the phone number and matching code
    const user = await User.findOne({ 
      phone: phoneNumber,
      'otp.code': code 
    });

    if (!user) {
      throw new Error('Invalid verification code');
    }

    // Check if code has expired
    if (user.otp.expiresAt < new Date()) {
      throw new Error('Verification code has expired');
    }

    // Clear the OTP
    user.otp = undefined;
    user.isVerified = true; // Mark phone as verified
    
    return { success: true, user };
  } catch (error) {
    throw error;
  }
};

// Helper function to validate phone number format
const isValidPhoneNumber = (phoneNumber) => {
  // Basic phone number validation - adjust as needed for your requirements
  // This accepts various international formats
  const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
  return phoneRegex.test(phoneNumber);
};

// Resend verification code
export const resendVerificationCode = async (phoneNumber) => {
  try {
    if (!isValidPhoneNumber(phoneNumber)) {
      throw new Error('Invalid phone number format');
    }

    const user = await User.findOne({ phone: phoneNumber });
    if (!user) {
      throw new Error('Phone number not found');
    }

    // Generate new verification code
    const verificationCode = generateVerificationCode();
    const expiryTime = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

    user.otp = {
      code: verificationCode,
      expiresAt: expiryTime
    };
    
    await user.save();

    // Send SMS with verification code
    const message = `Your GBChat verification code is: ${verificationCode}. Valid for 10 minutes.`;
    await sendSMS(phoneNumber, message);

    return { success: true, message: 'New verification code sent to your phone' };
  } catch (error) {
    throw error;
  }
};

export default {
  initiatePhoneVerification,
  verifyPhoneNumber,
  resendVerificationCode
};