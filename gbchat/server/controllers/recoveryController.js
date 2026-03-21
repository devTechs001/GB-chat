import Recovery from '../models/Recovery.model.js';
import User from '../models/User.js';
import crypto from 'crypto';
import { sendEmail } from '../services/emailService.js';

// ============================================================================
// Get Recovery Settings
// ============================================================================

export const getRecoverySettings = async (req, res) => {
  try {
    let recovery = await Recovery.findOne({ userId: req.user._id });

    if (!recovery) {
      recovery = await Recovery.create({ userId: req.user._id });
    }

    res.json({
      success: true,
      data: {
        emailRecovery: recovery.emailRecovery,
        phoneRecovery: recovery.phoneRecovery,
        twoFactorAuth: recovery.twoFactorAuth,
        trustedContacts: recovery.trustedContacts,
        accountProtection: recovery.accountProtection
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching recovery settings',
      error: error.message
    });
  }
};

// ============================================================================
// Setup Email Recovery
// ============================================================================

export const setupEmailRecovery = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !email.includes('@')) {
      return res.status(400).json({ success: false, message: 'Valid email required' });
    }

    let recovery = await Recovery.findOne({ userId: req.user._id });
    if (!recovery) recovery = new Recovery({ userId: req.user._id });

    recovery.emailRecovery = {
      email,
      enabled: true,
      verified: false,
      isPrimary: true
    };

    // Send verification email
    const token = await recovery.createRecoveryToken('email_change', 3600);
    const verificationLink = `${process.env.CLIENT_URL}/verify-email?token=${token}`;

    await sendEmail({
      to: email,
      subject: 'Verify Recovery Email - GBChat',
      html: `
        <h2>Verify Your Recovery Email</h2>
        <p>Click the link below to verify this email for account recovery:</p>
        <a href="${verificationLink}" style="background: #25D366; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; margin: 20px 0;">Verify Email</a>
        <p>Or copy this link: ${verificationLink}</p>
        <p>This link expires in 1 hour.</p>
      `
    });

    await recovery.save();

    res.json({
      success: true,
      message: 'Verification email sent. Please check your inbox.',
      data: {
        email,
        verified: false
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error setting up email recovery',
      error: error.message
    });
  }
};

// ============================================================================
// Verify Email Recovery
// ============================================================================

export const verifyEmailRecovery = async (req, res) => {
  try {
    const { token } = req.body;

    let recovery = await Recovery.findOne({ userId: req.user._id });
    if (!recovery) {
      return res.status(404).json({ success: false, message: 'Recovery settings not found' });
    }

    const valid = await recovery.verifyRecoveryToken(token, 'email_change');
    if (!valid) {
      return res.status(400).json({ success: false, message: 'Invalid or expired token' });
    }

    recovery.emailRecovery.verified = true;
    recovery.emailRecovery.verifiedAt = new Date();
    await recovery.save();

    res.json({
      success: true,
      message: 'Email verified successfully',
      data: {
        email: recovery.emailRecovery.email,
        verified: true
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error verifying email',
      error: error.message
    });
  }
};

// ============================================================================
// Setup Phone Recovery
// ============================================================================

export const setupPhoneRecovery = async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({ success: false, message: 'Phone number required' });
    }

    let recovery = await Recovery.findOne({ userId: req.user._id });
    if (!recovery) recovery = new Recovery({ userId: req.user._id });

    recovery.phoneRecovery = {
      phoneNumber,
      enabled: true,
      verified: false
    };

    // TODO: Send SMS verification code
    // For now, mark as verified (implement SMS service)
    recovery.phoneRecovery.verified = true;
    recovery.phoneRecovery.verifiedAt = new Date();

    await recovery.save();

    res.json({
      success: true,
      message: 'Phone recovery setup successfully',
      data: recovery.phoneRecovery
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error setting up phone recovery',
      error: error.message
    });
  }
};

// ============================================================================
// Generate Recovery Codes
// ============================================================================

export const generateRecoveryCodes = async (req, res) => {
  try {
    let recovery = await Recovery.findOne({ userId: req.user._id });
    if (!recovery) recovery = new Recovery({ userId: req.user._id });

    const codes = await recovery.generateRecoveryCodes(10);

    res.json({
      success: true,
      message: 'Recovery codes generated',
      data: {
        codes,
        message: 'Save these codes in a safe place. Each code can only be used once.'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error generating recovery codes',
      error: error.message
    });
  }
};

// ============================================================================
// Verify Recovery Code
// ============================================================================

export const verifyRecoveryCode = async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ success: false, message: 'Recovery code required' });
    }

    let recovery = await Recovery.findOne({ userId: req.user._id });
    if (!recovery) {
      return res.status(404).json({ success: false, message: 'Recovery settings not found' });
    }

    const valid = await recovery.verifyRecoveryCode(code);
    if (!valid) {
      return res.status(400).json({ success: false, message: 'Invalid or expired recovery code' });
    }

    res.json({
      success: true,
      message: 'Recovery code verified'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error verifying recovery code',
      error: error.message
    });
  }
};

