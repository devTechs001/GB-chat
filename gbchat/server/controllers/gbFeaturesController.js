import mongoose from 'mongoose';
import GBFeatures from '../models/GBFeatures.model.js';

// Get user's GB features
export const getGBFeatures = async (req, res) => {
  try {
    let features = await GBFeatures.findOne({ userId: req.user._id });
    
    if (!features) {
      // Create default features if not exists
      features = await GBFeatures.create({
        userId: req.user._id
      });
    }
    
    res.json({
      success: true,
      data: features
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching GB features',
      error: error.message
    });
  }
};

// Update GB features
export const updateGBFeatures = async (req, res) => {
  try {
    const { section, data } = req.body;
    
    let features = await GBFeatures.findOne({ userId: req.user._id });
    
    if (!features) {
      features = new GBFeatures({ userId: req.user._id });
    }
    
    if (section && data) {
      // Update specific section
      if (features[section]) {
        features[section] = { ...features[section], ...data };
      } else {
        features[section] = data;
      }
    } else {
      // Update entire features
      features = { ...features, ...req.body };
    }
    
    await features.save();
    
    res.json({
      success: true,
      message: 'GB features updated successfully',
      data: features
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating GB features',
      error: error.message
    });
  }
};

// Toggle specific feature
export const toggleFeature = async (req, res) => {
  try {
    const { feature, section } = req.body;
    
    if (!feature || !section) {
      return res.status(400).json({
        success: false,
        message: 'Feature and section are required'
      });
    }
    
    let features = await GBFeatures.findOne({ userId: req.user._id });
    
    if (!features) {
      features = new GBFeatures({ userId: req.user._id });
    }
    
    // Toggle the feature
    if (features[section] && typeof features[section][feature] === 'boolean') {
      features[section][feature] = !features[section][feature];
      await features.save();
      
      res.json({
        success: true,
        message: `Feature ${feature} ${features[section][feature] ? 'enabled' : 'disabled'}`,
        data: features
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Invalid feature or section'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error toggling feature',
      error: error.message
    });
  }
};

// Pin a message
export const pinMessage = async (req, res) => {
  try {
    const { messageId, chatId } = req.body;
    
    if (!messageId || !chatId) {
      return res.status(400).json({
        success: false,
        message: 'Message ID and chat ID are required'
      });
    }
    
    let features = await GBFeatures.findOne({ userId: req.user._id });
    
    if (!features) {
      features = new GBFeatures({ userId: req.user._id });
    }
    
    // Check if already pinned
    const alreadyPinned = features.messaging.pinnedMessages.find(
      pm => pm.messageId.toString() === messageId
    );
    
    if (alreadyPinned) {
      return res.status(400).json({
        success: false,
        message: 'Message already pinned'
      });
    }
    
    // Add to pinned messages (max 10)
    if (features.messaging.pinnedMessages.length >= 10) {
      features.messaging.pinnedMessages.shift(); // Remove oldest
    }
    
    features.messaging.pinnedMessages.push({
      messageId,
      chatId,
      pinnedAt: new Date()
    });
    
    await features.save();
    
    res.json({
      success: true,
      message: 'Message pinned successfully',
      data: features
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error pinning message',
      error: error.message
    });
  }
};

// Unpin a message
export const unpinMessage = async (req, res) => {
  try {
    const { messageId } = req.body;
    
    if (!messageId) {
      return res.status(400).json({
        success: false,
        message: 'Message ID is required'
      });
    }
    
    let features = await GBFeatures.findOne({ userId: req.user._id });
    
    if (!features) {
      features = new GBFeatures({ userId: req.user._id });
    }
    
    features.messaging.pinnedMessages = features.messaging.pinnedMessages.filter(
      pm => pm.messageId.toString() !== messageId
    );
    
    await features.save();
    
    res.json({
      success: true,
      message: 'Message unpinned successfully',
      data: features
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error unpinning message',
      error: error.message
    });
  }
};

// Get pinned messages
export const getPinnedMessages = async (req, res) => {
  try {
    let features = await GBFeatures.findOne({ userId: req.user._id });
    
    if (!features) {
      features = new GBFeatures({ userId: req.user._id });
    }
    
    res.json({
      success: true,
      data: features.messaging.pinnedMessages
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching pinned messages',
      error: error.message
    });
  }
};

// Star a message
export const starMessage = async (req, res) => {
  try {
    const { messageId, chatId } = req.body;
    
    if (!messageId || !chatId) {
      return res.status(400).json({
        success: false,
        message: 'Message ID and chat ID are required'
      });
    }
    
    let features = await GBFeatures.findOne({ userId: req.user._id });
    
    if (!features) {
      features = new GBFeatures({ userId: req.user._id });
    }
    
    // Check if already starred
    const alreadyStarred = features.messaging.starredMessages.find(
      sm => sm.messageId.toString() === messageId
    );
    
    if (alreadyStarred) {
      return res.status(400).json({
        success: false,
        message: 'Message already starred'
      });
    }
    
    features.messaging.starredMessages.push({
      messageId,
      chatId,
      starredAt: new Date()
    });
    
    await features.save();
    
    res.json({
      success: true,
      message: 'Message starred successfully',
      data: features
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error starring message',
      error: error.message
    });
  }
};

// Unstar a message
export const unstarMessage = async (req, res) => {
  try {
    const { messageId } = req.body;
    
    if (!messageId) {
      return res.status(400).json({
        success: false,
        message: 'Message ID is required'
      });
    }
    
    let features = await GBFeatures.findOne({ userId: req.user._id });
    
    if (!features) {
      features = new GBFeatures({ userId: req.user._id });
    }
    
    features.messaging.starredMessages = features.messaging.starredMessages.filter(
      sm => sm.messageId.toString() !== messageId
    );
    
    await features.save();
    
    res.json({
      success: true,
      message: 'Message unstarred successfully',
      data: features
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error unstarring message',
      error: error.message
    });
  }
};

// Get starred messages
export const getStarredMessages = async (req, res) => {
  try {
    let features = await GBFeatures.findOne({ userId: req.user._id });
    
    if (!features) {
      features = new GBFeatures({ userId: req.user._id });
    }
    
    res.json({
      success: true,
      data: features.messaging.starredMessages
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching starred messages',
      error: error.message
    });
  }
};

// Schedule a message
export const scheduleMessage = async (req, res) => {
  try {
    const { chatId, message, scheduledTime, media } = req.body;
    
    if (!chatId || !message || !scheduledTime) {
      return res.status(400).json({
        success: false,
        message: 'Chat ID, message, and scheduled time are required'
      });
    }
    
    // Validate scheduled time is in the future
    const scheduledDate = new Date(scheduledTime);
    if (scheduledDate <= new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Scheduled time must be in the future'
      });
    }
    
    // Create scheduled message record
    const ScheduledMessage = mongoose.model('ScheduledMessage', new mongoose.Schema({
      userId: mongoose.Schema.Types.ObjectId,
      chatId: String,
      message: String,
      media: Object,
      scheduledTime: Date,
      status: { type: String, enum: ['pending', 'sent', 'failed'], default: 'pending' },
      sentAt: Date
    }));
    
    const scheduledMsg = await ScheduledMessage.create({
      userId: req.user._id,
      chatId,
      message,
      media,
      scheduledTime: scheduledDate
    });
    
    // Update stats
    let features = await GBFeatures.findOne({ userId: req.user._id });
    if (features) {
      features.stats.messagesScheduled += 1;
      await features.save();
    }
    
    // Emit socket event for scheduled message
    if (global.io) {
      global.io.to(req.user._id.toString()).emit('message:scheduled', {
        id: scheduledMsg._id,
        chatId,
        scheduledTime: scheduledDate
      });
    }
    
    res.json({
      success: true,
      message: 'Message scheduled successfully',
      data: scheduledMsg
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error scheduling message',
      error: error.message
    });
  }
};

