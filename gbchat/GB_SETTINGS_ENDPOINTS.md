# GB Settings API Endpoints

**Version:** 1.0.0  
**Last Updated:** March 10, 2026  
**Base URL:** `/api/gb-settings`

---

## Overview

This document describes all GB Settings API endpoints that have been added to GBChat. These endpoints provide comprehensive control over GB WhatsApp-specific features including privacy, customization, messaging, media, groups, and advanced settings.

---

## Authentication

All endpoints require Bearer token authentication:

```
Authorization: Bearer <your-jwt-token>
```

---

## Endpoints

### 📋 Get All GB Settings

**GET** `/api/gb-settings/`

Retrieve all GB settings for the authenticated user.

**Response:**
```json
{
  "success": true,
  "data": {
    "privacy": { ... },
    "customization": { ... },
    "messaging": { ... },
    "media": { ... },
    "groups": { ... },
    "advanced": { ... },
    "stats": { ... }
  }
}
```

---

### 🔄 Update All GB Settings

**PUT** `/api/gb-settings/`

Update multiple GB settings at once.

**Body:**
```json
{
  "privacy": { "hideBlueTicks": true },
  "customization": { "iconPack": "minimal" },
  "messaging": { "scheduleMessages": true },
  "media": { "hdUpload": true },
  "groups": { "joinViaLink": true },
  "advanced": { "enterToSend": true }
}
```

---

### 🔄 Reset GB Settings

**POST** `/api/gb-settings/reset`

Reset GB settings to defaults.

**Body (optional):**
```json
{
  "section": "privacy" // Reset specific section, omit to reset all
}
```

**Valid sections:** `privacy`, `customization`, `messaging`, `media`, `groups`, `advanced`

---

## Privacy Settings

### Get Privacy Settings

**GET** `/api/gb-settings/privacy`

**Response:**
```json
{
  "success": true,
  "data": {
    "privacy": {
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
  }
}
```

### Update Privacy Settings

**PUT** `/api/gb-settings/privacy`

**Body:**
```json
{
  "hideBlueTicks": true,
  "hideOnlineStatus": false,
  "antiRevoke": true
}
```

**Valid fields:**
- `hideOnlineStatus` (boolean)
- `freezeLastSeen` (boolean)
- `frozenLastSeenTime` (date)
- `hideBlueTicks` (boolean)
- `hideSecondTick` (boolean)
- `hideForwardLabel` (boolean)
- `antiStatusView` (boolean)
- `antiDeleteStatus` (boolean)
- `antiRevoke` (boolean)
- `viewOnceBypass` (boolean)
- `incognitoMode` (boolean)

---

## Theme/Customization Settings

### Get Theme Settings

**GET** `/api/gb-settings/themes`

**Response:**
```json
{
  "success": true,
  "data": {
    "customization": {
      "customTheme": {
        "enabled": false,
        "themeId": "default",
        "primaryColor": "#25D366",
        "secondaryColor": "#128C7E",
        "backgroundImage": "",
        "chatBubbles": "default"
      },
      "customFont": {
        "enabled": false,
        "fontFamily": "Inter",
        "fontSize": 14
      },
      "iconPack": "default",
      "widgetSettings": {
        "enabled": false,
        "widgetType": "chat",
        "showUnreadCount": true,
        "showProfilePicture": true
      }
    }
  }
}
```

### Update Theme Settings

**PUT** `/api/gb-settings/themes`

**Body:**
```json
{
  "customTheme": { "enabled": true, "primaryColor": "#0ea5e9" },
  "iconPack": "minimal"
}
```

### Set Theme

**POST** `/api/gb-settings/theme`

**Body:**
```json
{
  "themeId": "dark",
  "primaryColor": "#25D366",
  "secondaryColor": "#128C7E",
  "backgroundImage": "/wallpapers/abstract.jpg",
  "chatBubbles": "rounded"
}
```

### Set Font

**POST** `/api/gb-settings/font`

**Body:**
```json
{
  "fontFamily": "Roboto",
  "fontSize": 16,
  "enabled": true
}
```

### Set Icon Pack

**POST** `/api/gb-settings/icon-pack`

**Body:**
```json
{
  "iconPack": "minimal"
}
```

**Valid values:** `default`, `minimal`, `colorful`, `outline`

---

## Messaging Settings

### Get Messaging Settings

**GET** `/api/gb-settings/messaging`

**Response:**
```json
{
  "success": true,
  "data": {
    "messaging": {
      "scheduleMessages": true,
      "autoDelete": {
        "enabled": false,
        "timer": 24
      },
      "dndMode": {
        "enabled": false,
        "startTime": "22:00",
        "endTime": "07:00",
        "allowExceptions": true,
        "exceptionContacts": []
      }
    }
  }
}
```

### Update Messaging Settings

**PUT** `/api/gb-settings/messaging`

**Body:**
```json
{
  "scheduleMessages": true,
  "autoDelete": { "enabled": true, "timer": 48 },
  "dndMode": { "enabled": true, "startTime": "23:00", "endTime": "06:00" }
}
```

### Set Auto-Delete

**POST** `/api/gb-settings/auto-delete`

**Body:**
```json
{
  "enabled": true,
  "timer": 24
}
```

**Valid timer values:** `24`, `48`, `168`, `720` (hours)

### Set DND Mode

**POST** `/api/gb-settings/dnd`

**Body:**
```json
{
  "enabled": true,
  "startTime": "22:00",
  "endTime": "07:00",
  "allowExceptions": true,
  "exceptionContacts": ["user_id_1", "user_id_2"]
}
```

---

## Media Settings

### Get Media Settings

**GET** `/api/gb-settings/media`

