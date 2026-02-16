import phoneVerificationService from '../services/phoneVerificationService.js';

export const initiatePhoneVerification = async (req, res, next) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ message: 'Phone number is required' });
    }

    const result = await phoneVerificationService.initiatePhoneVerification(phone);

    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const verifyPhoneNumber = async (req, res, next) => {
  try {
    const { phone, code } = req.body;

    if (!phone || !code) {
      return res.status(400).json({ message: 'Phone number and verification code are required' });
    }

    const result = await phoneVerificationService.verifyPhoneNumber(phone, code);

    if (!result.success) {
      return res.status(401).json({ message: result.message || 'Invalid verification code' });
    }

    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const resendVerificationCode = async (req, res, next) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ message: 'Phone number is required' });
    }

    const result = await phoneVerificationService.resendVerificationCode(phone);

    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};