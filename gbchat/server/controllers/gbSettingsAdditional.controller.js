import GBFeatures from '../models/GBFeatures.model.js';

// ============================================================================
// Individual Privacy Feature Toggles
// ============================================================================

export const toggleOnlineStatus = async (req, res) => {
  try {
    const { hide } = req.body;
    let features = await GBFeatures.findOne({ userId: req.user._id });
    if (!features) features = new GBFeatures({ userId: req.user._id });

    features.privacy.hideOnlineStatus = typeof hide === 'boolean' ? hide : !features.privacy.hideOnlineStatus;
    await features.save();

    res.json({
      success: true,
      message: `Online status ${features.privacy.hideOnlineStatus ? 'hidden' : 'visible'}`,
      data: { hideOnlineStatus: features.privacy.hideOnlineStatus }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error toggling online status', error: error.message });
  }
};

export const toggleLastSeen = async (req, res) => {
  try {
    const { freeze, timestamp } = req.body;
    let features = await GBFeatures.findOne({ userId: req.user._id });
    if (!features) features = new GBFeatures({ userId: req.user._id });

    if (typeof freeze === 'boolean') {
      features.privacy.freezeLastSeen = freeze;
      if (freeze && timestamp) features.privacy.frozenLastSeenTime = new Date(timestamp);
    }
    await features.save();

    res.json({
      success: true,
      message: 'Last seen settings updated',
      data: { freezeLastSeen: features.privacy.freezeLastSeen, frozenLastSeenTime: features.privacy.frozenLastSeenTime }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error toggling last seen', error: error.message });
  }
};

export const toggleReadReceipts = async (req, res) => {
  try {
    const { hide } = req.body;
    let features = await GBFeatures.findOne({ userId: req.user._id });
    if (!features) features = new GBFeatures({ userId: req.user._id });

    features.privacy.hideBlueTicks = typeof hide === 'boolean' ? hide : !features.privacy.hideBlueTicks;
    await features.save();

    res.json({
      success: true,
      message: `Read receipts ${features.privacy.hideBlueTicks ? 'hidden' : 'visible'}`,
      data: { hideBlueTicks: features.privacy.hideBlueTicks }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error toggling read receipts', error: error.message });
  }
};

export const toggleDeliveryReceipts = async (req, res) => {
  try {
    const { hide } = req.body;
    let features = await GBFeatures.findOne({ userId: req.user._id });
    if (!features) features = new GBFeatures({ userId: req.user._id });

    features.privacy.hideSecondTick = typeof hide === 'boolean' ? hide : !features.privacy.hideSecondTick;
    await features.save();

    res.json({
      success: true,
      message: `Delivery receipts ${features.privacy.hideSecondTick ? 'hidden' : 'visible'}`,
      data: { hideSecondTick: features.privacy.hideSecondTick }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error toggling delivery receipts', error: error.message });
  }
};

export const toggleForwardLabel = async (req, res) => {
  try {
    const { hide } = req.body;
    let features = await GBFeatures.findOne({ userId: req.user._id });
    if (!features) features = new GBFeatures({ userId: req.user._id });

    features.privacy.hideForwardLabel = typeof hide === 'boolean' ? hide : !features.privacy.hideForwardLabel;
    await features.save();

    res.json({
      success: true,
      message: `Forward label ${features.privacy.hideForwardLabel ? 'hidden' : 'visible'}`,
      data: { hideForwardLabel: features.privacy.hideForwardLabel }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error toggling forward label', error: error.message });
  }
};

export const toggleAntiStatusView = async (req, res) => {
  try {
    const { enable } = req.body;
    let features = await GBFeatures.findOne({ userId: req.user._id });
    if (!features) features = new GBFeatures({ userId: req.user._id });

    features.privacy.antiStatusView = typeof enable === 'boolean' ? enable : !features.privacy.antiStatusView;
    await features.save();

    res.json({
      success: true,
      message: `Anti-status view ${features.privacy.antiStatusView ? 'enabled' : 'disabled'}`,
      data: { antiStatusView: features.privacy.antiStatusView }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error toggling anti-status view', error: error.message });
  }
};

export const toggleAntiDeleteStatus = async (req, res) => {
  try {
    const { enable } = req.body;
    let features = await GBFeatures.findOne({ userId: req.user._id });
    if (!features) features = new GBFeatures({ userId: req.user._id });

    features.privacy.antiDeleteStatus = typeof enable === 'boolean' ? enable : !features.privacy.antiDeleteStatus;
    await features.save();

    res.json({
      success: true,
      message: `Anti-delete status ${features.privacy.antiDeleteStatus ? 'enabled' : 'disabled'}`,
      data: { antiDeleteStatus: features.privacy.antiDeleteStatus }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error toggling anti-delete status', error: error.message });
  }
};

export const toggleAntiRevoke = async (req, res) => {
  try {
    const { enable } = req.body;
    let features = await GBFeatures.findOne({ userId: req.user._id });
    if (!features) features = new GBFeatures({ userId: req.user._id });

    features.privacy.antiRevoke = typeof enable === 'boolean' ? enable : !features.privacy.antiRevoke;
    await features.save();

    res.json({
      success: true,
      message: `Anti-revoke ${features.privacy.antiRevoke ? 'enabled' : 'disabled'}`,
      data: { antiRevoke: features.privacy.antiRevoke }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error toggling anti-revoke', error: error.message });
  }
};

export const toggleViewOnceBypass = async (req, res) => {
  try {
    const { enable } = req.body;
    let features = await GBFeatures.findOne({ userId: req.user._id });
    if (!features) features = new GBFeatures({ userId: req.user._id });

    features.privacy.viewOnceBypass = typeof enable === 'boolean' ? enable : !features.privacy.viewOnceBypass;
    await features.save();

    res.json({
      success: true,
      message: `View once bypass ${features.privacy.viewOnceBypass ? 'enabled' : 'disabled'}`,
      data: { viewOnceBypass: features.privacy.viewOnceBypass }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error toggling view once bypass', error: error.message });
  }
};

export const toggleIncognitoMode = async (req, res) => {
  try {
    const { enable } = req.body;
    let features = await GBFeatures.findOne({ userId: req.user._id });
    if (!features) features = new GBFeatures({ userId: req.user._id });

    features.privacy.incognitoMode = typeof enable === 'boolean' ? enable : !features.privacy.incognitoMode;
    await features.save();

    res.json({
      success: true,
      message: `Incognito mode ${features.privacy.incognitoMode ? 'enabled' : 'disabled'}`,
      data: { incognitoMode: features.privacy.incognitoMode }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error toggling incognito mode', error: error.message });
  }
};

// ============================================================================
// Individual Customization Feature Toggles
// ============================================================================

export const toggleCustomTheme = async (req, res) => {
  try {
    const { enable, themeData } = req.body;
    let features = await GBFeatures.findOne({ userId: req.user._id });
    if (!features) features = new GBFeatures({ userId: req.user._id });

    if (typeof enable === 'boolean') features.customization.customTheme.enabled = enable;
    if (themeData) {
      if (themeData.themeId) features.customization.customTheme.themeId = themeData.themeId;
      if (themeData.primaryColor) features.customization.customTheme.primaryColor = themeData.primaryColor;
      if (themeData.secondaryColor) features.customization.customTheme.secondaryColor = themeData.secondaryColor;
      if (themeData.backgroundImage) features.customization.customTheme.backgroundImage = themeData.backgroundImage;
      if (themeData.chatBubbles) features.customization.customTheme.chatBubbles = themeData.chatBubbles;
    }
    await features.save();

    res.json({
      success: true,
      message: 'Custom theme updated',
      data: { customTheme: features.customization.customTheme }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error toggling custom theme', error: error.message });
  }
};

export const toggleCustomFont = async (req, res) => {
  try {
    const { enable, fontFamily, fontSize } = req.body;
    let features = await GBFeatures.findOne({ userId: req.user._id });
    if (!features) features = new GBFeatures({ userId: req.user._id });

    if (typeof enable === 'boolean') features.customization.customFont.enabled = enable;
    if (fontFamily) features.customization.customFont.fontFamily = fontFamily;
    if (fontSize && fontSize >= 10 && fontSize <= 24) features.customization.customFont.fontSize = fontSize;
    await features.save();

    res.json({
      success: true,
      message: 'Custom font updated',
      data: { customFont: features.customization.customFont }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error toggling custom font', error: error.message });
  }
};

export const setWidgetSettings = async (req, res) => {
  try {
    const { enabled, widgetType, showUnreadCount, showProfilePicture } = req.body;
    let features = await GBFeatures.findOne({ userId: req.user._id });
    if (!features) features = new GBFeatures({ userId: req.user._id });

    if (typeof enabled === 'boolean') features.customization.widgetSettings.enabled = enabled;
    if (widgetType && ['chat', 'stories', 'quick-actions'].includes(widgetType)) {
      features.customization.widgetSettings.widgetType = widgetType;
    }
    if (typeof showUnreadCount === 'boolean') features.customization.widgetSettings.showUnreadCount = showUnreadCount;
    if (typeof showProfilePicture === 'boolean') features.customization.widgetSettings.showProfilePicture = showProfilePicture;
    await features.save();

    res.json({
      success: true,
      message: 'Widget settings updated',
      data: { widgetSettings: features.customization.widgetSettings }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error setting widget', error: error.message });
  }
};

// ============================================================================
// Individual Messaging Feature Toggles
// ============================================================================

export const toggleScheduleMessages = async (req, res) => {
  try {
    const { enable } = req.body;
    let features = await GBFeatures.findOne({ userId: req.user._id });
    if (!features) features = new GBFeatures({ userId: req.user._id });

    features.messaging.scheduleMessages = typeof enable === 'boolean' ? enable : !features.messaging.scheduleMessages;
    await features.save();

    res.json({
      success: true,
      message: `Scheduled messages ${features.messaging.scheduleMessages ? 'enabled' : 'disabled'}`,
      data: { scheduleMessages: features.messaging.scheduleMessages }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error toggling schedule messages', error: error.message });
  }
};

export const pinMessage = async (req, res) => {
  try {
    const { messageId, chatId } = req.body;
    if (!messageId || !chatId) {
      return res.status(400).json({ success: false, message: 'Message ID and Chat ID required' });
    }

    let features = await GBFeatures.findOne({ userId: req.user._id });
    if (!features) features = new GBFeatures({ userId: req.user._id });

    const alreadyPinned = features.messaging.pinnedMessages.some(p => p.messageId.toString() === messageId);
    if (alreadyPinned) {
      return res.status(400).json({ success: false, message: 'Message already pinned' });
    }

    features.messaging.pinnedMessages.push({ messageId, chatId, pinnedAt: new Date() });
    await features.save();

    res.json({ success: true, message: 'Message pinned successfully', data: { pinnedMessages: features.messaging.pinnedMessages } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error pinning message', error: error.message });
  }
};

export const unpinMessage = async (req, res) => {
  try {
    const { messageId } = req.body;
    if (!messageId) {
      return res.status(400).json({ success: false, message: 'Message ID required' });
    }

    let features = await GBFeatures.findOne({ userId: req.user._id });
    if (!features) features = new GBFeatures({ userId: req.user._id });

    features.messaging.pinnedMessages = features.messaging.pinnedMessages.filter(p => p.messageId.toString() !== messageId);
    await features.save();

    res.json({ success: true, message: 'Message unpinned successfully', data: { pinnedMessages: features.messaging.pinnedMessages } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error unpinning message', error: error.message });
  }
};

export const getPinnedMessages = async (req, res) => {
  try {
    let features = await GBFeatures.findOne({ userId: req.user._id });
    if (!features) {
      return res.json({ success: true, data: { pinnedMessages: [] } });
    }

    res.json({ success: true, data: { pinnedMessages: features.messaging.pinnedMessages } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching pinned messages', error: error.message });
  }
};

export const starMessage = async (req, res) => {
  try {
    const { messageId, chatId } = req.body;
    if (!messageId || !chatId) {
      return res.status(400).json({ success: false, message: 'Message ID and Chat ID required' });
    }

    let features = await GBFeatures.findOne({ userId: req.user._id });
    if (!features) features = new GBFeatures({ userId: req.user._id });

    const alreadyStarred = features.messaging.starredMessages.some(s => s.messageId.toString() === messageId);
    if (alreadyStarred) {
      return res.status(400).json({ success: false, message: 'Message already starred' });
    }

    features.messaging.starredMessages.push({ messageId, chatId, starredAt: new Date() });
    await features.save();

    res.json({ success: true, message: 'Message starred successfully', data: { starredMessages: features.messaging.starredMessages } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error starring message', error: error.message });
  }
};

export const unstarMessage = async (req, res) => {
  try {
    const { messageId } = req.body;
    if (!messageId) {
      return res.status(400).json({ success: false, message: 'Message ID required' });
    }

    let features = await GBFeatures.findOne({ userId: req.user._id });
    if (!features) features = new GBFeatures({ userId: req.user._id });

    features.messaging.starredMessages = features.messaging.starredMessages.filter(s => s.messageId.toString() !== messageId);
    await features.save();

    res.json({ success: true, message: 'Message unstarred successfully', data: { starredMessages: features.messaging.starredMessages } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error unstarring message', error: error.message });
  }
};

export const getStarredMessages = async (req, res) => {
  try {
    let features = await GBFeatures.findOne({ userId: req.user._id });
    if (!features) {
      return res.json({ success: true, data: { starredMessages: [] } });
    }

    res.json({ success: true, data: { starredMessages: features.messaging.starredMessages } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching starred messages', error: error.message });
  }
};

export const addChatFilter = async (req, res) => {
  try {
    const { name, chatIds, color } = req.body;
    if (!name || !chatIds) {
      return res.status(400).json({ success: false, message: 'Name and chat IDs required' });
    }

    let features = await GBFeatures.findOne({ userId: req.user._id });
    if (!features) features = new GBFeatures({ userId: req.user._id });

    const filterId = `filter_${Date.now()}`;
    features.messaging.chatFilters.push({ id: filterId, name, chatIds, color });
    await features.save();

    res.json({ success: true, message: 'Chat filter added', data: { chatFilters: features.messaging.chatFilters } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error adding chat filter', error: error.message });
  }
};

export const removeChatFilter = async (req, res) => {
  try {
    const { filterId } = req.body;
    if (!filterId) {
      return res.status(400).json({ success: false, message: 'Filter ID required' });
    }

    let features = await GBFeatures.findOne({ userId: req.user._id });
    if (!features) features = new GBFeatures({ userId: req.user._id });

    features.messaging.chatFilters = features.messaging.chatFilters.filter(f => f.id !== filterId);
    await features.save();

    res.json({ success: true, message: 'Chat filter removed', data: { chatFilters: features.messaging.chatFilters } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error removing chat filter', error: error.message });
  }
};

export const getChatFilters = async (req, res) => {
  try {
    let features = await GBFeatures.findOne({ userId: req.user._id });
    if (!features) {
      return res.json({ success: true, data: { chatFilters: [] } });
    }

    res.json({ success: true, data: { chatFilters: features.messaging.chatFilters } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching chat filters', error: error.message });
  }
};

// ============================================================================
// Individual Media Feature Toggles
// ============================================================================

export const toggleHDUpload = async (req, res) => {
  try {
    const { enable } = req.body;
    let features = await GBFeatures.findOne({ userId: req.user._id });
    if (!features) features = new GBFeatures({ userId: req.user._id });

    features.media.hdUpload = typeof enable === 'boolean' ? enable : !features.media.hdUpload;
    await features.save();

    res.json({
      success: true,
      message: `HD upload ${features.media.hdUpload ? 'enabled' : 'disabled'}`,
      data: { hdUpload: features.media.hdUpload }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error toggling HD upload', error: error.message });
  }
};

export const toggleMediaZoom = async (req, res) => {
  try {
    const { enable } = req.body;
    let features = await GBFeatures.findOne({ userId: req.user._id });
    if (!features) features = new GBFeatures({ userId: req.user._id });

    features.media.mediaZoom = typeof enable === 'boolean' ? enable : !features.media.mediaZoom;
    await features.save();

    res.json({
      success: true,
      message: `Media zoom ${features.media.mediaZoom ? 'enabled' : 'disabled'}`,
      data: { mediaZoom: features.media.mediaZoom }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error toggling media zoom', error: error.message });
  }
};

export const toggleGalleryViewer = async (req, res) => {
  try {
    const { enable } = req.body;
    let features = await GBFeatures.findOne({ userId: req.user._id });
    if (!features) features = new GBFeatures({ userId: req.user._id });

    features.media.galleryViewer = typeof enable === 'boolean' ? enable : !features.media.galleryViewer;
    await features.save();

    res.json({
      success: true,
      message: `Gallery viewer ${features.media.galleryViewer ? 'enabled' : 'disabled'}`,
      data: { galleryViewer: features.media.galleryViewer }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error toggling gallery viewer', error: error.message });
  }
};

export const toggleAutoSaveStatus = async (req, res) => {
  try {
    const { enable } = req.body;
    let features = await GBFeatures.findOne({ userId: req.user._id });
    if (!features) features = new GBFeatures({ userId: req.user._id });

    features.media.autoSaveStatus = typeof enable === 'boolean' ? enable : !features.media.autoSaveStatus;
    await features.save();

    res.json({
      success: true,
      message: `Auto-save status ${features.media.autoSaveStatus ? 'enabled' : 'disabled'}`,
      data: { autoSaveStatus: features.media.autoSaveStatus }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error toggling auto-save status', error: error.message });
  }
};

// ============================================================================
// Individual Group Feature Toggles
// ============================================================================

export const toggleJoinViaLink = async (req, res) => {
  try {
    const { enable } = req.body;
    let features = await GBFeatures.findOne({ userId: req.user._id });
    if (!features) features = new GBFeatures({ userId: req.user._id });

    features.groups.joinViaLink = typeof enable === 'boolean' ? enable : !features.groups.joinViaLink;
    await features.save();

    res.json({
      success: true,
      message: `Join via link ${features.groups.joinViaLink ? 'enabled' : 'disabled'}`,
      data: { joinViaLink: features.groups.joinViaLink }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error toggling join via link', error: error.message });
  }
};

export const toggleAutoJoinGroups = async (req, res) => {
  try {
    const { enable } = req.body;
    let features = await GBFeatures.findOne({ userId: req.user._id });
    if (!features) features = new GBFeatures({ userId: req.user._id });

    features.groups.autoJoinGroups = typeof enable === 'boolean' ? enable : !features.groups.autoJoinGroups;
    await features.save();

    res.json({
      success: true,
      message: `Auto-join groups ${features.groups.autoJoinGroups ? 'enabled' : 'disabled'}`,
      data: { autoJoinGroups: features.groups.autoJoinGroups }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error toggling auto-join groups', error: error.message });
  }
};

export const hideGroup = async (req, res) => {
  try {
    const { groupId } = req.body;
    if (!groupId) {
      return res.status(400).json({ success: false, message: 'Group ID required' });
    }

    let features = await GBFeatures.findOne({ userId: req.user._id });
    if (!features) features = new GBFeatures({ userId: req.user._id });

    if (!features.groups.hiddenGroups.includes(groupId)) {
      features.groups.hiddenGroups.push(groupId);
      await features.save();
    }

    res.json({ success: true, message: 'Group hidden successfully', data: { hiddenGroups: features.groups.hiddenGroups } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error hiding group', error: error.message });
  }
};

export const unhideGroup = async (req, res) => {
  try {
    const { groupId } = req.body;
    if (!groupId) {
      return res.status(400).json({ success: false, message: 'Group ID required' });
    }

    let features = await GBFeatures.findOne({ userId: req.user._id });
    if (!features) features = new GBFeatures({ userId: req.user._id });

    features.groups.hiddenGroups = features.groups.hiddenGroups.filter(id => id.toString() !== groupId);
    await features.save();

    res.json({ success: true, message: 'Group unhidden successfully', data: { hiddenGroups: features.groups.hiddenGroups } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error unhiding group', error: error.message });
  }
};

export const getHiddenGroups = async (req, res) => {
  try {
    let features = await GBFeatures.findOne({ userId: req.user._id });
    if (!features) {
      return res.json({ success: true, data: { hiddenGroups: [] } });
    }

    res.json({ success: true, data: { hiddenGroups: features.groups.hiddenGroups } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching hidden groups', error: error.message });
  }
};

// ============================================================================
// Individual Advanced Feature Toggles
// ============================================================================

export const toggleCopySentMessages = async (req, res) => {
  try {
    const { enable } = req.body;
    let features = await GBFeatures.findOne({ userId: req.user._id });
    if (!features) features = new GBFeatures({ userId: req.user._id });

    features.advanced.copySentMessages = typeof enable === 'boolean' ? enable : !features.advanced.copySentMessages;
    await features.save();

    res.json({
      success: true,
      message: `Copy sent messages ${features.advanced.copySentMessages ? 'enabled' : 'disabled'}`,
      data: { copySentMessages: features.advanced.copySentMessages }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error toggling copy sent messages', error: error.message });
  }
};

export const toggleExtendedStatusLimit = async (req, res) => {
  try {
    const { enable } = req.body;
    let features = await GBFeatures.findOne({ userId: req.user._id });
    if (!features) features = new GBFeatures({ userId: req.user._id });

    features.advanced.extendedStatusLimit = typeof enable === 'boolean' ? enable : !features.advanced.extendedStatusLimit;
    await features.save();

    res.json({
      success: true,
      message: `Extended status limit ${features.advanced.extendedStatusLimit ? 'enabled' : 'disabled'}`,
      data: { extendedStatusLimit: features.advanced.extendedStatusLimit }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error toggling extended status limit', error: error.message });
  }
};

export const toggleExactTimestamps = async (req, res) => {
  try {
    const { enable } = req.body;
    let features = await GBFeatures.findOne({ userId: req.user._id });
    if (!features) features = new GBFeatures({ userId: req.user._id });

    features.advanced.exactTimestamps = typeof enable === 'boolean' ? enable : !features.advanced.exactTimestamps;
    await features.save();

    res.json({
      success: true,
      message: `Exact timestamps ${features.advanced.exactTimestamps ? 'enabled' : 'disabled'}`,
      data: { exactTimestamps: features.advanced.exactTimestamps }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error toggling exact timestamps', error: error.message });
  }
};

export const toggleConfirmClearChats = async (req, res) => {
  try {
    const { enable } = req.body;
    let features = await GBFeatures.findOne({ userId: req.user._id });
    if (!features) features = new GBFeatures({ userId: req.user._id });

    features.advanced.confirmClearChats = typeof enable === 'boolean' ? enable : !features.advanced.confirmClearChats;
    await features.save();

    res.json({
      success: true,
      message: `Confirm clear chats ${features.advanced.confirmClearChats ? 'enabled' : 'disabled'}`,
      data: { confirmClearChats: features.advanced.confirmClearChats }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error toggling confirm clear chats', error: error.message });
  }
};

export const toggleArchiveOnSwipe = async (req, res) => {
  try {
    const { enable } = req.body;
    let features = await GBFeatures.findOne({ userId: req.user._id });
    if (!features) features = new GBFeatures({ userId: req.user._id });

    features.advanced.archiveOnSwipe = typeof enable === 'boolean' ? enable : !features.advanced.archiveOnSwipe;
    await features.save();

    res.json({
      success: true,
      message: `Archive on swipe ${features.advanced.archiveOnSwipe ? 'enabled' : 'disabled'}`,
      data: { archiveOnSwipe: features.advanced.archiveOnSwipe }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error toggling archive on swipe', error: error.message });
  }
};

export const toggleEnterToSend = async (req, res) => {
  try {
    const { enable } = req.body;
    let features = await GBFeatures.findOne({ userId: req.user._id });
    if (!features) features = new GBFeatures({ userId: req.user._id });

    features.advanced.enterToSend = typeof enable === 'boolean' ? enable : !features.advanced.enterToSend;
    await features.save();

    res.json({
      success: true,
      message: `Enter to send ${features.advanced.enterToSend ? 'enabled' : 'disabled'}`,
      data: { enterToSend: features.advanced.enterToSend }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error toggling enter to send', error: error.message });
  }
};

export const toggleDoubleTapToReply = async (req, res) => {
  try {
    const { enable } = req.body;
    let features = await GBFeatures.findOne({ userId: req.user._id });
    if (!features) features = new GBFeatures({ userId: req.user._id });

    features.advanced.doubleTapToReply = typeof enable === 'boolean' ? enable : !features.advanced.doubleTapToReply;
    await features.save();

    res.json({
      success: true,
      message: `Double tap to reply ${features.advanced.doubleTapToReply ? 'enabled' : 'disabled'}`,
      data: { doubleTapToReply: features.advanced.doubleTapToReply }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error toggling double tap to reply', error: error.message });
  }
};

// ============================================================================
// Get Statistics
// ============================================================================

export const getStats = async (req, res) => {
  try {
    let features = await GBFeatures.findOne({ userId: req.user._id });
    if (!features) {
      features = await GBFeatures.create({ userId: req.user._id });
    }

    res.json({
      success: true,
      data: { stats: features.stats }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching stats', error: error.message });
  }
};
