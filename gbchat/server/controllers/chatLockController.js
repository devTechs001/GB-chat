import ChatLock from '../models/ChatLock.js';
import Chat from '../models/Chat.js';
import bcrypt from 'bcryptjs';

// Lock a chat with PIN
export const lockChat = async (req, res) => {
  try {
    const { chatId, pin, biometricEnabled = false, lockType = 'pin', autoLockTimeout = 300000 } = req.body;
    const userId = req.user._id;

    if (!pin || pin.length < 4) {
      return res.status(400).json({ message: 'PIN must be at least 4 digits' });
    }

    // Check if chat exists
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    // Check if user is participant
    const isParticipant = chat.participants.some(p => 
      p.user.toString() === userId.toString() || p.user === userId
    );
    if (!isParticipant) {
      return res.status(403).json({ message: 'Not authorized to lock this chat' });
    }

    // Hash PIN
    const pinHash = await bcrypt.hash(pin, 12);

    // Create or update lock
    let chatLock = await ChatLock.findOne({ chatId, userId });
    
    if (chatLock) {
      chatLock.isLocked = true;
      chatLock.pinHash = pinHash;
      chatLock.biometricEnabled = biometricEnabled;
      chatLock.lockType = lockType;
      chatLock.autoLockTimeout = autoLockTimeout;
      chatLock.lastUnlockedAt = null;
      chatLock.failedAttempts = 0;
      chatLock.lockedUntil = null;
      await chatLock.save();
    } else {
      chatLock = await ChatLock.create({
        chatId,
        userId,
        isLocked: true,
        pinHash,
        biometricEnabled,
        lockType,
        autoLockTimeout,
        lastUnlockedAt: null,
        failedAttempts: 0,
        lockedUntil: null
      });
    }

    res.json({
      success: true,
      message: 'Chat locked successfully',
      chatLock: {
        chatId: chatLock.chatId,
        isLocked: chatLock.isLocked,
        lockType: chatLock.lockType,
        biometricEnabled: chatLock.biometricEnabled
      }
    });
  } catch (error) {
    console.error('ChatLock error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Unlock a chat with PIN
export const unlockChat = async (req, res) => {
  try {
    const { chatId, pin } = req.body;
    const userId = req.user._id;

    const chatLock = await ChatLock.findOne({ chatId, userId }).select('+pinHash');
    
    if (!chatLock) {
      return res.status(404).json({ message: 'Chat is not locked' });
    }

    // Check if temporarily locked due to failed attempts
    if (chatLock.lockedUntil && new Date() < chatLock.lockedUntil) {
      const minutesLeft = Math.ceil((chatLock.lockedUntil - Date.now()) / 60000);
      return res.status(423).json({ 
        message: `Too many failed attempts. Try again in ${minutesLeft} minutes` 
      });
    }

    // Verify PIN
    const isValid = await bcrypt.compare(pin, chatLock.pinHash);
    
    if (!isValid) {
      await chatLock.recordFailedAttempt();
      
      if (chatLock.lockedUntil) {
        return res.status(423).json({ 
          message: 'Too many failed attempts. Chat locked for 5 minutes' 
        });
      }
      
      return res.status(401).json({ 
        message: 'Incorrect PIN',
        attemptsRemaining: 5 - chatLock.failedAttempts
      });
    }

    // Successful unlock
    await chatLock.recordUnlock();

    res.json({
      success: true,
      message: 'Chat unlocked successfully',
      chatLock: {
        chatId: chatLock.chatId,
        isLocked: false,
        lastUnlockedAt: chatLock.lastUnlockedAt
      }
    });
  } catch (error) {
    console.error('ChatLock error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Toggle lock status
export const toggleLock = async (req, res) => {
  try {
    const { chatId, pin } = req.body;
    const userId = req.user._id;
    const { unlock } = req.query;

    const chatLock = await ChatLock.findOne({ chatId, userId }).select('+pinHash');
    
    if (!chatLock) {
      return res.status(404).json({ message: 'Chat lock not found' });
    }

    if (unlock === 'true') {
      // Unlock
      if (!pin) {
        return res.status(400).json({ message: 'PIN required' });
      }

      const isValid = await bcrypt.compare(pin, chatLock.pinHash);
      if (!isValid) {
        return res.status(401).json({ message: 'Incorrect PIN' });
      }

      chatLock.isLocked = false;
      await chatLock.save();
    } else {
      // Lock
      chatLock.isLocked = true;
      chatLock.lastUnlockedAt = null;
      await chatLock.save();
    }

    res.json({
      success: true,
      message: `Chat ${chatLock.isLocked ? 'locked' : 'unlocked'} successfully`,
      isLocked: chatLock.isLocked
    });
  } catch (error) {
    console.error('ChatLock error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get lock status for a chat
export const getLockStatus = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user._id;

    const chatLock = await ChatLock.findOne({ chatId, userId });
    
    if (!chatLock) {
      return res.json({
        success: true,
        isLocked: false,
        exists: false
      });
    }

    const isCurrentlyLocked = chatLock.isCurrentlyLocked();

    res.json({
      success: true,
      isLocked: isCurrentlyLocked,
      exists: true,
      lockType: chatLock.lockType,
      biometricEnabled: chatLock.biometricEnabled,
      autoLockTimeout: chatLock.autoLockTimeout,
      lastUnlockedAt: chatLock.lastUnlockedAt
    });
  } catch (error) {
    console.error('ChatLock error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all locked chats for user
export const getLockedChats = async (req, res) => {
  try {
    const userId = req.user._id;

    const chatLocks = await ChatLock.find({ userId, isLocked: true })
      .populate('chatId', 'name avatar participants lastMessage');

    const lockedChats = chatLocks.map(lock => ({
      chat: lock.chatId,
      lockType: lock.lockType,
      biometricEnabled: lock.biometricEnabled,
      isCurrentlyLocked: lock.isCurrentlyLocked(),
      lastUnlockedAt: lock.lastUnlockedAt
    }));

    res.json({
      success: true,
      lockedChats,
      count: lockedChats.length
    });
  } catch (error) {
    console.error('ChatLock error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update lock settings
export const updateLockSettings = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { pin, newPin, biometricEnabled, autoLockTimeout } = req.body;
    const userId = req.user._id;

    const chatLock = await ChatLock.findOne({ chatId, userId }).select('+pinHash');
    
    if (!chatLock) {
      return res.status(404).json({ message: 'Chat lock not found' });
    }

    // Verify current PIN if changing PIN
    if (newPin) {
      if (!pin) {
        return res.status(400).json({ message: 'Current PIN required' });
      }

      const isValid = await bcrypt.compare(pin, chatLock.pinHash);
      if (!isValid) {
        return res.status(401).json({ message: 'Incorrect PIN' });
      }

      chatLock.pinHash = await bcrypt.hash(newPin, 12);
    }

    // Update other settings
    if (biometricEnabled !== undefined) {
      chatLock.biometricEnabled = biometricEnabled;
    }

    if (autoLockTimeout) {
      chatLock.autoLockTimeout = autoLockTimeout;
    }

    await chatLock.save();

    res.json({
      success: true,
      message: 'Lock settings updated successfully',
      chatLock: {
        chatId: chatLock.chatId,
        lockType: chatLock.lockType,
        biometricEnabled: chatLock.biometricEnabled,
        autoLockTimeout: chatLock.autoLockTimeout
      }
    });
  } catch (error) {
    console.error('ChatLock error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Remove lock from chat
export const removeLock = async (req, res) => {
  try {
    const { chatId, pin } = req.body;
    const userId = req.user._id;

    const chatLock = await ChatLock.findOne({ chatId, userId }).select('+pinHash');
    
    if (!chatLock) {
      return res.status(404).json({ message: 'Chat lock not found' });
    }

    // Verify PIN
    const isValid = await bcrypt.compare(pin, chatLock.pinHash);
    if (!isValid) {
      return res.status(401).json({ message: 'Incorrect PIN' });
    }

    await ChatLock.deleteOne({ chatId, userId });

    res.json({
      success: true,
      message: 'Chat lock removed successfully'
    });
  } catch (error) {
    console.error('ChatLock error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Quick lock/unlock (for already configured chats)
export const quickToggle = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user._id;

    const chatLock = await ChatLock.findOne({ chatId, userId });
    
    if (!chatLock) {
      return res.status(404).json({ message: 'Chat lock not configured' });
    }

    chatLock.isLocked = !chatLock.isLocked;
    if (!chatLock.isLocked) {
      chatLock.lastUnlockedAt = new Date();
      chatLock.failedAttempts = 0;
      chatLock.lockedUntil = null;
    } else {
      chatLock.lastUnlockedAt = null;
    }

    await chatLock.save();

    res.json({
      success: true,
      message: `Chat ${chatLock.isLocked ? 'locked' : 'unlocked'}`,
      isLocked: chatLock.isLocked
    });
  } catch (error) {
    console.error('ChatLock error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
