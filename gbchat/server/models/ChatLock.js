import mongoose from 'mongoose';

const chatLockSchema = new mongoose.Schema({
  chatId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chat',
    required: true,
    unique: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isLocked: {
    type: Boolean,
    default: false
  },
  pinHash: {
    type: String,
    select: false // Don't return hash by default
  },
  biometricEnabled: {
    type: Boolean,
    default: false
  },
  lockType: {
    type: String,
    enum: ['pin', 'biometric', 'both'],
    default: 'pin'
  },
  autoLockTimeout: {
    type: Number,
    default: 300000, // 5 minutes in milliseconds
    enum: [60000, 300000, 600000, 1800000] // 1min, 5min, 10min, 30min
  },
  lastUnlockedAt: {
    type: Date
  },
  failedAttempts: {
    type: Number,
    default: 0
  },
  lockedUntil: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for quick lookups
chatLockSchema.index({ chatId: 1, userId: 1 });

// Method to check if chat is currently locked
chatLockSchema.methods.isCurrentlyLocked = function() {
  if (!this.isLocked) return false;
  
  // Check if locked due to failed attempts
  if (this.lockedUntil && new Date() < this.lockedUntil) {
    return true;
  }
  
  // Check auto-lock timeout
  if (this.lastUnlockedAt) {
    const timeSinceUnlock = Date.now() - this.lastUnlockedAt.getTime();
    if (timeSinceUnlock > this.autoLockTimeout) {
      return true;
    }
  }
  
  return false;
};

// Method to record successful unlock
chatLockSchema.methods.recordUnlock = function() {
  this.lastUnlockedAt = new Date();
  this.failedAttempts = 0;
  this.lockedUntil = null;
  return this.save();
};

// Method to record failed attempt
chatLockSchema.methods.recordFailedAttempt = function() {
  this.failedAttempts += 1;
  
  // Lock for 5 minutes after 5 failed attempts
  if (this.failedAttempts >= 5) {
    this.lockedUntil = new Date(Date.now() + 300000); // 5 minutes
    this.failedAttempts = 0;
  }
  
  return this.save();
};

const ChatLock = mongoose.model('ChatLock', chatLockSchema);

export default ChatLock;
