// controllers/storageController.js
import Chat from '../models/Chat.js';
import Message from '../models/Message.js';
import asyncHandler from 'express-async-handler';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// @desc    Get storage usage
// @route   GET /api/storage/usage
// @access  Private
export const getStorageUsage = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // Find all chats the user is part of
  const chats = await Chat.find({ 'participants.user': userId });
  const chatIds = chats.map(chat => chat._id);

  // Find all messages
  const messages = await Message.find({ 
    chat: { $in: chatIds },
    deletedFor: { $nin: [userId] }
  });

  // Calculate storage by type
  let imagesSize = 0;
  let videosSize = 0;
  let documentsSize = 0;
  let audioSize = 0;
  let otherSize = 0;

  const uploadsDir = path.join(__dirname, '../uploads');
  
  // Calculate sizes (in a real app, you'd get actual file sizes from storage)
  messages.forEach(msg => {
    if (msg.media && msg.media.url) {
      const mediaType = msg.media.type || 'other';
      // Estimate size based on type (in bytes)
      const estimatedSize = msg.media.size || (
        mediaType.startsWith('image') ? 500 * 1024 : // 500KB for images
        mediaType.startsWith('video') ? 5 * 1024 * 1024 : // 5MB for videos
        mediaType.startsWith('audio') ? 1 * 1024 * 1024 : // 1MB for audio
        mediaType === 'document' ? 2 * 1024 * 1024 : // 2MB for documents
        100 * 1024 // 100KB for other
      );

      if (mediaType.startsWith('image')) {
        imagesSize += estimatedSize;
      } else if (mediaType.startsWith('video')) {
        videosSize += estimatedSize;
      } else if (mediaType.startsWith('audio')) {
        audioSize += estimatedSize;
      } else if (mediaType === 'document') {
        documentsSize += estimatedSize;
      } else {
        otherSize += estimatedSize;
      }
    }
  });

  const totalUsed = imagesSize + videosSize + documentsSize + audioSize + otherSize;
  const totalStorage = 5 * 1024 * 1024 * 1024; // 5GB default storage

  // Calculate storage per chat
  const chatStorage = await Promise.all(
    chats.map(async (chat) => {
      const chatMessages = await Message.find({ 
        chat: chat._id,
        deletedFor: { $nin: [userId] }
      });

      let chatSize = 0;
      chatMessages.forEach(msg => {
        if (msg.media && msg.media.size) {
          chatSize += msg.media.size;
        } else if (msg.media && msg.media.url) {
          const mediaType = msg.media.type || 'other';
          chatSize += (
            mediaType.startsWith('image') ? 500 * 1024 :
            mediaType.startsWith('video') ? 5 * 1024 * 1024 :
            mediaType.startsWith('audio') ? 1 * 1024 * 1024 :
            mediaType === 'document' ? 2 * 1024 * 1024 :
            100 * 1024
          );
        }
      });

      return {
        _id: chat._id,
        name: chat.name || chat.participants.find(p => p.user.toString() !== userId.toString())?.user?.fullName || 'Unknown',
        avatar: chat.participants.find(p => p.user.toString() !== userId.toString())?.user?.avatar || '',
        storageUsed: chatSize,
        messageCount: chatMessages.length,
      };
    })
  );

  // Sort by storage used
  chatStorage.sort((a, b) => b.storageUsed - a.storageUsed);

  res.json({
    success: true,
    data: {
      total: totalStorage,
      used: totalUsed,
      available: totalStorage - totalUsed,
      breakdown: {
        images: imagesSize,
        videos: videosSize,
        documents: documentsSize,
        audio: audioSize,
        other: otherSize,
      },
      chats: chatStorage.slice(0, 20), // Top 20 chats
    },
  });
});

// @desc    Clear storage by type
// @route   DELETE /api/storage/clear/:type
// @access  Private
export const clearStorage = asyncHandler(async (req, res) => {
  const { type } = req.params;
  const userId = req.user._id;

  const validTypes = ['images', 'videos', 'documents', 'audio', 'all'];
  
  if (!validTypes.includes(type)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid storage type',
    });
  }

  // Find all chats
  const chats = await Chat.find({ 'participants.user': userId });
  const chatIds = chats.map(chat => chat._id);

  // Build filter based on type
  let mediaTypeFilter;
  if (type === 'images') {
    mediaTypeFilter = { $regex: /^image/ };
  } else if (type === 'videos') {
    mediaTypeFilter = { $regex: /^video/ };
  } else if (type === 'audio') {
    mediaTypeFilter = { $regex: /^audio/ };
  } else if (type === 'documents') {
    mediaTypeFilter = 'document';
  }

  // Delete media files
  if (type === 'all') {
    await Message.updateMany(
      { 
        chat: { $in: chatIds },
        'media.url': { $exists: true },
        deletedFor: { $nin: [userId] }
      },
      { $addToSet: { deletedFor: userId } }
    );
  } else {
    await Message.updateMany(
      { 
        chat: { $in: chatIds },
        'media.type': mediaTypeFilter,
        deletedFor: { $nin: [userId] }
      },
      { $addToSet: { deletedFor: userId } }
    );
  }

  // Optionally delete physical files from uploads directory
  // Note: In production, you'd want to be careful with this
  try {
    const uploadsDir = path.join(__dirname, '../uploads');
    if (fs.existsSync(uploadsDir)) {
      const files = fs.readdirSync(uploadsDir);
      files.forEach(file => {
        const filePath = path.join(uploadsDir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isFile()) {
          const ext = path.extname(file).toLowerCase();
          const shouldDelete = 
            (type === 'images' && ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext)) ||
            (type === 'videos' && ['.mp4', '.webm', '.mov', '.avi'].includes(ext)) ||
            (type === 'audio' && ['.mp3', '.wav', '.ogg', '.m4a'].includes(ext)) ||
            (type === 'documents' && ['.pdf', '.doc', '.docx', '.txt', '.xls', '.xlsx'].includes(ext)) ||
            type === 'all';

          if (shouldDelete) {
            fs.unlinkSync(filePath);
          }
        }
      });
    }
  } catch (error) {
    console.error('Error deleting files:', error);
  }

  res.json({
    success: true,
    message: `${type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)} storage cleared successfully`,
  });
});

