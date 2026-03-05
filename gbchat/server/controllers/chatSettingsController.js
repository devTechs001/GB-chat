// controllers/chatSettingsController.js
import User from '../models/User.js';
import Chat from '../models/Chat.js';
import Message from '../models/Message.js';
import asyncHandler from 'express-async-handler';

// @desc    Get chat settings
// @route   GET /api/chat-settings
// @access  Private
export const getChatSettings = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select(
    'theme notifications dnd chatSettings'
  );

  res.json({
    success: true,
    data: {
      enterToSend: user.theme?.enterToSend ?? true,
      autoDownloadMedia: user.notifications?.autoDownloadMedia ?? true,
      autoPlayVideos: user.notifications?.autoPlayVideos ?? false,
      showTypingIndicator: user.notifications?.showTypingIndicator ?? true,
      showReadReceipts: user.privacy?.readReceipts ?? true,
      showOnlineStatus: user.privacy?.onlineStatus ?? true,
      archiveOnMute: user.notifications?.archiveOnMute ?? false,
      saveToGallery: user.notifications?.saveToGallery ?? false,
      mediaQuality: user.notifications?.mediaQuality || 'auto',
      // New enhanced features
      autoReply: user.chatSettings?.autoReply || { enabled: false, message: '' },
      quickReactions: user.chatSettings?.quickReactions || ['❤️', '👍', '😂', '😮', '😢', '🙏'],
      chatFolders: user.chatSettings?.chatFolders || [],
      messageTranslation: user.chatSettings?.messageTranslation ?? false,
      defaultLanguage: user.chatSettings?.defaultLanguage || 'en',
      inlineReply: user.chatSettings?.inlineReply ?? true,
      swipeActions: user.chatSettings?.swipeActions || { left: 'archive', right: 'mute' },
      doubleTapToReply: user.chatSettings?.doubleTapToReply ?? true,
      sendButtonBehavior: user.chatSettings?.sendButtonBehavior || 'send',
      confirmBeforeDelete: user.chatSettings?.confirmBeforeDelete ?? true,
      showChatPreview: user.chatSettings?.showChatPreview ?? true,
      prioritizeUnread: user.chatSettings?.prioritizeUnread ?? true,
      autoArchive: user.chatSettings?.autoArchive || { enabled: false, afterDays: 365 },
    },
  });
});

// @desc    Update chat settings
// @route   PUT /api/chat-settings
// @access  Private
export const updateChatSettings = asyncHandler(async (req, res) => {
  const {
    enterToSend, autoDownloadMedia, autoPlayVideos, showTypingIndicator,
    showReadReceipts, showOnlineStatus, archiveOnMute, saveToGallery, mediaQuality,
    autoReply, quickReactions, chatFolders, messageTranslation, defaultLanguage,
    inlineReply, swipeActions, doubleTapToReply, sendButtonBehavior,
    confirmBeforeDelete, showChatPreview, prioritizeUnread, autoArchive,
  } = req.body;

  const user = await User.findById(req.user._id);

  if (!user.theme) user.theme = {};
  if (!user.notifications) user.notifications = {};
  if (!user.chatSettings) user.chatSettings = {};
  if (!user.privacy) user.privacy = {};

  if (enterToSend !== undefined) user.theme.enterToSend = enterToSend;
  if (autoDownloadMedia !== undefined) user.notifications.autoDownloadMedia = autoDownloadMedia;
  if (autoPlayVideos !== undefined) user.notifications.autoPlayVideos = autoPlayVideos;
  if (showTypingIndicator !== undefined) user.notifications.showTypingIndicator = showTypingIndicator;
  if (archiveOnMute !== undefined) user.notifications.archiveOnMute = archiveOnMute;
  if (saveToGallery !== undefined) user.notifications.saveToGallery = saveToGallery;
  if (mediaQuality !== undefined) user.notifications.mediaQuality = mediaQuality;
  
  if (autoReply !== undefined) user.chatSettings.autoReply = autoReply;
  if (quickReactions !== undefined) user.chatSettings.quickReactions = quickReactions;
  if (chatFolders !== undefined) user.chatSettings.chatFolders = chatFolders;
  if (messageTranslation !== undefined) user.chatSettings.messageTranslation = messageTranslation;
  if (defaultLanguage !== undefined) user.chatSettings.defaultLanguage = defaultLanguage;
  if (inlineReply !== undefined) user.chatSettings.inlineReply = inlineReply;
  if (swipeActions !== undefined) user.chatSettings.swipeActions = swipeActions;
  if (doubleTapToReply !== undefined) user.chatSettings.doubleTapToReply = doubleTapToReply;
  if (sendButtonBehavior !== undefined) user.chatSettings.sendButtonBehavior = sendButtonBehavior;
  if (confirmBeforeDelete !== undefined) user.chatSettings.confirmBeforeDelete = confirmBeforeDelete;
  if (showChatPreview !== undefined) user.chatSettings.showChatPreview = showChatPreview;
  if (prioritizeUnread !== undefined) user.chatSettings.prioritizeUnread = prioritizeUnread;
  if (autoArchive !== undefined) user.chatSettings.autoArchive = autoArchive;
  if (showReadReceipts !== undefined) user.privacy.readReceipts = showReadReceipts;
  if (showOnlineStatus !== undefined) user.privacy.onlineStatus = showOnlineStatus;

  await user.save();

  res.json({ success: true, message: 'Chat settings updated', data: user.chatSettings });
});

