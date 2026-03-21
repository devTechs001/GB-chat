import Permission from '../models/Permission.model.js';

// ============================================================================
// Get All Permissions
// ============================================================================

export const getAllPermissions = async (req, res) => {
  try {
    let permissions = await Permission.findOne({ userId: req.user._id });

    if (!permissions) {
      permissions = await Permission.create({ userId: req.user._id });
    }

    res.json({
      success: true,
      data: {
        devicePermissions: permissions.devicePermissions,
        featurePermissions: permissions.featurePermissions,
        privacyPermissions: permissions.privacyPermissions,
        blockedUsers: permissions.blockedUsers
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching permissions',
      error: error.message
    });
  }
};

// ============================================================================
// Update Device Permissions
// ============================================================================

export const updateDevicePermissions = async (req, res) => {
  try {
    const { permissions, device } = req.body;

    let permissionDoc = await Permission.findOne({ userId: req.user._id });

    if (!permissionDoc) {
      permissionDoc = new Permission({ userId: req.user._id });
    }

    // Update each permission
    for (const [key, value] of Object.entries(permissions)) {
      if (permissionDoc.devicePermissions[key]) {
        permissionDoc.devicePermissions[key].granted = value.granted;
        permissionDoc.devicePermissions[key].lastRequested = new Date();
        permissionDoc.devicePermissions[key].requestCount += 1;
        
        if (value.granted) {
          permissionDoc.devicePermissions[key].grantedAt = new Date();
        }

        // Add to history
        permissionDoc.permissionHistory.push({
          permissionType: key,
          action: value.granted ? 'granted' : 'denied',
          timestamp: new Date(),
          device: device || 'unknown'
        });
      }
    }

    await permissionDoc.save();

    res.json({
      success: true,
      message: 'Device permissions updated successfully',
      data: { devicePermissions: permissionDoc.devicePermissions }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating device permissions',
      error: error.message
    });
  }
};

// ============================================================================
// Update Feature Permissions
// ============================================================================

export const updateFeaturePermissions = async (req, res) => {
  try {
    const { featurePermissions } = req.body;

    let permissionDoc = await Permission.findOne({ userId: req.user._id });

    if (!permissionDoc) {
      permissionDoc = new Permission({ userId: req.user._id });
    }

    const validFeatures = Object.keys(permissionDoc.featurePermissions);
    
    for (const [key, value] of Object.entries(featurePermissions)) {
      if (validFeatures.includes(key)) {
        permissionDoc.featurePermissions[key] = value;
      }
    }

    await permissionDoc.save();

    res.json({
      success: true,
      message: 'Feature permissions updated successfully',
      data: { featurePermissions: permissionDoc.featurePermissions }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating feature permissions',
      error: error.message
    });
  }
};

// ============================================================================
// Update Privacy Permissions
// ============================================================================

export const updatePrivacyPermissions = async (req, res) => {
  try {
    const { privacyPermissions } = req.body;

    let permissionDoc = await Permission.findOne({ userId: req.user._id });

    if (!permissionDoc) {
      permissionDoc = new Permission({ userId: req.user._id });
    }

    const validPrivacyFields = Object.keys(permissionDoc.privacyPermissions);
    
    for (const [key, value] of Object.entries(privacyPermissions)) {
      if (validPrivacyFields.includes(key)) {
        permissionDoc.privacyPermissions[key] = value;
      }
    }

    await permissionDoc.save();

    res.json({
      success: true,
      message: 'Privacy permissions updated successfully',
      data: { privacyPermissions: permissionDoc.privacyPermissions }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating privacy permissions',
      error: error.message
    });
  }
};

// ============================================================================
// Individual Device Permission Toggles
// ============================================================================

export const toggleContactPermission = async (req, res) => {
  try {
    const { granted, device } = req.body;
    let permissionDoc = await Permission.findOne({ userId: req.user._id });
    if (!permissionDoc) permissionDoc = new Permission({ userId: req.user._id });

    permissionDoc.devicePermissions.contacts.granted = granted;
    permissionDoc.devicePermissions.contacts.lastRequested = new Date();
    permissionDoc.devicePermissions.contacts.requestCount += 1;
    if (granted) permissionDoc.devicePermissions.contacts.grantedAt = new Date();
    
    permissionDoc.permissionHistory.push({
      permissionType: 'contacts',
      action: granted ? 'granted' : 'denied',
      timestamp: new Date(),
      device: device || 'unknown'
    });

    await permissionDoc.save();

    res.json({
      success: true,
      message: `Contacts permission ${granted ? 'granted' : 'denied'}`,
      data: { contacts: permissionDoc.devicePermissions.contacts }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating contacts permission', error: error.message });
  }
};

export const toggleCameraPermission = async (req, res) => {
  try {
    const { granted, device } = req.body;
    let permissionDoc = await Permission.findOne({ userId: req.user._id });
    if (!permissionDoc) permissionDoc = new Permission({ userId: req.user._id });

    permissionDoc.devicePermissions.camera.granted = granted;
    permissionDoc.devicePermissions.camera.lastRequested = new Date();
    permissionDoc.devicePermissions.camera.requestCount += 1;
    if (granted) permissionDoc.devicePermissions.camera.grantedAt = new Date();
    
    permissionDoc.permissionHistory.push({
      permissionType: 'camera',
      action: granted ? 'granted' : 'denied',
      timestamp: new Date(),
      device: device || 'unknown'
    });

    await permissionDoc.save();

    res.json({
      success: true,
      message: `Camera permission ${granted ? 'granted' : 'denied'}`,
      data: { camera: permissionDoc.devicePermissions.camera }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating camera permission', error: error.message });
  }
};

export const toggleMicrophonePermission = async (req, res) => {
  try {
    const { granted, device } = req.body;
    let permissionDoc = await Permission.findOne({ userId: req.user._id });
    if (!permissionDoc) permissionDoc = new Permission({ userId: req.user._id });

    permissionDoc.devicePermissions.microphone.granted = granted;
    permissionDoc.devicePermissions.microphone.lastRequested = new Date();
    permissionDoc.devicePermissions.microphone.requestCount += 1;
    if (granted) permissionDoc.devicePermissions.microphone.grantedAt = new Date();
    
    permissionDoc.permissionHistory.push({
      permissionType: 'microphone',
      action: granted ? 'granted' : 'denied',
      timestamp: new Date(),
      device: device || 'unknown'
    });

    await permissionDoc.save();

    res.json({
      success: true,
      message: `Microphone permission ${granted ? 'granted' : 'denied'}`,
      data: { microphone: permissionDoc.devicePermissions.microphone }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating microphone permission', error: error.message });
  }
};

export const toggleMediaPermission = async (req, res) => {
  try {
    const { granted, device } = req.body;
    let permissionDoc = await Permission.findOne({ userId: req.user._id });
    if (!permissionDoc) permissionDoc = new Permission({ userId: req.user._id });

    permissionDoc.devicePermissions.mediaLibrary.granted = granted;
    permissionDoc.devicePermissions.mediaLibrary.lastRequested = new Date();
    permissionDoc.devicePermissions.mediaLibrary.requestCount += 1;
    if (granted) permissionDoc.devicePermissions.mediaLibrary.grantedAt = new Date();
    
    permissionDoc.permissionHistory.push({
      permissionType: 'mediaLibrary',
      action: granted ? 'granted' : 'denied',
      timestamp: new Date(),
      device: device || 'unknown'
    });

    await permissionDoc.save();

    res.json({
      success: true,
      message: `Media library permission ${granted ? 'granted' : 'denied'}`,
      data: { mediaLibrary: permissionDoc.devicePermissions.mediaLibrary }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating media permission', error: error.message });
  }
};

export const togglePhotosPermission = async (req, res) => {
  try {
    const { granted, device } = req.body;
    let permissionDoc = await Permission.findOne({ userId: req.user._id });
    if (!permissionDoc) permissionDoc = new Permission({ userId: req.user._id });

    permissionDoc.devicePermissions.photos.granted = granted;
    permissionDoc.devicePermissions.photos.lastRequested = new Date();
    permissionDoc.devicePermissions.photos.requestCount += 1;
    if (granted) permissionDoc.devicePermissions.photos.grantedAt = new Date();
    
    permissionDoc.permissionHistory.push({
      permissionType: 'photos',
      action: granted ? 'granted' : 'denied',
      timestamp: new Date(),
      device: device || 'unknown'
    });

    await permissionDoc.save();

    res.json({
      success: true,
      message: `Photos permission ${granted ? 'granted' : 'denied'}`,
      data: { photos: permissionDoc.devicePermissions.photos }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating photos permission', error: error.message });
  }
};

export const toggleStoragePermission = async (req, res) => {
  try {
    const { granted, device } = req.body;
    let permissionDoc = await Permission.findOne({ userId: req.user._id });
    if (!permissionDoc) permissionDoc = new Permission({ userId: req.user._id });

    permissionDoc.devicePermissions.storage.granted = granted;
    permissionDoc.devicePermissions.storage.lastRequested = new Date();
    permissionDoc.devicePermissions.storage.requestCount += 1;
    if (granted) permissionDoc.devicePermissions.storage.grantedAt = new Date();
    
    permissionDoc.permissionHistory.push({
      permissionType: 'storage',
      action: granted ? 'granted' : 'denied',
      timestamp: new Date(),
      device: device || 'unknown'
    });

    await permissionDoc.save();

    res.json({
      success: true,
      message: `Storage permission ${granted ? 'granted' : 'denied'}`,
      data: { storage: permissionDoc.devicePermissions.storage }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating storage permission', error: error.message });
  }
};

export const toggleLocationPermission = async (req, res) => {
  try {
    const { granted, accuracy, device } = req.body;
    let permissionDoc = await Permission.findOne({ userId: req.user._id });
    if (!permissionDoc) permissionDoc = new Permission({ userId: req.user._id });

    permissionDoc.devicePermissions.location.granted = granted;
    permissionDoc.devicePermissions.location.lastRequested = new Date();
    permissionDoc.devicePermissions.location.requestCount += 1;
    if (granted) {
      permissionDoc.devicePermissions.location.grantedAt = new Date();
      if (accuracy) permissionDoc.devicePermissions.location.accuracy = accuracy;
    }
    
    permissionDoc.permissionHistory.push({
      permissionType: 'location',
      action: granted ? 'granted' : 'denied',
      timestamp: new Date(),
      device: device || 'unknown'
    });

    await permissionDoc.save();

    res.json({
      success: true,
      message: `Location permission ${granted ? 'granted' : 'denied'}`,
      data: { location: permissionDoc.devicePermissions.location }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating location permission', error: error.message });
  }
};

export const toggleNotificationPermission = async (req, res) => {
  try {
    const { granted, settings, device } = req.body;
    let permissionDoc = await Permission.findOne({ userId: req.user._id });
    if (!permissionDoc) permissionDoc = new Permission({ userId: req.user._id });

    permissionDoc.devicePermissions.notifications.granted = granted;
    permissionDoc.devicePermissions.notifications.lastRequested = new Date();
    permissionDoc.devicePermissions.notifications.requestCount += 1;
    if (granted) permissionDoc.devicePermissions.notifications.grantedAt = new Date();
    
    if (settings) {
      permissionDoc.devicePermissions.notifications.settings = {
        ...permissionDoc.devicePermissions.notifications.settings,
        ...settings
      };
    }
    
    permissionDoc.permissionHistory.push({
      permissionType: 'notifications',
      action: granted ? 'granted' : 'denied',
      timestamp: new Date(),
      device: device || 'unknown'
    });

    await permissionDoc.save();

    res.json({
      success: true,
      message: `Notifications permission ${granted ? 'granted' : 'denied'}`,
      data: { notifications: permissionDoc.devicePermissions.notifications }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating notifications permission', error: error.message });
  }
};

// ============================================================================
// Block/Unblock Users
// ============================================================================

export const blockUser = async (req, res) => {
  try {
    const { userId, reason } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID required' });
    }

    let permissionDoc = await Permission.findOne({ userId: req.user._id });
    if (!permissionDoc) permissionDoc = new Permission({ userId: req.user._id });

    await permissionDoc.blockUser(userId, reason);

    res.json({
      success: true,
      message: 'User blocked successfully',
      data: { blockedUsers: permissionDoc.blockedUsers }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error blocking user', error: error.message });
  }
};

export const unblockUser = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID required' });
    }

    let permissionDoc = await Permission.findOne({ userId: req.user._id });
    if (!permissionDoc) permissionDoc = new Permission({ userId: req.user._id });

    await permissionDoc.unblockUser(userId);

    res.json({
      success: true,
      message: 'User unblocked successfully',
      data: { blockedUsers: permissionDoc.blockedUsers }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error unblocking user', error: error.message });
  }
};

export const getBlockedUsers = async (req, res) => {
  try {
    let permissionDoc = await Permission.findOne({ userId: req.user._id });
    if (!permissionDoc) {
      return res.json({ success: true, data: { blockedUsers: [] } });
    }

    res.json({
      success: true,
      data: { blockedUsers: permissionDoc.blockedUsers }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching blocked users', error: error.message });
  }
};

// ============================================================================
// Get Permission History
// ============================================================================

export const getPermissionHistory = async (req, res) => {
  try {
    let permissionDoc = await Permission.findOne({ userId: req.user._id });
    if (!permissionDoc) {
      return res.json({ success: true, data: { history: [] } });
    }

    res.json({
      success: true,
      data: { history: permissionDoc.permissionHistory }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching permission history', error: error.message });
  }
};

// ============================================================================
// Reset All Permissions
// ============================================================================

export const resetPermissions = async (req, res) => {
  try {
    const { section } = req.body; // 'device', 'feature', 'privacy', or all

    let permissionDoc = await Permission.findOne({ userId: req.user._id });
    if (!permissionDoc) {
      permissionDoc = new Permission({ userId: req.user._id });
    }

    const defaults = {
      devicePermissions: {
        contacts: { granted: false },
        camera: { granted: false },
        microphone: { granted: false },
        mediaLibrary: { granted: false },
        photos: { granted: false },
        storage: { granted: false },
        location: { granted: false },
        notifications: { granted: true },
        bluetooth: { granted: false },
        nearbyDevices: { granted: false },
        calendar: { granted: false },
        phone: { granted: false },
        sms: { granted: false }
      },
      featurePermissions: {
        voiceMessages: true,
        videoCalls: true,
        locationSharing: true,
        fileSharing: true,
        screenSharing: true,
        readReceipts: true,
        typingIndicator: true,
        lastSeen: true,
        profilePhoto: true,
        statusUpdates: true
      },
      privacyPermissions: {
        whoCanSeeOnline: 'everyone',
        whoCanSeeLastSeen: 'everyone',
        whoCanSeeProfilePhoto: 'everyone',
        whoCanSeeStatus: 'everyone',
        whoCanAddToGroups: 'everyone',
        whoCanCall: 'everyone',
        readReceipts: true,
        typingIndicator: true
      }
    };

    if (section) {
      if (defaults[section]) {
        permissionDoc[section] = defaults[section];
      } else {
        return res.status(400).json({ success: false, message: 'Invalid section' });
      }
    } else {
      permissionDoc.devicePermissions = defaults.devicePermissions;
      permissionDoc.featurePermissions = defaults.featurePermissions;
      permissionDoc.privacyPermissions = defaults.privacyPermissions;
      permissionDoc.blockedUsers = [];
    }

    await permissionDoc.save();

    res.json({
      success: true,
      message: `Permissions ${section ? `for ${section}` : 'all'} reset successfully`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error resetting permissions', error: error.message });
  }
};
