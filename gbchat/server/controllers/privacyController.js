// controllers/privacyController.js
import PrivacySettings from '../models/PrivacySettings.model.js';
import User from '../models/User.js';
import asyncHandler from 'express-async-handler';

// @desc    Get privacy settings
// @route   GET /api/privacy/settings
// @access  Private
export const getPrivacySettings = asyncHandler(async (req, res) => {
    let settings = await PrivacySettings.findOne({ userId: req.user._id });
    
    if (!settings) {
        // Create default settings
        settings = await PrivacySettings.create({
            userId: req.user._id,
            ...PrivacySettings.getDefaults()
        });
    }
    
    res.json({ success: true, settings });
});

// @desc    Update privacy settings
// @route   PUT /api/privacy/settings
// @access  Private
export const updatePrivacySettings = asyncHandler(async (req, res) => {
    const settings = await PrivacySettings.findOneAndUpdate(
        { userId: req.user._id },
        req.body,
        { new: true, upsert: true, runValidators: true }
    );
    
    res.json({ success: true, settings });
});

// @desc    Block contact
// @route   POST /api/privacy/block/:userId
// @access  Private
export const blockContact = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { reason } = req.body;
    
    const settings = await PrivacySettings.findOne({ userId: req.user._id });
    if (!settings) {
        return res.status(404).json({ success: false, message: 'Settings not found' });
    }
    
    // Check if already blocked
    const alreadyBlocked = settings.blockedContacts.find(
        c => c.userId.toString() === userId
    );
    
    if (alreadyBlocked) {
        return res.status(400).json({ success: false, message: 'User already blocked' });
    }
    
    settings.blockedContacts.push({
        userId,
        reason: reason || '',
        blockedAt: new Date()
    });
    
    await settings.save();
    
    res.json({ success: true, message: 'User blocked successfully' });
});

// @desc    Unblock contact
// @route   POST /api/privacy/unblock/:userId
// @access  Private
export const unblockContact = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    
    const settings = await PrivacySettings.findOne({ userId: req.user._id });
    if (!settings) {
        return res.status(404).json({ success: false, message: 'Settings not found' });
    }
    
    settings.blockedContacts = settings.blockedContacts.filter(
        c => c.userId.toString() !== userId
    );
    
    await settings.save();
    
    res.json({ success: true, message: 'User unblocked successfully' });
});

// @desc    Get blocked contacts
// @route   GET /api/privacy/blocked
// @access  Private
export const getBlockedContacts = asyncHandler(async (req, res) => {
    const settings = await PrivacySettings.findOne({ userId: req.user._id });
    if (!settings) {
        return res.json({ success: true, blocked: [] });
    }
    
    const blocked = settings.blockedContacts;
    
    res.json({ success: true, blocked });
});

// @desc    Check if user is blocked
// @route   GET /api/privacy/is-blocked/:userId
// @access  Private
export const checkIfBlocked = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    
    const settings = await PrivacySettings.findOne({ userId: req.user._id });
    if (!settings) {
        return res.json({ success: true, isBlocked: false });
    }
    
    const isBlocked = settings.blockedContacts.some(
        c => c.userId.toString() === userId
    );
    
    res.json({ success: true, isBlocked });
});

// @desc    Enable/disable disappearing messages
// @route   POST /api/privacy/disappearing-messages
// @access  Private
export const toggleDisappearingMessages = asyncHandler(async (req, res) => {
    const { enabled, duration } = req.body;
    
    const settings = await PrivacySettings.findOneAndUpdate(
        { userId: req.user._id },
        {
            'messages.disappearingMessages.enabled': enabled,
            'messages.disappearingMessages.duration': duration || 604800
        },
        { new: true, upsert: true }
    );
    
    res.json({ success: true, settings });
});

// @desc    Update last seen privacy
// @route   POST /api/privacy/last-seen
// @access  Private
export const updateLastSeenPrivacy = asyncHandler(async (req, res) => {
    const { visible, customExclude } = req.body;
    
    const settings = await PrivacySettings.findOneAndUpdate(
        { userId: req.user._id },
        {
            'lastSeen.visible': visible,
            'lastSeen.customExclude': customExclude || []
        },
        { new: true, upsert: true }
    );
    
    res.json({ success: true, settings });
});

// @desc    Update who can add to groups
// @route   POST /api/privacy/groups
// @access  Private
export const updateGroupPrivacy = asyncHandler(async (req, res) => {
    const { whoCanAdd, customExclude } = req.body;
    
    const settings = await PrivacySettings.findOneAndUpdate(
        { userId: req.user._id },
        {
            'groups.whoCanAdd': whoCanAdd,
            'groups.customExclude': customExclude || []
        },
        { new: true, upsert: true }
    );
    
    res.json({ success: true, settings });
});

// @desc    Enable two-factor authentication
// @route   POST /api/privacy/2fa/enable
// @access  Private
export const enable2FA = asyncHandler(async (req, res) => {
    const { method, pin } = req.body;
    
    const settings = await PrivacySettings.findOneAndUpdate(
        { userId: req.user._id },
        {
            'security.twoFactorAuth.enabled': true,
            'security.twoFactorAuth.method': method || 'sms',
            'security.twoFactorAuth.pin': pin // Should be hashed
        },
        { new: true, upsert: true }
    );
    
    res.json({ success: true, message: '2FA enabled successfully' });
});

// @desc    Disable two-factor authentication
// @route   POST /api/privacy/2fa/disable
// @access  Private
export const disable2FA = asyncHandler(async (req, res) => {
    const settings = await PrivacySettings.findOneAndUpdate(
        { userId: req.user._id },
        {
            'security.twoFactorAuth.enabled': false
        },
        { new: true }
    );
    
    res.json({ success: true, message: '2FA disabled successfully' });
});
