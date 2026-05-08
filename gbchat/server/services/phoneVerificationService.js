import crypto from 'crypto';
import User from '../models/User.js';
import twilio from 'twilio';

// Initialize Twilio client
const twilioClient = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

// Generate a random 6-digit verification code
const generateVerificationCode = () => {
  return crypto.randomInt(100000, 999999).toString();
};

// Send SMS verification
const sendSMS = async (phoneNumber, message) => {
  try {
    console.log(`[SMS Service] Sending to ${phoneNumber}: ${message}`);
    
    if (twilioClient && process.env.TWILIO_PHONE_NUMBER) {
      await twilioClient.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phoneNumber
      });
      console.log(`✅ SMS successfully sent via Twilio to ${phoneNumber}`);
      return true;
    } else {
      console.warn('⚠️ Twilio not configured. Code only logged to console.');
      return true; // Return true so the flow continues in dev
    }
  } catch (error) {
    console.error('❌ Twilio SMS Error:', error.message);
    // In production, you might want to throw this error
    // throw new Error('Failed to send SMS. Please try again later.');
    return false;
  }
};

// Initiate phone verification
export const initiatePhoneVerification = async (phoneNumber) => {
  try {
    // Validate phone number format (basic validation)
    if (!isValidPhoneNumber(phoneNumber)) {
      throw new Error('Invalid phone number format');
    }

    // Generate verification code
    const verificationCode = generateVerificationCode();
    const expiryTime = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

    // Find user or create temporary record
    let user = await User.findOne({ phone: phoneNumber });
    if (!user) {
      // For registration flow, we might want to check if email is also provided later
      user = new User({ 
        phone: phoneNumber,
        fullName: 'New User', // Placeholder for temporary record
        email: `${phoneNumber}@temp.com`, // Placeholder for temporary record
        password: crypto.randomBytes(16).toString('hex'), // Temporary password
      });
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