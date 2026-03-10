import GBFeatures from '../models/GBFeatures.model.js';

// ============================================================================
// GB Privacy Settings
// ============================================================================

export const getPrivacySettings = async (req, res) => {
  try {
    let features = await GBFeatures.findOne({ userId: req.user._id });

    if (!features) {
      features = await GBFeatures.create({ userId: req.user._id });
    }

    res.json({
      success: true,
      data: {
        privacy: features.privacy
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching privacy settings',
      error: error.message
    });
  }
};

export const updatePrivacySettings = async (req, res) => {
  try {
    const privacyUpdates = req.body;

    let features = await GBFeatures.findOne({ userId: req.user._id });

    if (!features) {
      features = new GBFeatures({ userId: req.user._id });
    }

    // Update privacy fields
    const validPrivacyFields = [
      'hideOnlineStatus', 'freezeLastSeen', 'frozenLastSeenTime',
      'hideBlueTicks', 'hideSecondTick', 'hideForwardLabel',
      'antiStatusView', 'antiDeleteStatus', 'antiRevoke',
      'viewOnceBypass', 'incognitoMode'
    ];

    for (const [key, value] of Object.entries(privacyUpdates)) {
      if (validPrivacyFields.includes(key)) {
        features.privacy[key] = value;
      }
    }
    await features.save();

    res.json({
      success: true,
      message: 'Privacy settings updated successfully',
      data: { privacy: features.privacy }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating privacy settings',
      error: error.message
    });
  }
};

// ============================================================================
// GB Theme/Customization Settings
// ============================================================================

export const getThemeSettings = async (req, res) => {
  try {
    let features = await GBFeatures.findOne({ userId: req.user._id });

    if (!features) {
      features = await GBFeatures.create({ userId: req.user._id });
    }

    res.json({
      success: true,
      data: {
        customization: features.customization
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching theme settings',
      error: error.message
    });
  }
};

export const updateThemeSettings = async (req, res) => {
  try {
    const { customization } = req.body;

    let features = await GBFeatures.findOne({ userId: req.user._id });

    if (!features) {
      features = new GBFeatures({ userId: req.user._id });
    }

    features.customization = { ...features.customization, ...customization };
    await features.save();

    res.json({
      success: true,
      message: 'Theme settings updated successfully',
      data: { customization: features.customization }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating theme settings',
      error: error.message
    });
  }
};

export const setTheme = async (req, res) => {
  try {
    const { themeId, primaryColor, secondaryColor, backgroundImage, chatBubbles } = req.body;

    let features = await GBFeatures.findOne({ userId: req.user._id });

    if (!features) {
      features = new GBFeatures({ userId: req.user._id });
    }

    features.customization.customTheme = { ...features.customization.customTheme };

    if (themeId) features.customization.customTheme.themeId = themeId;
    if (primaryColor) features.customization.customTheme.primaryColor = primaryColor;
    if (secondaryColor) features.customization.customTheme.secondaryColor = secondaryColor;
    if (backgroundImage) features.customization.customTheme.backgroundImage = backgroundImage;
    if (chatBubbles) features.customization.customTheme.chatBubbles = chatBubbles;

    await features.save();

    res.json({
      success: true,
      message: 'Theme updated successfully',
      data: { customTheme: features.customization.customTheme }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error setting theme',
      error: error.message
    });
  }
};

export const setFont = async (req, res) => {
  try {
    const { fontFamily, fontSize, enabled } = req.body;

    let features = await GBFeatures.findOne({ userId: req.user._id });

    if (!features) {
      features = new GBFeatures({ userId: req.user._id });
    }

    features.customization.customFont = { ...features.customization.customFont };

    if (typeof enabled === 'boolean') features.customization.customFont.enabled = enabled;
    if (fontFamily) features.customization.customFont.fontFamily = fontFamily;
    if (fontSize) features.customization.customFont.fontSize = fontSize;
    await features.save();

    res.json({
      success: true,
      message: 'Font settings updated successfully',
      data: { customFont: features.customization.customFont }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error setting font',
      error: error.message
    });
  }
};

export const setIconPack = async (req, res) => {
  try {
    const { iconPack } = req.body;

    if (!iconPack || !['default', 'minimal', 'colorful', 'outline'].includes(iconPack)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid icon pack. Must be default, minimal, colorful, or outline'
      });
    }

    let features = await GBFeatures.findOne({ userId: req.user._id });

    if (!features) {
      features = new GBFeatures({ userId: req.user._id });
    }

    features.customization.iconPack = iconPack;
    await features.save();

    res.json({
      success: true,
      message: 'Icon pack updated successfully',
      data: { iconPack }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error setting icon pack',
      error: error.message
    });
  }
};