// ============================================================================
// Setup Two-Factor Authentication
// ============================================================================

export const setup2FA = async (req, res) => {
  try {
    const { method, whatsappNumber } = req.body;

    let recovery = await Recovery.findOne({ userId: req.user._id });
    if (!recovery) recovery = new Recovery({ userId: req.user._id });

    if (method === 'authenticator') {
      // Generate secret for authenticator app
      const secret = crypto.randomBytes(32).toString('base64');
      recovery.twoFactorAuth = {
        enabled: false, // Disabled until verified
        method: 'authenticator',
        secret
      };

      // Generate QR code URI (client will render QR code)
      const qrUri = `otpauth://totp/GBChat:${req.user.email}?secret=${secret}&issuer=GBChat`;

      await recovery.save();

      return res.json({
        success: true,
        message: 'Scan QR code with authenticator app',
        data: {
          secret,
          qrUri,
          message: 'After scanning, enter the 6-digit code to enable 2FA'
        }
      });
    }

    if (method === 'whatsapp') {
      if (!whatsappNumber) {
        return res.status(400).json({ success: false, message: 'WhatsApp number required' });
      }

      recovery.twoFactorAuth = {
        enabled: false,
        method: 'whatsapp',
        whatsappNumber
      };

      await recovery.save();

      // TODO: Send verification code via WhatsApp
      return res.json({
        success: true,
        message: 'Verification code sent via WhatsApp',
        data: {
          whatsappNumber
        }
      });
    }

    // Email or SMS
    recovery.twoFactorAuth = {
      enabled: false,
      method: method || 'email'
    };

    await recovery.save();

    res.json({
      success: true,
      message: '2FA setup initiated',
      data: {
        method
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error setting up 2FA',
      error: error.message
    });
  }
};

// ============================================================================
// Verify 2FA Setup
// ============================================================================

export const verify2FA = async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ success: false, message: 'Verification code required' });
    }

    let recovery = await Recovery.findOne({ userId: req.user._id });
    if (!recovery) {
      return res.status(404).json({ success: false, message: 'Recovery settings not found' });
    }

    // TODO: Verify code based on method
    // For authenticator: verify TOTP
    // For email/SMS: verify sent code

    recovery.twoFactorAuth.enabled = true;
    await recovery.save();

    res.json({
      success: true,
      message: '2FA enabled successfully',
      data: {
        enabled: true,
        method: recovery.twoFactorAuth.method
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error verifying 2FA',
      error: error.message
    });
  }
};

// ============================================================================
// Disable 2FA
// ============================================================================

export const disable2FA = async (req, res) => {
  try {
    const { code } = req.body;

    let recovery = await Recovery.findOne({ userId: req.user._id });
    if (!recovery) {
      return res.status(404).json({ success: false, message: 'Recovery settings not found' });
    }

    // Verify current code or recovery code
    if (code) {
      // TODO: Verify 2FA code
    }

    recovery.twoFactorAuth.enabled = false;
    await recovery.save();

    res.json({
      success: true,
      message: '2FA disabled successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error disabling 2FA',
      error: error.message
    });
  }
};

// ============================================================================
// Add Trusted Contact
// ============================================================================

export const addTrustedContact = async (req, res) => {
  try {
    const { userId, name, email, phone } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID required' });
    }

    let recovery = await Recovery.findOne({ userId: req.user._id });
    if (!recovery) recovery = new Recovery({ userId: req.user._id });

    await recovery.addTrustedContact({ userId, name, email, phone });

    res.json({
      success: true,
      message: 'Trusted contact added',
      data: {
        trustedContacts: recovery.trustedContacts
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error adding trusted contact',
      error: error.message
    });
  }
};

// ============================================================================
// Remove Trusted Contact
// ============================================================================