// @desc    Set media quality
// @route   POST /api/chat-settings/media-quality
// @access  Private
export const setMediaQuality = asyncHandler(async (req, res) => {
  const { quality } = req.body;
  if (!quality || !['auto', 'high', 'medium', 'low'].includes(quality)) {
    return res.status(400).json({ success: false, message: 'Invalid media quality' });
  }
  const user = await User.findById(req.user._id);
  if (!user.notifications) user.notifications = {};
  user.notifications.mediaQuality = quality;
  await user.save();
  res.json({ success: true, message: `Media quality set to ${quality}`, data: { mediaQuality: quality } });
});

// @desc    Clear all chats
// @route   POST /api/chat-settings/clear-all
// @access  Private
export const clearAllChats = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const chats = await Chat.find({ 'participants.user': userId });
  await Message.updateMany({ chat: { $in: chats.map(c => c._id) }, deletedFor: { $nin: [userId] } }, { $addToSet: { deletedFor: userId } });
  res.json({ success: true, message: 'All chats cleared' });
});

// @desc    Export all chats
// @route   GET /api/chat-settings/export
// @access  Private
export const exportChats = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const chats = await Chat.find({ 'participants.user': userId }).populate('participants.user', 'fullName avatar phone');
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename="gbchat-export-${Date.now()}.json"`);
  res.json(chats);
});

// @desc    Archive all chats
// @route   POST /api/chat-settings/archive-all
// @access  Private
export const archiveAllChats = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const user = await User.findById(userId);
  const chats = await Chat.find({ 'participants.user': userId });
  chats.forEach(chat => { if (!user.archivedChats.includes(chat._id)) user.archivedChats.push(chat._id); });
  await user.save();
  res.json({ success: true, message: 'All chats archived', archivedCount: chats.length });
});

// @desc    Get/Set global wallpaper
// @route   GET/POST /api/chat-settings/global-wallpaper
// @access  Private
export const getGlobalWallpaper = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('theme.wallpaper');
  res.json({ success: true, data: { wallpaper: user.theme?.wallpaper || null } });
});

export const setGlobalWallpaper = asyncHandler(async (req, res) => {
  const { wallpaperUrl } = req.body;
  const user = await User.findById(req.user._id);
  if (!user.theme) user.theme = {};
  user.theme.wallpaper = wallpaperUrl || '';
  await user.save();
  res.json({ success: true, message: wallpaperUrl ? 'Global wallpaper updated' : 'Wallpaper reset', data: { wallpaper: user.theme.wallpaper } });
});

// @desc    Toggle chat setting
// @route   POST /api/chat-settings/toggle/:setting
// @access  Private
export const toggleChatSetting = asyncHandler(async (req, res) => {
  const { setting } = req.params;
  const validSettings = ['enterToSend', 'autoDownloadMedia', 'autoPlayVideos', 'showTypingIndicator', 'showReadReceipts', 'showOnlineStatus', 'archiveOnMute', 'saveToGallery', 'messageTranslation', 'inlineReply', 'doubleTapToReply', 'showChatPreview', 'prioritizeUnread'];
  if (!validSettings.includes(setting)) return res.status(400).json({ success: false, message: 'Invalid setting' });

  const user = await User.findById(req.user._id);
  if (!user.theme) user.theme = {};
  if (!user.notifications) user.notifications = {};
  if (!user.chatSettings) user.chatSettings = {};
  if (!user.privacy) user.privacy = {};

  let currentValue;
  if (setting === 'enterToSend') { user.theme.enterToSend = !user.theme.enterToSend; currentValue = user.theme.enterToSend; }
  else if (['showReadReceipts', 'showOnlineStatus'].includes(setting)) { user.privacy[setting] = !user.privacy[setting]; currentValue = user.privacy[setting]; }
  else if (['messageTranslation', 'inlineReply', 'doubleTapToReply', 'showChatPreview', 'prioritizeUnread'].includes(setting)) { user.chatSettings[setting] = !user.chatSettings[setting]; currentValue = user.chatSettings[setting]; }
  else { user.notifications[setting] = !user.notifications[setting]; currentValue = user.notifications[setting]; }

  await user.save();
  res.json({ success: true, message: `${setting} ${currentValue ? 'enabled' : 'disabled'}`, data: { [setting]: currentValue } });
});

// @desc    Set auto-reply
// @route   POST /api/chat-settings/auto-reply
// @access  Private
export const setAutoReply = asyncHandler(async (req, res) => {
  const { enabled, message, onlyForGroups, schedule } = req.body;
  const user = await User.findById(req.user._id);
  if (!user.chatSettings) user.chatSettings = {};
  user.chatSettings.autoReply = { enabled: enabled ?? false, message: message ?? '', onlyForGroups: onlyForGroups ?? false, schedule };
  await user.save();
  res.json({ success: true, message: 'Auto-reply updated', data: user.chatSettings.autoReply });
});

// @desc    Set quick reactions
// @route   POST /api/chat-settings/quick-reactions
// @access  Private
export const setQuickReactions = asyncHandler(async (req, res) => {
  const { reactions } = req.body;
  if (!reactions || !Array.isArray(reactions)) return res.status(400).json({ success: false, message: 'Reactions array required' });
  const user = await User.findById(req.user._id);
  if (!user.chatSettings) user.chatSettings = {};
  user.chatSettings.quickReactions = reactions;
  await user.save();
  res.json({ success: true, message: 'Quick reactions updated', data: { quickReactions: reactions } });
});

// @desc    Create chat folder
// @route   POST /api/chat-settings/folders
// @access  Private
export const createChatFolder = asyncHandler(async (req, res) => {
  const { name, color, chatIds, icon } = req.body;
  if (!name) return res.status(400).json({ success: false, message: 'Folder name required' });
  const user = await User.findById(req.user._id);
  if (!user.chatSettings) user.chatSettings = {};
  if (!user.chatSettings.chatFolders) user.chatSettings.chatFolders = [];
  const folder = { id: `folder_${Date.now()}`, name, color: color || '#25D366', chatIds: chatIds || [], icon: icon || 'folder', createdAt: new Date() };
  user.chatSettings.chatFolders.push(folder);
  await user.save();
  res.json({ success: true, message: 'Folder created', data: folder });
});

// @desc    Update chat folder
// @route   PUT /api/chat-settings/folders/:folderId
// @access  Private
export const updateChatFolder = asyncHandler(async (req, res) => {
  const { folderId } = req.params;
  const { name, color, chatIds, icon } = req.body;
  const user = await User.findById(req.user._id);
  if (!user.chatSettings?.chatFolders) return res.status(404).json({ success: false, message: 'No folders found' });
  const folder = user.chatSettings.chatFolders.find(f => f.id === folderId);
  if (!folder) return res.status(404).json({ success: false, message: 'Folder not found' });
  if (name !== undefined) folder.name = name;
  if (color !== undefined) folder.color = color;
  if (chatIds !== undefined) folder.chatIds = chatIds;
  if (icon !== undefined) folder.icon = icon;
  await user.save();
  res.json({ success: true, message: 'Folder updated', data: folder });
});

// @desc    Delete chat folder
// @route   DELETE /api/chat-settings/folders/:folderId
// @access  Private
export const deleteChatFolder = asyncHandler(async (req, res) => {
  const { folderId } = req.params;
  const user = await User.findById(req.user._id);
  if (!user.chatSettings?.chatFolders) return res.status(404).json({ success: false, message: 'No folders found' });
  user.chatSettings.chatFolders = user.chatSettings.chatFolders.filter(f => f.id !== folderId);
  await user.save();
  res.json({ success: true, message: 'Folder deleted' });
});

// @desc    Get chat folders
// @route   GET /api/chat-settings/folders
// @access  Private
export const getChatFolders = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json({ success: true, data: user.chatSettings?.chatFolders || [] });
});

// @desc    Set swipe actions
// @route   POST /api/chat-settings/swipe-actions
// @access  Private
export const setSwipeActions = asyncHandler(async (req, res) => {
  const { left, right } = req.body;
  const validActions = ['archive', 'mute', 'delete', 'read', 'pin'];
  if ((left && !validActions.includes(left)) || (right && !validActions.includes(right))) return res.status(400).json({ success: false, message: 'Invalid swipe action' });
  const user = await User.findById(req.user._id);
  if (!user.chatSettings) user.chatSettings = {};
  user.chatSettings.swipeActions = { left: left || 'archive', right: right || 'mute' };
  await user.save();
  res.json({ success: true, message: 'Swipe actions updated', data: user.chatSettings.swipeActions });
});

// @desc    Set auto-archive settings
// @route   POST /api/chat-settings/auto-archive
// @access  Private
export const setAutoArchive = asyncHandler(async (req, res) => {
  const { enabled, afterDays } = req.body;
  const user = await User.findById(req.user._id);
  if (!user.chatSettings) user.chatSettings = {};
  user.chatSettings.autoArchive = { enabled: enabled ?? false, afterDays: afterDays || 365 };
  await user.save();
  res.json({ success: true, message: 'Auto-archive updated', data: user.chatSettings.autoArchive });
});