// ============================================================================
// GB Messaging Settings
// ============================================================================

export const getMessagingSettings = async (req, res) => {
  try {
    let features = await GBFeatures.findOne({ userId: req.user._id });

    if (!features) {
      features = await GBFeatures.create({ userId: req.user._id });
    }

    res.json({
      success: true,
      data: {
        messaging: {
          scheduleMessages: features.messaging.scheduleMessages,
          autoDelete: features.messaging.autoDelete,
          dndMode: features.messaging.dndMode
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching messaging settings',
      error: error.message
    });
  }
};

export const updateMessagingSettings = async (req, res) => {
  try {
    const { scheduleMessages, autoDelete, dndMode } = req.body;

    let features = await GBFeatures.findOne({ userId: req.user._id });

    if (!features) {
      features = new GBFeatures({ userId: req.user._id });
    }

    if (typeof scheduleMessages === 'boolean') features.messaging.scheduleMessages = scheduleMessages;
    if (autoDelete) features.messaging.autoDelete = { ...features.messaging.autoDelete, ...autoDelete };
    if (dndMode) features.messaging.dndMode = { ...features.messaging.dndMode, ...dndMode };
    await features.save();

    res.json({
      success: true,
      message: 'Messaging settings updated successfully',
      data: { messaging: features.messaging }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating messaging settings',
      error: error.message
    });
  }
};

export const setAutoDelete = async (req, res) => {
  try {
    const { enabled, timer } = req.body;

    let features = await GBFeatures.findOne({ userId: req.user._id });

    if (!features) {
      features = new GBFeatures({ userId: req.user._id });
    }

    features.messaging.autoDelete = { ...features.messaging.autoDelete };

    if (typeof enabled === 'boolean') features.messaging.autoDelete.enabled = enabled;
    if (timer && [24, 48, 168, 720].includes(timer)) features.messaging.autoDelete.timer = timer;
    await features.save();

    res.json({
      success: true,
      message: 'Auto-delete settings updated successfully',
      data: { autoDelete: features.messaging.autoDelete }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error setting auto-delete',
      error: error.message
    });
  }
};

export const setDNDMode = async (req, res) => {
  try {
    const { enabled, startTime, endTime, allowExceptions, exceptionContacts } = req.body;

    let features = await GBFeatures.findOne({ userId: req.user._id });

    if (!features) {
      features = new GBFeatures({ userId: req.user._id });
    }

    features.messaging.dndMode = { ...features.messaging.dndMode };

    if (typeof enabled === 'boolean') features.messaging.dndMode.enabled = enabled;
    if (startTime) features.messaging.dndMode.startTime = startTime;
    if (endTime) features.messaging.dndMode.endTime = endTime;
    if (typeof allowExceptions === 'boolean') features.messaging.dndMode.allowExceptions = allowExceptions;
    if (exceptionContacts) features.messaging.dndMode.exceptionContacts = exceptionContacts;
    await features.save();

    res.json({
      success: true,
      message: 'DND mode updated successfully',
      data: { dndMode: features.messaging.dndMode }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error setting DND mode',
      error: error.message
    });
  }
};

// ============================================================================
// GB Media Settings
// ============================================================================

export const getMediaSettings = async (req, res) => {
  try {
    let features = await GBFeatures.findOne({ userId: req.user._id });

    if (!features) {
      features = await GBFeatures.create({ userId: req.user._id });
    }

    res.json({
      success: true,
      data: {
        media: features.media
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching media settings',
      error: error.message
    });
  }
};

export const updateMediaSettings = async (req, res) => {
  try {
    const { hdUpload, autoDownload, mediaZoom, galleryViewer, autoSaveStatus } = req.body;

    let features = await GBFeatures.findOne({ userId: req.user._id });

    if (!features) {
      features = new GBFeatures({ userId: req.user._id });
    }

    if (typeof hdUpload === 'boolean') features.media.hdUpload = hdUpload;
    if (autoDownload) features.media.autoDownload = { ...features.media.autoDownload, ...autoDownload };
    if (typeof mediaZoom === 'boolean') features.media.mediaZoom = mediaZoom;
    if (typeof galleryViewer === 'boolean') features.media.galleryViewer = galleryViewer;
    if (typeof autoSaveStatus === 'boolean') features.media.autoSaveStatus = autoSaveStatus;
    await features.save();

    res.json({
      success: true,
      message: 'Media settings updated successfully',
      data: { media: features.media }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating media settings',
      error: error.message
    });
  }
};

export const setUploadQuality = async (req, res) => {
  try {
    const { hdUpload } = req.body;

    let features = await GBFeatures.findOne({ userId: req.user._id });

    if (!features) {
      features = new GBFeatures({ userId: req.user._id });
    }

    features.media.hdUpload = hdUpload;
    await features.save();

    res.json({
      success: true,
      message: 'Upload quality updated successfully',
      data: { hdUpload }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error setting upload quality',
      error: error.message
    });
  }
};

export const setAutoDownload = async (req, res) => {
  try {
    const { networkType, settings } = req.body;

    if (!networkType || !['mobileData', 'wifi'].includes(networkType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid network type. Must be mobileData or wifi'
      });
    }

    let features = await GBFeatures.findOne({ userId: req.user._id });

    if (!features) {
      features = new GBFeatures({ userId: req.user._id });
    }

    features.media.autoDownload[networkType] = {
      ...features.media.autoDownload[networkType],
      ...settings
    };
    await features.save();

    res.json({
      success: true,
      message: 'Auto-download settings updated successfully',
      data: { autoDownload: features.media.autoDownload }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error setting auto-download',
      error: error.message
    });
  }
};

// ============================================================================
// GB Group Settings
// ============================================================================

export const getGroupSettings = async (req, res) => {
  try {
    let features = await GBFeatures.findOne({ userId: req.user._id });

    if (!features) {
      features = await GBFeatures.create({ userId: req.user._id });
    }

    res.json({
      success: true,
      data: {
        groups: features.groups
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching group settings',
      error: error.message
    });
  }
};

export const updateGroupSettings = async (req, res) => {
  try {
    const { groups } = req.body;

    let features = await GBFeatures.findOne({ userId: req.user._id });

    if (!features) {
      features = new GBFeatures({ userId: req.user._id });
    }

    features.groups = { ...features.groups, ...groups };
    await features.save();

    res.json({
      success: true,
      message: 'Group settings updated successfully',
      data: { groups: features.groups }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating group settings',
      error: error.message
    });
  }
};

// ============================================================================
// GB Advanced Settings
// ============================================================================

export const getAdvancedSettings = async (req, res) => {
  try {
    let features = await GBFeatures.findOne({ userId: req.user._id });

    if (!features) {
      features = await GBFeatures.create({ userId: req.user._id });
    }

    res.json({
      success: true,
      data: {
        advanced: features.advanced
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching advanced settings',
      error: error.message
    });
  }
};

export const updateAdvancedSettings = async (req, res) => {
  try {
    const advancedUpdates = req.body;

    let features = await GBFeatures.findOne({ userId: req.user._id });

    if (!features) {
      features = new GBFeatures({ userId: req.user._id });
    }

    const validAdvancedFields = [
      'copySentMessages', 'extendedStatusLimit', 'maxCallQuality',
      'exactTimestamps', 'confirmClearChats', 'archiveOnSwipe',
      'enterToSend', 'doubleTapToReply'
    ];

    for (const [key, value] of Object.entries(advancedUpdates)) {
      if (validAdvancedFields.includes(key)) {
        features.advanced[key] = value;
      }
    }
    await features.save();

    res.json({
      success: true,
      message: 'Advanced settings updated successfully',
      data: { advanced: features.advanced }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating advanced settings',
      error: error.message
    });
  }
};

export const setCallQuality = async (req, res) => {
  try {
    const { maxCallQuality } = req.body;

    if (!maxCallQuality || !['SD', 'HD', 'FHD'].includes(maxCallQuality)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid quality. Must be SD, HD, or FHD'
      });
    }

    let features = await GBFeatures.findOne({ userId: req.user._id });

    if (!features) {
      features = new GBFeatures({ userId: req.user._id });
    }

    features.advanced.maxCallQuality = maxCallQuality;
    await features.save();

    res.json({
      success: true,
      message: 'Maximum call quality updated successfully',
      data: { maxCallQuality }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error setting call quality',
      error: error.message
    });
  }
};

// ============================================================================
// GB Home Screen/Widget Settings
// ============================================================================

export const getHomeScreenSettings = async (req, res) => {
  try {
    let features = await GBFeatures.findOne({ userId: req.user._id });

    if (!features) {
      features = await GBFeatures.create({ userId: req.user._id });
    }

    res.json({
      success: true,
      data: {
        customization: {
          widgetSettings: features.customization.widgetSettings
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching home screen settings',
      error: error.message
    });
  }
};

export const updateHomeScreenSettings = async (req, res) => {
  try {
    const { widgetSettings } = req.body;

    let features = await GBFeatures.findOne({ userId: req.user._id });

    if (!features) {
      features = new GBFeatures({ userId: req.user._id });
    }

    features.customization.widgetSettings = { ...features.customization.widgetSettings, ...widgetSettings };
    await features.save();

    res.json({
      success: true,
      message: 'Home screen settings updated successfully',
      data: { widgetSettings: features.customization.widgetSettings }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating home screen settings',
      error: error.message
    });
  }
};

// ============================================================================
// Get All GB Settings
// ============================================================================

export const getAllGBSettings = async (req, res) => {
  try {
    let features = await GBFeatures.findOne({ userId: req.user._id });

    if (!features) {
      features = await GBFeatures.create({ userId: req.user._id });
    }

    res.json({
      success: true,
      data: {
        privacy: features.privacy,
        customization: features.customization,
        messaging: features.messaging,
        media: features.media,
        groups: features.groups,
        advanced: features.advanced,
        stats: features.stats
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching GB settings',
      error: error.message
    });
  }
};

// ============================================================================
// Update All GB Settings
// ============================================================================

export const updateAllGBSettings = async (req, res) => {
  try {
    const { privacy, customization, messaging, media, groups, advanced, stats } = req.body;

    let features = await GBFeatures.findOne({ userId: req.user._id });

    if (!features) {
      features = new GBFeatures({ userId: req.user._id });
    }

    if (privacy) features.privacy = { ...features.privacy, ...privacy };
    if (customization) features.customization = { ...features.customization, ...customization };
    if (messaging) features.messaging = { ...features.messaging, ...messaging };
    if (media) features.media = { ...features.media, ...media };
    if (groups) features.groups = { ...features.groups, ...groups };
    if (advanced) features.advanced = { ...features.advanced, ...advanced };
    if (stats) features.stats = { ...features.stats, ...stats };

    await features.save();

    res.json({
      success: true,
      message: 'All GB settings updated successfully',
      data: {
        privacy: features.privacy,
        customization: features.customization,
        messaging: features.messaging,
        media: features.media,
        groups: features.groups,
        advanced: features.advanced,
        stats: features.stats
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating all GB settings',
      error: error.message
    });
  }
};

// ============================================================================
// Reset GB Settings
// ============================================================================

export const resetGBSettings = async (req, res) => {
  try {
    const { section } = req.body;

    let features = await GBFeatures.findOne({ userId: req.user._id });

    if (!features) {
      features = new GBFeatures({ userId: req.user._id });
    }

    const defaultSections = {
      privacy: {},
      customization: {
        customTheme: { enabled: false, primaryColor: '#25D366' },
        customFont: { enabled: false, fontFamily: 'Inter', fontSize: 14 },
        iconPack: 'default',
        widgetSettings: { enabled: false, widgetType: 'chat', showUnreadCount: true, showProfilePicture: true }
      },
      messaging: {
        scheduleMessages: true,
        autoDelete: { enabled: false, timer: 24 },
        dndMode: { enabled: false }
      },
      media: {
        hdUpload: true,
        autoDownload: {
          mobileData: { photos: false, videos: false, audio: true, documents: true },
          wifi: { photos: true, videos: true, audio: true, documents: true }
        }
      },
      groups: {
        joinViaLink: true,
        autoJoinGroups: false
      },
      advanced: {
        copySentMessages: true,
        extendedStatusLimit: true,
        maxCallQuality: 'HD',
        exactTimestamps: false,
        confirmClearChats: true,
        archiveOnSwipe: false,
        enterToSend: true,
        doubleTapToReply: true
      }
    };

    if (section) {
      // Reset specific section to defaults
      if (defaultSections[section]) {
        features[section] = defaultSections[section];
      } else {
        return res.status(400).json({
          success: false,
          message: 'Invalid section'
        });
      }
    } else {
      // Reset all sections
      features.privacy = defaultSections.privacy;
      features.customization = defaultSections.customization;
      features.messaging = defaultSections.messaging;
      features.media = defaultSections.media;
      features.groups = defaultSections.groups;
      features.advanced = defaultSections.advanced;
      features.stats = { messagesScheduled: 0, statusesSaved: 0, messagesUnrevoked: 0, customThemesUsed: 0 };
    }

    await features.save();

    res.json({
      success: true,
      message: `GB settings ${section ? `for ${section}` : 'all'} reset successfully`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error resetting GB settings',
      error: error.message
    });
  }
};