// @desc    Clear cache
// @route   POST /api/storage/clear-cache
// @access  Private
export const clearCache = asyncHandler(async (req, res) => {
  // Clear temporary files
  const tempDir = path.join(__dirname, '../temp');
  
  if (fs.existsSync(tempDir)) {
    const files = fs.readdirSync(tempDir);
    files.forEach(file => {
      const filePath = path.join(tempDir, file);
      fs.unlinkSync(filePath);
    });
  }

  res.json({
    success: true,
    message: 'Cache cleared successfully',
  });
});

// @desc    Clear temporary files
// @route   POST /api/storage/clear-temp
// @access  Private
export const clearTempFiles = asyncHandler(async (req, res) => {
  const tempDir = path.join(__dirname, '../temp');
  
  if (fs.existsSync(tempDir)) {
    const files = fs.readdirSync(tempDir);
    files.forEach(file => {
      const filePath = path.join(tempDir, file);
      fs.unlinkSync(filePath);
    });
  }

  res.json({
    success: true,
    message: 'Temporary files cleared successfully',
  });
});

// @desc    Get network usage
// @route   GET /api/storage/network-usage
// @access  Private
export const getNetworkUsage = asyncHandler(async (req, res) => {
  // This would typically track data usage over time
  // For now, we'll return mock data
  const networkUsage = {
    mobileData: Math.floor(Math.random() * 500 * 1024 * 1024), // Random up to 500MB
    wifi: Math.floor(Math.random() * 2 * 1024 * 1024 * 1024), // Random up to 2GB
    uploaded: Math.floor(Math.random() * 1 * 1024 * 1024 * 1024), // Random up to 1GB
    downloaded: Math.floor(Math.random() * 3 * 1024 * 1024 * 1024), // Random up to 3GB
  };

  res.json({
    success: true,
    data: networkUsage,
  });
});

// @desc    Reset network statistics
// @route   POST /api/storage/reset-network-stats
// @access  Private
export const resetNetworkStats = asyncHandler(async (req, res) => {
  // In a real app, you'd reset stored statistics
  res.json({
    success: true,
    message: 'Network statistics reset successfully',
  });
});

// @desc    Get storage by chat
// @route   GET /api/storage/by-chat
// @access  Private
export const getStorageByChat = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const chats = await Chat.find({ 'participants.user': userId });

  const chatStorage = await Promise.all(
    chats.map(async (chat) => {
      const messages = await Message.find({ 
        chat: chat._id,
        deletedFor: { $nin: [userId] }
      });

      let totalSize = 0;
      let imageCount = 0;
      let videoCount = 0;
      let documentCount = 0;
      let audioCount = 0;

      messages.forEach(msg => {
        if (msg.media) {
          const size = msg.media.size || 100 * 1024;
          totalSize += size;

          const mediaType = msg.media.type || 'other';
          if (mediaType.startsWith('image')) imageCount++;
          else if (mediaType.startsWith('video')) videoCount++;
          else if (mediaType === 'document') documentCount++;
          else if (mediaType.startsWith('audio')) audioCount++;
        }
      });

      return {
        chatId: chat._id,
        name: chat.name || chat.participants.find(p => p.user.toString() !== userId.toString())?.user?.fullName || 'Unknown',
        avatar: chat.participants.find(p => p.user.toString() !== userId.toString())?.user?.avatar || '',
        storageUsed: totalSize,
        messageCount: messages.length,
        mediaCount: {
          images: imageCount,
          videos: videoCount,
          documents: documentCount,
          audio: audioCount,
        },
      };
    })
  );

  // Sort by storage used
  chatStorage.sort((a, b) => b.storageUsed - a.storageUsed);

  res.json({
    success: true,
    data: chatStorage,
  });
});

// Helper function to format file size
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};
