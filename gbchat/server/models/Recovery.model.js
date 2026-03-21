import mongoose from 'mongoose';

const recoverySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  // Email Recovery
  emailRecovery: {
    enabled: { type: Boolean, default: false },
    email: { type: String, lowercase: true, trim: true },
    verified: { type: Boolean, default: false },
    verifiedAt: Date,
    isPrimary: { type: Boolean, default: true }
  },

  // Phone Recovery
  phoneRecovery: {
    enabled: { type: Boolean, default: false },
    phoneNumber: String,
    verified: { type: Boolean, default: false },
    verifiedAt: Date,
    isPrimary: { type: Boolean, default: false }
  },

  // Recovery Codes (backup codes)
  recoveryCodes: [{
    code: { type: String, unique: true },
    used: { type: Boolean, default: false },
    usedAt: Date,
    createdAt: { type: Date, default: Date.now },
    expiresAt: Date
  }],

  // Two-Factor Authentication
  twoFactorAuth: {
    enabled: { type: Boolean, default: false },
    method: { 
      type: String, 
      enum: ['email', 'sms', 'authenticator', 'whatsapp'], 
      default: 'email' 
    },
    secret: String, // For authenticator apps
    backupCodes: [String],
    whatsappNumber: String,
    trustedDevices: [{
      deviceId: String,
      deviceName: String,
      addedAt: Date,
      lastUsed: Date,
      expiresAt: Date
    }]
  },

  // Security Questions (optional fallback)
  securityQuestions: [{
    question: String,
    answer: String, // Store hashed answer
    order: Number
  }],

  // Account Recovery Tokens
  recoveryTokens: [{
    token: String,
    type: { 
      type: String, 
      enum: ['password_reset', 'email_change', 'phone_change', 'account_recovery'] 
    },
    createdAt: { type: Date, default: Date.now },
    expiresAt: Date,
    used: { type: Boolean, default: false },
    usedAt: Date,
    ipAddress: String,
    userAgent: String
  }],

  // Trusted Contacts (for social recovery)
  trustedContacts: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: String,
    email: String,
    phone: String,
    addedAt: Date,
    verified: { type: Boolean, default: false },
    canRecover: { type: Boolean, default: true }
  }],

  // Recovery History
  recoveryHistory: [{
    type: { 
      type: String, 
      enum: ['password_reset', 'email_change', 'phone_change', 'account_recovery', '2fa_reset'] 
    },
    method: String,
    success: Boolean,
    timestamp: { type: Date, default: Date.now },
    ipAddress: String,
    userAgent: String,
    details: mongoose.Schema.Types.Mixed
  }],

  // Account Lock/Protection
  accountProtection: {
    lockoutEnabled: { type: Boolean, default: true },
    failedAttempts: { type: Number, default: 0 },
    lockedUntil: Date,
    requireVerificationForSensitiveActions: { type: Boolean, default: true },
    notifyOnNewDevice: { type: Boolean, default: true },
    notifyOnPasswordChange: { type: Boolean, default: true }
  }

}, {
  timestamps: true
});

// Indexes
recoverySchema.index({ userId: 1 });
recoverySchema.index({ 'emailRecovery.email': 1 });
recoverySchema.index({ 'recoveryTokens.token': 1 });
recoverySchema.index({ 'recoveryCodes.code': 1 });

// Method to generate recovery codes
recoverySchema.methods.generateRecoveryCodes = async function(count = 10) {
  const codes = [];
  const crypto = await import('crypto');
  
  for (let i = 0; i < count; i++) {
    const code = crypto.randomBytes(4).toString('hex').toUpperCase();
    codes.push({
      code: code,
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
    });
  }
  
  this.recoveryCodes = codes;
  await this.save();
  
  return codes.map(c => c.code);
};

// Method to verify recovery code
recoverySchema.methods.verifyRecoveryCode = async function(code) {
  const codeDoc = this.recoveryCodes.find(
    c => c.code === code && !c.used && (!c.expiresAt || c.expiresAt > new Date())
  );
  
  if (!codeDoc) {
    return false;
  }
  
  codeDoc.used = true;
  codeDoc.usedAt = new Date();
  await this.save();
  
  return true;
};

// Method to create recovery token
recoverySchema.methods.createRecoveryToken = async function(type, expiresIn = 3600) {
  const crypto = await import('crypto');
  const token = crypto.randomBytes(32).toString('hex');
  
  this.recoveryTokens.push({
    token,
    type,
    expiresAt: new Date(Date.now() + expiresIn * 1000)
  });
  
  await this.save();
  
  return token;
};

// Method to verify recovery token
recoverySchema.methods.verifyRecoveryToken = async function(token, type) {
  const tokenDoc = this.recoveryTokens.find(
    t => t.token === token && 
         t.type === type && 
         !t.used && 
         t.expiresAt > new Date()
  );
  
  if (!tokenDoc) {
    return false;
  }
  
  tokenDoc.used = true;
  tokenDoc.usedAt = new Date();
  await this.save();
  
  return true;
};

// Method to add trusted contact
recoverySchema.methods.addTrustedContact = async function(contactData) {
  const existingContact = this.trustedContacts.find(
    c => c.userId?.toString() === contactData.userId?.toString()
  );
  
  if (existingContact) {
    throw new Error('Contact already added');
  }
  
  this.trustedContacts.push({
    ...contactData,
    addedAt: new Date()
  });
  
  await this.save();
  return this.trustedContacts;
};

// Method to remove trusted contact
recoverySchema.methods.removeTrustedContact = async function(contactId) {
  this.trustedContacts = this.trustedContacts.filter(
    c => c.userId?.toString() !== contactId.toString()
  );
  
  await this.save();
  return this.trustedContacts;
};

// Method to record recovery attempt
recoverySchema.methods.recordRecoveryAttempt = async function(attemptData) {
  this.recoveryHistory.push({
    ...attemptData,
    timestamp: new Date()
  });
  
  await this.save();
};

// Method to check if account is locked
recoverySchema.methods.isAccountLocked = function() {
  if (!this.accountProtection.lockoutEnabled) {
    return false;
  }
  
  if (this.accountProtection.lockedUntil && this.accountProtection.lockedUntil > new Date()) {
    return true;
  }
  
  return false;
};

// Method to record failed login attempt
recoverySchema.methods.recordFailedAttempt = async function() {
  this.accountProtection.failedAttempts += 1;
  
  // Lock account after 5 failed attempts
  if (this.accountProtection.failedAttempts >= 5) {
    this.accountProtection.lockedUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
  }
  
  await this.save();
};

// Method to reset failed attempts
recoverySchema.methods.resetFailedAttempts = async function() {
  this.accountProtection.failedAttempts = 0;
  this.accountProtection.lockedUntil = null;
  await this.save();
};

export default mongoose.model('Recovery', recoverySchema);