// Get scheduled messages
export const getScheduledMessages = async (req, res) => {
  try {
    const ScheduledMessage = mongoose.model('ScheduledMessage', new mongoose.Schema({
      userId: mongoose.Schema.Types.ObjectId,
      chatId: String,
      message: String,
      media: Object,
      scheduledTime: Date,
      status: { type: String, enum: ['pending', 'sent', 'failed'], default: 'pending' },
      sentAt: Date
    }));
    
    const messages = await ScheduledMessage.find({
      userId: req.user._id,
      status: 'pending'
    }).sort({ scheduledTime: 1 });
    
    res.json({
      success: true,
      data: messages
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching scheduled messages',
      error: error.message
    });
  }
};

// Cancel scheduled message
export const cancelScheduledMessage = async (req, res) => {
  try {
    const { messageId } = req.body;
    
    const ScheduledMessage = mongoose.model('ScheduledMessage', new mongoose.Schema({
      userId: mongoose.Schema.Types.ObjectId,
      chatId: String,
      message: String,
      media: Object,
      scheduledTime: Date,
      status: { type: String, enum: ['pending', 'sent', 'failed'], default: 'pending' },
      sentAt: Date
    }));
    
    await ScheduledMessage.findOneAndDelete({
      _id: messageId,
      userId: req.user._id
    });
    
    res.json({
      success: true,
      message: 'Scheduled message cancelled'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error cancelling scheduled message',
      error: error.message
    });
  }
};

