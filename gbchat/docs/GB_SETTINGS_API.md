# GB Settings API Endpoints

Complete API documentation for GBChat enhanced settings (GB Settings).

## Base URL
```
/api/gb-settings
```

All endpoints require authentication via Bearer token in the `Authorization` header.

---

## Table of Contents

1. [General Settings](#general-settings)
2. [Privacy Settings](#privacy-settings)
3. [Theme/Customization Settings](#themecustomization-settings)
4. [Messaging Settings](#messaging-settings)
5. [Media Settings](#media-settings)
6. [Group Settings](#group-settings)
7. [Advanced Settings](#advanced-settings)
8. [Statistics](#statistics)

---

## General Settings

### Get All GB Settings
```http
GET /
```
**Response:** Complete GB settings object with all sections

### Update All GB Settings
```http
PUT /
Content-Type: application/json

{
  "privacy": { ... },
  "customization": { ... },
  "messaging": { ... },
  "media": { ... },
  "groups": { ... },
  "advanced": { ... }
}
```

### Reset GB Settings
```http
POST /reset
Content-Type: application/json

{
  "section": "privacy" // Optional - omit to reset all
}
```

---

## Privacy Settings

### Get Privacy Settings
```http
GET /privacy
```

### Update Privacy Settings
```http
PUT /privacy
Content-Type: application/json

{
  "hideOnlineStatus": false,
  "freezeLastSeen": false,
  "hideBlueTicks": false,
  "hideSecondTick": false,
  "hideForwardLabel": false,
  "antiStatusView": false,
  "antiDeleteStatus": false,
  "antiRevoke": false,
  "viewOnceBypass": false,
  "incognitoMode": false
}
```

### Toggle Online Status
```http
POST /privacy/online-status
Content-Type: application/json

{ "hide": true }
```

### Toggle Last Seen
```http
POST /privacy/last-seen
Content-Type: application/json

{ "freeze": true, "timestamp": "2024-01-01T00:00:00Z" }
```

### Toggle Read Receipts (Blue Ticks)
```http
POST /privacy/read-receipts
Content-Type: application/json

{ "hide": true }
```

### Toggle Delivery Receipts (Second Tick)
```http
POST /privacy/delivery-receipts
Content-Type: application/json

{ "hide": true }
```

### Toggle Forward Label
```http
POST /privacy/forward-label
Content-Type: application/json

{ "hide": true }
```

### Toggle Anti-Status View
```http
POST /privacy/anti-status-view
Content-Type: application/json

{ "enable": true }
```

### Toggle Anti-Delete Status
```http
POST /privacy/anti-delete-status
Content-Type: application/json

{ "enable": true }
```

### Toggle Anti-Revoke
```http
POST /privacy/anti-revoke
Content-Type: application/json

{ "enable": true }
```

### Toggle View Once Bypass
```http
POST /privacy/view-once-bypass
Content-Type: application/json

{ "enable": true }
```

### Toggle Incognito Mode
```http
POST /privacy/incognito-mode
Content-Type: application/json

{ "enable": true }
```

---

## Theme/Customization Settings

### Get Theme Settings
```http
GET /themes
```

### Update Theme Settings
```http
PUT /themes
Content-Type: application/json

{
  "customization": { ... }
}
```

### Set Custom Theme
```http
POST /theme
Content-Type: application/json

{
  "themeId": "dark",
  "primaryColor": "#25D366",
  "secondaryColor": "#128C7E",
  "backgroundImage": "url",
  "chatBubbles": "rounded"
}
```

### Set Custom Font
```http
POST /font
Content-Type: application/json

{
  "enabled": true,
  "fontFamily": "Inter",
  "fontSize": 14
}
```

### Set Icon Pack
```http
POST /icon-pack
Content-Type: application/json

{
  "iconPack": "minimal" // default, minimal, colorful, outline
}
```

### Toggle Custom Theme
```http
POST /themes/custom
Content-Type: application/json

{
  "enable": true,
  "themeData": {
    "primaryColor": "#25D366",
    "chatBubbles": "rounded"
  }
}
```

### Toggle Custom Font
```http
POST /themes/font
Content-Type: application/json

{
  "enable": true,
  "fontFamily": "Roboto",
  "fontSize": 16
}
```

### Set Widget Settings
```http
POST /themes/widget
Content-Type: application/json

{
  "enabled": true,
  "widgetType": "chat",
  "showUnreadCount": true,
  "showProfilePicture": true
}
```

### Get Home Screen Settings
```http
GET /home-screen
```

### Update Home Screen Settings
```http
PUT /home-screen
Content-Type: application/json

{
  "widgetSettings": { ... }
}
```

---

## Messaging Settings

### Get Messaging Settings
```http
GET /messaging
```

### Update Messaging Settings
```http
PUT /messaging
Content-Type: application/json

{
  "scheduleMessages": true,
  "autoDelete": { "enabled": false, "timer": 24 },
  "dndMode": { "enabled": false }
}
```

### Set Auto-Delete
```http
POST /auto-delete
Content-Type: application/json

{
  "enabled": true,
  "timer": 24 // 24, 48, 168, 720 hours
}
```

### Set DND Mode
```http
POST /dnd
Content-Type: application/json

{
  "enabled": true,
  "startTime": "22:00",
  "endTime": "07:00",
  "allowExceptions": true,
  "exceptionContacts": ["user_id_1", "user_id_2"]
}
```

### Toggle Schedule Messages
```http
POST /messaging/schedule
Content-Type: application/json

{ "enable": true }
```

### Get Pinned Messages
```http
GET /messaging/pinned
```

### Pin Message
```http
POST /messaging/pin
Content-Type: application/json

{
  "messageId": "...",
  "chatId": "..."
}
```

### Unpin Message
```http
POST /messaging/unpin
Content-Type: application/json

{ "messageId": "..." }
```

### Get Starred Messages
```http
GET /messaging/starred
```

### Star Message
```http
POST /messaging/star
Content-Type: application/json

{
  "messageId": "...",
  "chatId": "..."
}
```

### Unstar Message
```http
POST /messaging/unstar
Content-Type: application/json

{ "messageId": "..." }
```

### Get Chat Filters
```http
GET /messaging/filters
```

### Add Chat Filter
```http
POST /messaging/filter
Content-Type: application/json

{
  "name": "Work",
  "chatIds": ["chat1", "chat2"],
  "color": "#FF5722"
}
```

### Remove Chat Filter
```http
DELETE /messaging/filter
Content-Type: application/json

{ "filterId": "filter_1234567890" }
```

---

## Media Settings

### Get Media Settings
```http
GET /media
```

### Update Media Settings
```http
PUT /media
Content-Type: application/json

{
  "hdUpload": true,
  "autoDownload": { ... },
  "mediaZoom": true,
  "galleryViewer": true,
  "autoSaveStatus": false
}
```

### Set Upload Quality
```http
POST /upload-quality
Content-Type: application/json

{ "hdUpload": true }
```

### Set Auto-Download
```http
POST /auto-download
Content-Type: application/json

{
  "networkType": "wifi",
  "settings": {
    "photos": true,
    "videos": true,
    "audio": true,
    "documents": true
  }
}
```

### Toggle HD Upload
```http
POST /media/hd-upload
Content-Type: application/json

{ "enable": true }
```

### Toggle Media Zoom
```http
POST /media/zoom
Content-Type: application/json

{ "enable": true }
```

### Toggle Gallery Viewer
```http
POST /media/gallery-viewer
Content-Type: application/json

{ "enable": true }
```

### Toggle Auto-Save Status
```http
POST /media/auto-save-status
Content-Type: application/json

{ "enable": true }
```

---

## Group Settings

### Get Group Settings
```http
GET /groups
```

### Update Group Settings
```http
PUT /groups
Content-Type: application/json

{
  "joinViaLink": true,
  "autoJoinGroups": false
}
```

### Toggle Join Via Link
```http
POST /groups/join-via-link
Content-Type: application/json

{ "enable": true }
```

### Toggle Auto-Join Groups
```http
POST /groups/auto-join
Content-Type: application/json

{ "enable": true }
```

### Get Hidden Groups
```http
GET /groups/hidden
```

### Hide Group
```http
POST /groups/hide
Content-Type: application/json

{ "groupId": "..." }
```

### Unhide Group
```http
POST /groups/unhide
Content-Type: application/json

{ "groupId": "..." }
```

---

## Advanced Settings

### Get Advanced Settings
```http
GET /advanced
```

### Update Advanced Settings
```http
PUT /advanced
Content-Type: application/json

{
  "copySentMessages": true,
  "extendedStatusLimit": true,
  "maxCallQuality": "HD",
  "exactTimestamps": false,
  "confirmClearChats": true,
  "archiveOnSwipe": false,
  "enterToSend": true,
  "doubleTapToReply": true
}
```

### Set Call Quality
```http
POST /call-quality
Content-Type: application/json

{ "maxCallQuality": "HD" } // SD, HD, FHD
```

### Toggle Copy Sent Messages
```http
POST /advanced/copy-sent
Content-Type: application/json

{ "enable": true }
```

### Toggle Extended Status Limit
```http
POST /advanced/extended-status
Content-Type: application/json

{ "enable": true }
```

### Toggle Exact Timestamps
```http
POST /advanced/exact-timestamps
Content-Type: application/json

{ "enable": true }
```

### Toggle Confirm Clear Chats
```http
POST /advanced/confirm-clear
Content-Type: application/json

{ "enable": true }
```

### Toggle Archive on Swipe
```http
POST /advanced/archive-on-swipe
Content-Type: application/json

{ "enable": true }
```

### Toggle Enter to Send
```http
POST /advanced/enter-to-send
Content-Type: application/json

{ "enable": true }
```

### Toggle Double Tap to Reply
```http
POST /advanced/double-tap
Content-Type: application/json

{ "enable": true }
```

---

## Statistics

### Get Statistics
```http
GET /stats
```

**Response:**
```json
{
  "success": true,
  "data": {
    "stats": {
      "messagesScheduled": 5,
      "statusesSaved": 12,
      "messagesUnrevoked": 3,
      "customThemesUsed": 2
    }
  }
}
```

---

## Response Format

All responses follow this format:

### Success Response
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

---

## HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `500` - Internal Server Error

---

## Example Usage (JavaScript/Fetch)

```javascript
// Get all GB settings
const response = await fetch('/api/gb-settings', {
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN'
  }
});
const data = await response.json();

// Toggle online status
const toggleResponse = await fetch('/api/gb-settings/privacy/online-status', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ hide: true })
});
```