**Response:**
```json
{
  "success": true,
  "data": {
    "media": {
      "hdUpload": true,
      "autoDownload": {
        "mobileData": {
          "photos": false,
          "videos": false,
          "audio": true,
          "documents": true
        },
        "wifi": {
          "photos": true,
          "videos": true,
          "audio": true,
          "documents": true
        }
      },
      "mediaZoom": true,
      "galleryViewer": true,
      "autoSaveStatus": false
    }
  }
}
```

### Update Media Settings

**PUT** `/api/gb-settings/media`

**Body:**
```json
{
  "hdUpload": true,
  "mediaZoom": true,
  "galleryViewer": false,
  "autoSaveStatus": true,
  "autoDownload": {
    "mobileData": { "photos": true, "videos": false }
  }
}
```

### Set Upload Quality

**POST** `/api/gb-settings/upload-quality`

**Body:**
```json
{
  "hdUpload": true
}
```

### Set Auto-Download

**POST** `/api/gb-settings/auto-download`

**Body:**
```json
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

**Valid networkType:** `mobileData`, `wifi`

---

## Group Settings

### Get Group Settings

**GET** `/api/gb-settings/groups`

**Response:**
```json
{
  "success": true,
  "data": {
    "groups": {
      "joinViaLink": true,
      "groupInfoCustomization": {
        "customGroupIcons": true,
        "groupDescription": true,
        "groupRules": true
      },
      "autoJoinGroups": false,
      "hiddenGroups": []
    }
  }
}
```

### Update Group Settings

**PUT** `/api/gb-settings/groups`

**Body:**
```json
{
  "joinViaLink": true,
  "autoJoinGroups": false,
  "groupInfoCustomization": {
    "customGroupIcons": true
  }
}
```

---

## Advanced Settings

### Get Advanced Settings

**GET** `/api/gb-settings/advanced`

**Response:**
```json
{
  "success": true,
  "data": {
    "advanced": {
      "copySentMessages": true,
      "extendedStatusLimit": true,
      "maxCallQuality": "HD",
      "exactTimestamps": false,
      "confirmClearChats": true,
      "archiveOnSwipe": false,
      "enterToSend": true,
      "doubleTapToReply": true
    }
  }
}
```

### Update Advanced Settings

**PUT** `/api/gb-settings/advanced`

**Body:**
```json
{
  "copySentMessages": true,
  "extendedStatusLimit": true,
  "maxCallQuality": "FHD",
  "exactTimestamps": true,
  "confirmClearChats": true,
  "archiveOnSwipe": true,
  "enterToSend": true,
  "doubleTapToReply": true
}
```

### Set Call Quality

**POST** `/api/gb-settings/call-quality`

**Body:**
```json
{
  "maxCallQuality": "HD"
}
```

**Valid values:** `SD`, `HD`, `FHD`

---

## Home Screen/Widget Settings

### Get Home Screen Settings

**GET** `/api/gb-settings/home-screen`

**Response:**
```json
{
  "success": true,
  "data": {
    "customization": {
      "widgetSettings": {
        "enabled": false,
        "widgetType": "chat",
        "showUnreadCount": true,
        "showProfilePicture": true
      }
    }
  }
}
```

### Update Home Screen Settings

**PUT** `/api/gb-settings/home-screen`

**Body:**
```json
{
  "widgetSettings": {
    "enabled": true,
    "widgetType": "stories",
    "showUnreadCount": true,
    "showProfilePicture": false
  }
}
```

---

## Error Responses

All endpoints return errors in the following format:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message (development only)"
}
```

### Common HTTP Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request successful |
| 400 | Bad Request | Invalid input parameters |
| 401 | Unauthorized | Missing or invalid token |
| 404 | Not Found | Resource not found |
| 500 | Internal Server Error | Server error |

---

## Quick Reference

### Settings Categories

| Category | Endpoint | Description |
|----------|----------|-------------|
| All Settings | `GET/PUT /` | Get/update all settings |
| Privacy | `/privacy` | Hide online status, blue ticks, etc. |
| Themes | `/themes` | Custom themes, fonts, icons |
| Messaging | `/messaging` | Auto-delete, DND, scheduling |
| Media | `/media` | Upload quality, auto-download |
| Groups | `/groups` | Group-related settings |
| Advanced | `/advanced` | Call quality, timestamps, etc. |
| Home Screen | `/home-screen` | Widget settings |

---

## Usage Examples

### JavaScript (Fetch API)

```javascript
// Get all GB settings
const response = await fetch('/api/gb-settings', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
const data = await response.json();

// Update privacy settings
await fetch('/api/gb-settings/privacy', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    hideBlueTicks: true,
    hideOnlineStatus: false
  })
});

// Set DND mode
await fetch('/api/gb-settings/dnd', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    enabled: true,
    startTime: '22:00',
    endTime: '07:00'
  })
});
```

### React Hook Example

```javascript
import { useEffect, useState } from 'react';

function useGBSettings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/gb-settings', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then(res => res.json())
      .then(data => {
        setSettings(data.data);
        setLoading(false);
      });
  }, []);

  const updateSettings = async (section, updates) => {
    const res = await fetch(`/api/gb-settings/${section}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(updates)
    });
    return res.json();
  };

  return { settings, loading, updateSettings };
}
```

---

## Files Added/Modified

### New Files
- `server/routes/gbSettingsRoutes.js` - Route definitions
- `server/controllers/gbSettingsController.js` - Controller logic

### Modified Files
- `server/index.js` - Registered new routes
- `client/src/index.css` - Fixed container scrolling
- `client/src/App.css` - Fixed root container styles
- `client/src/pages/GroupsPage.jsx` - Fixed missing icon import

---

**GBChat GB Settings API v1.0.0**  
**Built with ❤️ for Enhanced Messaging**