// Create chat filter
export const createChatFilter = async (req, res) => {
  try {
    const { name, chatIds, color } = req.body;
    
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Filter name is required'
      });
    }
    
    let features = await GBFeatures.findOne({ userId: req.user._id });
    
    if (!features) {
      features = new GBFeatures({ userId: req.user._id });
    }
    
    const filter = {
      id: `filter_${Date.now()}`,
      name,
      chatIds: chatIds || [],
      color: color || '#25D366'
    };
    
    features.messaging.chatFilters.push(filter);
    await features.save();
    
    res.json({
      success: true,
      message: 'Chat filter created successfully',
      data: filter
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating chat filter',
      error: error.message
    });
  }
};

// Update chat filter
export const updateChatFilter = async (req, res) => {
  try {
    const { filterId, name, chatIds, color } = req.body;
    
    if (!filterId) {
      return res.status(400).json({
        success: false,
        message: 'Filter ID is required'
      });
    }
    
    let features = await GBFeatures.findOne({ userId: req.user._id });
    
    if (!features) {
      features = new GBFeatures({ userId: req.user._id });
    }
    
    const filter = features.messaging.chatFilters.find(f => f.id === filterId);
    
    if (!filter) {
      return res.status(404).json({
        success: false,
        message: 'Filter not found'
      });
    }
    
    if (name) filter.name = name;
    if (chatIds) filter.chatIds = chatIds;
    if (color) filter.color = color;
    
    await features.save();
    
    res.json({
      success: true,
      message: 'Chat filter updated successfully',
      data: filter
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating chat filter',
      error: error.message
    });
  }
};

// Delete chat filter
export const deleteChatFilter = async (req, res) => {
  try {
    const { filterId } = req.body;
    
    let features = await GBFeatures.findOne({ userId: req.user._id });
    
    if (!features) {
      features = new GBFeatures({ userId: req.user._id });
    }
    
    features.messaging.chatFilters = features.messaging.chatFilters.filter(
      f => f.id !== filterId
    );
    
    await features.save();
    
    res.json({
      success: true,
      message: 'Chat filter deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting chat filter',
      error: error.message
    });
  }
};

// Get chat filters
export const getChatFilters = async (req, res) => {
  try {
    let features = await GBFeatures.findOne({ userId: req.user._id });
    
    if (!features) {
      features = new GBFeatures({ userId: req.user._id });
    }
    
    res.json({
      success: true,
      data: features.messaging.chatFilters
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching chat filters',
      error: error.message
    });
  }
};
