# GBChat Settings API Endpoints

This document provides a comprehensive list of all API endpoints for settings features in GBChat.

## Base URL
```
/api
```

---

## Table of Contents

1. [Appearance Settings](#appearance-settings)
2. [Chat Settings](#chat-settings)
3. [Notification Settings](#notification-settings)
4. [Storage Settings](#storage-settings)
5. [Account Settings](#account-settings)
6. [Chat Display Settings](#chat-display-settings)

---

## Appearance Settings

**Base Route:** `/api/appearance`

### Get Appearance Settings
```http
GET /appearance/settings
```
**Description:** Retrieve current appearance settings for the authenticated user.

**Response:**
```json
{
  "success": true,
  "data": {
    "theme": "default",
    "wallpaper": "/wallpapers/default.jpg",
    "fontSize": "medium",
    "bubbleStyle": "modern",
    "chatBackground": ""
  }
}
```

### Update Appearance Settings
```http
PUT /appearance/settings
```
**Description:** Update multiple appearance settings at once.

**Body:**
```json
{
  "theme": "dark",
  "wallpaper": "/wallpapers/abstract.jpg",
  "fontSize": "large",
  "bubbleStyle": "rounded",
  "chatBackground": ""
}
```

### Get Available Themes
```http
GET /appearance/themes
```
**Description:** Get list of all available themes.

### Set Theme
```http
POST /appearance/theme
```
**Body:**
```json
{
  "themeId": "dark"
}
```

### Get Available Wallpapers
```http
GET /appearance/wallpapers
```
**Description:** Get list of all available wallpapers.

### Set Wallpaper
```http
POST /appearance/wallpaper
```
**Body:**
```json
{
  "wallpaperUrl": "/wallpapers/abstract.jpg",
  "isGlobal": true
}
```

### Upload Custom Wallpaper
```http
POST /appearance/wallpaper/upload
```
**Body:**
```json
{
  "wallpaperUrl": "data:image/jpeg;base64,..."
}
```

### Set Font Size
```http
POST /appearance/font-size
```
**Body:**
```json
{
  "fontSize": "large"
}
```
**Valid values:** `small`, `medium`, `large`, `xlarge`

### Set Bubble Style
```http
POST /appearance/bubble-style
```
**Body:**
```json
{
  "bubbleStyle": "rounded"
}
```
**Valid values:** `modern`, `classic`, `minimal`, `rounded`

### Set Chat Effects
```http
POST /appearance/chat-effects
```
**Body:**
```json
{
  "chatEffect": "particles"
}
```
**Valid values:** `none`, `particles`, `snow`, `hearts`, `stars`

### Set Message Animation
```http
POST /appearance/message-animation
```
**Body:**
```json
{
  "messageAnimation": "slide"
}
```
**Valid values:** `slide`, `fade`, `pop`, `none`

### Reset Appearance to Defaults
```http
POST /appearance/reset
```
**Description:** Reset all appearance settings to default values.

---

## Chat Settings

**Base Route:** `/api/chat-settings`

### Get Chat Settings
```http
GET /chat-settings
```
**Description:** Retrieve current chat settings.

**Response:**
```json
{
  "success": true,
  "data": {
    "enterToSend": true,
    "autoDownloadMedia": true,
    "autoPlayVideos": false,
    "showTypingIndicator": true,
    "showReadReceipts": true,
    "showOnlineStatus": true,
    "archiveOnMute": false,
    "saveToGallery": false,
    "mediaQuality": "auto"
  }
}
```

### Update Chat Settings
```http
PUT /chat-settings
```
**Description:** Update multiple chat settings at once.

### Set Media Quality
```http
POST /chat-settings/media-quality
```
**Body:**
```json
{
  "quality": "high"
}
```
**Valid values:** `auto`, `high`, `medium`, `low`

### Clear All Chats
```http
POST /chat-settings/clear-all
```
**Description:** Clear all messages from all chats.

### Export All Chats
```http
GET /chat-settings/export
```
**Description:** Export all chats as JSON file.

### Archive All Chats
```http
POST /chat-settings/archive-all
```
**Description:** Archive all chats.

### Get Global Wallpaper
```http
GET /chat-settings/global-wallpaper
```

### Set Global Wallpaper
```http
POST /chat-settings/global-wallpaper
```
**Body:**
```json
{
  "wallpaperUrl": "/wallpapers/default.jpg"
}
```

### Toggle Chat Setting
```http
POST /chat-settings/toggle/:setting
```
**Valid settings:** `enterToSend`, `autoDownloadMedia`, `autoPlayVideos`, `showTypingIndicator`, `showReadReceipts`, `showOnlineStatus`, `archiveOnMute`, `saveToGallery`

---

## Notification Settings

**Base Route:** `/api/notifications`

### Get Notification Settings
```http
GET /notifications/settings
```
**Description:** Retrieve current notification settings.

**Response:**
```json
{
  "success": true,
  "data": {
    "enabled": true,
    "sound": "default",
    "vibration": true,
    "desktop": true,
    "messagePreview": true,
    "groupMessages": true,
    "callNotifications": true,
    "storyNotifications": true,
    "channelNotifications": true,
    "dndMode": false,
    "dndStartTime": "22:00",
    "dndEndTime": "07:00",
    "dndAllowFrom": "nobody"
  }
}
```

### Update Notification Settings
```http
PUT /notifications/settings
```
**Description:** Update multiple notification settings at once.

### Toggle Notification
```http
POST /notifications/toggle/:setting
```
**Valid settings:** `messages`, `groups`, `calls`, `stories`, `channels`, `vibrate`, `desktop`, `messagePreview`

### Get Notification Sounds
```http
GET /notifications/sounds
```
**Description:** Get list of available notification sounds.

### Set Notification Sound
```http
POST /notifications/sound
```
**Body:**
```json
{
  "sound": "breeze"
}
```
**Valid values:** `default`, `none`, `chord`, `breeze`, `ripple`, `ping`, `note`

### Toggle DND Mode
```http
POST /notifications/dnd
```
**Body:**
```json
{
  "enabled": true,
  "startTime": "22:00",
  "endTime": "07:00",
  "allowFrom": "favorites"
}
```

### Set DND Schedule
```http
POST /notifications/dnd/schedule
```
**Body:**
```json
{
  "startTime": "23:00",
  "endTime": "06:00"
}
```

### Request Notification Permission
```http
POST /notifications/permission
```
**Description:** Request browser notification permission.

### Send Test Notification
```http
POST /notifications/test
```
**Description:** Send a test notification to verify settings.

---

## Storage Settings

**Base Route:** `/api/storage`

### Get Storage Usage
```http
GET /storage/usage
```
**Description:** Get detailed storage usage information.

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 5368709120,
    "used": 1234567890,
    "available": 4134141230,
    "breakdown": {
      "images": 524288000,
      "videos": 524288000,
      "documents": 104857600,
      "audio": 52428800,
      "other": 28703490
    },
    "chats": [
      {
        "_id": "...",
        "name": "John Doe",
        "avatar": "...",
        "storageUsed": 10485760,
        "messageCount": 150
      }
    ]
  }
}
```

### Clear Storage by Type
```http
DELETE /storage/clear/:type
```
**Valid types:** `images`, `videos`, `documents`, `audio`, `all`

### Clear Cache
```http
POST /storage/clear-cache
```
**Description:** Clear application cache.

### Clear Temporary Files
```http
POST /storage/clear-temp
```
**Description:** Clear temporary files.

### Get Network Usage
```http
GET /storage/network-usage
```
**Description:** Get network data usage statistics.

### Reset Network Statistics
```http
POST /storage/reset-network-stats
```
**Description:** Reset network usage statistics.

### Get Storage by Chat
```http
GET /storage/by-chat
```
**Description:** Get storage usage broken down by chat.

---

## Account Settings

**Base Route:** `/api/account`

### Get Account Settings
```http
GET /account/settings
```
**Description:** Retrieve complete account settings including profile, privacy, and theme.

**Response:**
```json
{
  "success": true,
  "data": {
    "profile": {
      "fullName": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "avatar": "...",
      "about": "Hey there!"
    },
    "privacy": {
      "lastSeen": "everyone",
      "avatar": "everyone",
      "about": "everyone",
      "readReceipts": true,
      "onlineStatus": true
    },
    "theme": {
      "name": "default",
      "wallpaper": "",
      "fontSize": "medium"
    }
  }
}
```

### Update Account Settings
```http
PUT /account/settings
```
**Description:** Update multiple account settings at once.

### Update Profile
```http
PUT /account/profile
```
**Body:**
```json
{
  "fullName": "John Doe",
  "about": "New about text",
  "avatar": "data:image/jpeg;base64,..."
}
```

### Change Password
```http
POST /account/change-password
```
**Body:**
```json
{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword123"
}
```

### Enable Two-Factor Authentication
```http
POST /account/2fa/enable
```
**Body:**
```json
{
  "method": "email"
}
```

### Verify Two-Factor Authentication
```http
POST /account/2fa/verify
```
**Body:**
```json
{
  "otp": "123456"
}
```

### Disable Two-Factor Authentication
```http
POST /account/2fa/disable
```
**Body:**
```json
{
  "password": "yourpassword123"
}
```

### Get Active Sessions
```http
GET /account/sessions
```
**Description:** Get list of all active sessions.

### Logout from Session
```http
POST /account/sessions/logout/:sessionId
```
**Description:** Logout from a specific session.

### Logout from All Sessions
```http
POST /account/sessions/logout-all
```
**Description:** Logout from all sessions except current.

### Deactivate Account
```http
POST /account/deactivate
```
**Body:**
```json
{
  "password": "yourpassword123",
  "reason": "Taking a break"
}
```

### Reactivate Account
```http
POST /account/reactivate
```
**Description:** Reactivate a deactivated account.

### Delete Account
```http
DELETE /account
```
**Body:**
```json
{
  "password": "yourpassword123"
}
```
**Description:** Permanently delete account.

### Export Account Data
```http
GET /account/export
```
**Description:** Export all account data as JSON file.

---

## Chat Display Settings

**Base Route:** `/api/chat-display`

### Get Chat Display Settings
```http
GET /chat-display/settings
```
**Description:** Retrieve chat display settings including status icons, network indicators, and appearance.

**Response:**
```json
{
  "success": true,
  "data": {
    "hideBlueTicks": false,
    "hideSecondTick": false,
    "hideForwardLabel": false,
    "showNetworkIndicator": true,
    "showConnectionQuality": true,
    "showTypingIndicator": true,
    "showOnlineStatus": true,
    "exactTimestamps": false,
    "showLastSeenExact": false,
    "showDeliveryTime": false,
    "bubbleStyle": "modern",
    "fontSize": "medium",
    "theme": "default"
  }
}
```

### Update Chat Display Settings
```http
PUT /chat-display/settings
```
**Description:** Update multiple chat display settings at once.

### Toggle Status Icon
```http
POST /chat-display/toggle-status/:setting
```
**Valid settings:** `hideBlueTicks`, `hideSecondTick`, `hideForwardLabel`

### Toggle Network Indicator
```http
POST /chat-display/toggle-network/:setting
```
**Valid settings:** `showNetworkIndicator`, `showConnectionQuality`, `showTypingIndicator`, `showOnlineStatus`

### Toggle Timestamp Setting
```http
POST /chat-display/toggle-timestamp/:setting
```
**Valid settings:** `exactTimestamps`, `showLastSeenExact`, `showDeliveryTime`

### Set Bubble Style
```http
POST /chat-display/bubble-style
```
**Body:**
```json
{
  "style": "modern"
}
```

### Set Font Size
```http
POST /chat-display/font-size
```
**Body:**
```json
{
  "size": "large"
}
```

### Set Theme
```http
POST /chat-display/theme
```
**Body:**
```json
{
  "themeId": "dark"
}
```

### Reset Chat Display Settings
```http
POST /chat-display/reset
```
**Description:** Reset all chat display settings to defaults.

---

## Authentication

All endpoints require authentication via Bearer token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Error Responses

All endpoints return errors in the following format:

```json
{
  "success": false,
  "message": "Error description"
}
```

Common HTTP status codes:
- `200` - Success
- `400` - Bad Request (invalid input)
- `401` - Unauthorized (missing or invalid token)
- `404` - Not Found
- `500` - Internal Server Error

---

## Quick Reference

### Settings Categories

| Category | Base Route | Description |
|----------|-----------|-------------|
| Appearance | `/api/appearance` | Themes, wallpapers, fonts, effects |
| Chat | `/api/chat-settings` | Chat behavior, media quality |
| Notifications | `/api/notifications` | Notification preferences, DND |
| Storage | `/api/storage` | Storage management, cleanup |
| Account | `/api/account` | Profile, password, 2FA, sessions |
| Chat Display | `/api/chat-display` | Message display, status icons |

---

**Version:** 1.0.0  
**Last Updated:** March 5, 2026