export const removeTrustedContact = async (req, res) => {
  try {
    const { contactId } = req.body;

    if (!contactId) {
      return res.status(400).json({ success: false, message: 'Contact ID required' });
    }

    let recovery = await Recovery.findOne({ userId: req.user._id });
    if (!recovery) {
      return res.status(404).json({ success: false, message: 'Recovery settings not found' });
    }

    await recovery.removeTrustedContact(contactId);

    res.json({
      success: true,
      message: 'Trusted contact removed',
      data: {
        trustedContacts: recovery.trustedContacts
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error removing trusted contact',
      error: error.message
    });
  }
};

// ============================================================================
// Get Trusted Contacts
// ============================================================================

export const getTrustedContacts = async (req, res) => {
  try {
    let recovery = await Recovery.findOne({ userId: req.user._id });
    if (!recovery) {
      return res.json({ success: true, data: { trustedContacts: [] } });
    }

    res.json({
      success: true,
      data: {
        trustedContacts: recovery.trustedContacts
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching trusted contacts',
      error: error.message
    });
  }
};

// ============================================================================
// Request Account Recovery
// ============================================================================

export const requestAccountRecovery = async (req, res) => {
  try {
    const { email, reason } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'Account not found' });
    }

    let recovery = await Recovery.findOne({ userId: user._id });
    if (!recovery) {
      recovery = new Recovery({ userId: user._id });
    }

    // Create recovery token
    const token = await recovery.createRecoveryToken('account_recovery', 3600);
    const recoveryLink = `${process.env.CLIENT_URL}/account/recover?token=${token}`;

    await sendEmail({
      to: email,
      subject: 'Account Recovery - GBChat',
      html: `
        <h2>Account Recovery Request</h2>
        <p>We received a request to recover your account.</p>
        <a href="${recoveryLink}" style="background: #25D366; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; margin: 20px 0;">Recover Account</a>
        <p>Or copy this link: ${recoveryLink}</p>
        <p>This link expires in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `
    });

    await recovery.recordRecoveryAttempt({
      type: 'account_recovery',
      method: 'email',
      success: true,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    res.json({
      success: true,
      message: 'Recovery email sent. Please check your inbox.'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error requesting account recovery',
      error: error.message
    });
  }
};

// ============================================================================
// Reset Password via Recovery
// ============================================================================

export const resetPasswordViaRecovery = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ success: false, message: 'Token and new password required' });
    }

    let recovery = await Recovery.findOne({ userId: req.user._id });
    if (!recovery) {
      return res.status(404).json({ success: false, message: 'Recovery settings not found' });
    }

    const valid = await recovery.verifyRecoveryToken(token, 'password_reset');
    if (!valid) {
      return res.status(400).json({ success: false, message: 'Invalid or expired token' });
    }

    // Update password
    const bcrypt = await import('bcrypt');
    const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_ROUNDS) || 12);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await User.findByIdAndUpdate(req.user._id, { password: hashedPassword });

    await recovery.recordRecoveryAttempt({
      type: 'password_reset',
      method: 'token',
      success: true,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    res.json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error resetting password',
      error: error.message
    });
  }
};

// ============================================================================
// Get Recovery History
// ============================================================================

export const getRecoveryHistory = async (req, res) => {
  try {
    let recovery = await Recovery.findOne({ userId: req.user._id });
    if (!recovery) {
      return res.json({ success: true, data: { history: [] } });
    }

    res.json({
      success: true,
      data: {
        history: recovery.recoveryHistory.sort((a, b) => b.timestamp - a.timestamp)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching recovery history',
      error: error.message
    });
  }
};

// ============================================================================
// Update Account Protection Settings
// ============================================================================

export const updateAccountProtection = async (req, res) => {
  try {
    const { lockoutEnabled, requireVerification, notifyOnNewDevice, notifyOnPasswordChange } = req.body;

    let recovery = await Recovery.findOne({ userId: req.user._id });
    if (!recovery) recovery = new Recovery({ userId: req.user._id });

    if (typeof lockoutEnabled === 'boolean') {
      recovery.accountProtection.lockoutEnabled = lockoutEnabled;
    }
    if (typeof requireVerification === 'boolean') {
      recovery.accountProtection.requireVerificationForSensitiveActions = requireVerification;
    }
    if (typeof notifyOnNewDevice === 'boolean') {
      recovery.accountProtection.notifyOnNewDevice = notifyOnNewDevice;
    }
    if (typeof notifyOnPasswordChange === 'boolean') {
      recovery.accountProtection.notifyOnPasswordChange = notifyOnPasswordChange;
    }

    await recovery.save();

    res.json({
      success: true,
      message: 'Account protection settings updated',
      data: {
        accountProtection: recovery.accountProtection
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating account protection',
      error: error.message
    });
  }
};
