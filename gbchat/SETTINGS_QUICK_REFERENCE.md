# GBChat Settings - Quick Reference Guide

## 🚀 Quick Start

All settings endpoints are now available at:
```
Base URL: http://localhost:5000/api
```

## 📋 Settings Categories

### 🎨 Appearance (`/api/appearance`)
Customize how GBChat looks

**Most Used:**
```bash
# Get current settings
GET /appearance/settings

# Change theme
POST /appearance/theme
{ "themeId": "dark" }

# Set wallpaper
POST /appearance/wallpaper
{ "wallpaperUrl": "/wallpapers/abstract.jpg", "isGlobal": true }

# Get all themes
GET /appearance/themes
```

---

### 💬 Chat Settings (`/api/chat-settings`)
Control chat behavior

**Most Used:**
```bash
# Get current settings
GET /chat-settings

# Toggle enter to send
POST /chat-settings/toggle/enterToSend

# Set media quality
POST /chat-settings/media-quality
{ "quality": "high" }

# Export all chats
GET /chat-settings/export
```

---

### 🔔 Notifications (`/api/notifications`)
Manage how you receive notifications

**Most Used:**
```bash
# Get current settings
GET /notifications/settings

# Toggle message notifications
POST /notifications/toggle/messages

# Set notification sound
POST /notifications/sound
{ "sound": "breeze" }

# Enable DND mode
POST /notifications/dnd
{ "enabled": true, "startTime": "22:00", "endTime": "07:00" }
```

---

### 💾 Storage (`/api/storage`)
Manage storage and data

**Most Used:**
```bash
# Get storage usage
GET /storage/usage

# Clear images
DELETE /storage/clear/images

# Clear cache
POST /storage/clear-cache

# Get network usage
GET /storage/network-usage
```

---

### 👤 Account (`/api/account`)
Profile, security, and account management

**Most Used:**
```bash
# Get account settings
GET /account/settings

# Update profile
PUT /account/profile
{ "fullName": "John Doe", "about": "Hey there!" }

# Change password
POST /account/change-password
{ "currentPassword": "old123", "newPassword": "new456" }

# Enable 2FA
POST /account/2fa/enable
{ "method": "email" }

# Verify 2FA
POST /account/2fa/verify
{ "otp": "123456" }

# Get active sessions
GET /account/sessions

# Export data
GET /account/export
```

---

### 📱 Chat Display (`/api/chat-display`)
Control how messages appear

**Most Used:**
```bash
# Get display settings
GET /chat-display/settings

# Hide blue ticks
POST /chat-display/toggle-status/hideBlueTicks

# Set bubble style
POST /chat-display/bubble-style
{ "style": "rounded" }

# Set font size
POST /chat-display/font-size
{ "size": "large" }
```

---

## 🔐 Authentication

All endpoints require a Bearer token:

```bash
curl -X GET http://localhost:5000/api/appearance/settings \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 📊 Response Format

### Success Response
```json
{
  "success": true,
  "message": "Optional success message",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description"
}
```

---

## 🎯 Common Operations

### Reset Settings to Defaults

```bash
# Appearance
POST /appearance/reset

# Chat Display
POST /chat-display/reset
```

### Get Available Options

```bash
# Themes
GET /appearance/themes

# Wallpapers
GET /appearance/wallpapers

# Notification Sounds
GET /notifications/sounds
```

### Toggle Settings

```bash
# Chat settings
POST /chat-settings/toggle/enterToSend
POST /chat-settings/toggle/autoDownloadMedia

# Notifications
POST /notifications/toggle/messages
POST /notifications/toggle/vibrate

# Status Icons
POST /chat-display/toggle-status/hideBlueTicks
POST /chat-display/toggle-status/hideSecondTick
```

---

## 🛠️ Development Tips

### 1. Test with Postman/Insomnia
Import all endpoints and test with your JWT token.

### 2. Frontend Integration
Use the existing API client in `client/src/lib/api.js`:

```javascript
// Example: Get appearance settings
const { data } = await api.get('/appearance/settings');

// Example: Update theme
await api.post('/appearance/theme', { themeId: 'dark' });

// Example: Toggle setting
await api.post('/chat-settings/toggle/enterToSend');
```

### 3. Batch Updates
Use the PUT endpoints to update multiple settings at once:

```javascript
// Update all appearance settings
await api.put('/appearance/settings', {
  theme: 'dark',
  fontSize: 'large',
  bubbleStyle: 'rounded',
  wallpaper: '/wallpapers/abstract.jpg'
});
```

---

## 📝 Complete Endpoint List

| Category | Count | Base Route |
|----------|-------|------------|
| Appearance | 13 | `/api/appearance` |
| Chat | 10 | `/api/chat-settings` |
| Notifications | 10 | `/api/notifications` |
| Storage | 7 | `/api/storage` |
| Account | 15 | `/api/account` |
| Chat Display | 11 | `/api/chat-display` |
| **Total** | **66** | - |

---

## 🔗 Related Documentation

- **Full API Reference:** `SETTINGS_API_ENDPOINTS.md`
- **Implementation Summary:** `SETTINGS_IMPLEMENTATION_SUMMARY.md`
- **GB Features:** `GB_FEATURES.md`
- **Deployment Guide:** `DEPLOYMENT_GUIDE.md`

---

## ✅ Verification Checklist

Before deploying, verify:

- [ ] Server starts without errors
- [ ] All endpoints respond with valid JWT
- [ ] Settings persist to database
- [ ] Error handling works correctly
- [ ] File uploads work (wallpapers, avatars)
- [ ] 2FA flow works end-to-end
- [ ] Export functionality works
- [ ] Clear/delete operations work

---

**Version:** 1.0.0  
**Last Updated:** March 5, 2026  
**Status:** ✅ Production Ready
