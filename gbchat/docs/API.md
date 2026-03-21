# GBChat API Documentation

Complete API reference for GBChat messaging platform.

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Users](#users)
4. [Chats & Messages](#chats--messages)
5. [Groups](#groups)
6. [GB Features](#gb-features)
7. [Settings](#settings)
8. [Permissions](#permissions)
9. [Backup & Recovery](#backup--recovery)
10. [Stories & Channels](#stories--channels)
11. [Calls](#calls)
12. [Contacts](#contacts)
13. [Error Handling](#error-handling)

---

## Overview

### Base URLs

| Environment | URL |
|-------------|-----|
| Development | `http://localhost:5000/api` |
| Production | `https://gb-chat-backend.onrender.com/api` |

### Authentication

All protected endpoints require JWT authentication:

```http
Authorization: Bearer <your-jwt-token>
```

### Response Format

```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

### Error Format

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

---

## Authentication

### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890"
    },
    "token": "jwt_token_here"
  }
}
```

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

### Forgot Password
```http
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "john@example.com"
}
```

### Reset Password
```http
POST /api/auth/reset-password
Content-Type: application/json

{
  "token": "reset_token",
  "password": "newpassword123"
}
```

### Change Password
```http
POST /api/auth/change-password
Authorization: Bearer <token>
Content-Type: application/json

{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword123"
}
```

---

## Users

### Get All Users
```http
GET /api/users
Authorization: Bearer <token>
```

### Get User by ID
```http
GET /api/users/:id
Authorization: Bearer <token>
```

### Update User
```http
PUT /api/users/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Name",
  "bio": "New bio"
}
```

### Update Avatar
```http
PUT /api/users/:id/avatar
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: <image_file>
```

### Delete User
```http
DELETE /api/users/:id
Authorization: Bearer <token>
```

### Get User Status
```http
GET /api/users/:id/status
Authorization: Bearer <token>
```

### Update Status
```http
PUT /api/users/:id/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "Hey there! I'm using GBChat",
  "statusType": "text"
}
```

---

## Chats & Messages

### Get All Chats
```http
GET /api/chats
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)
- `search` - Search term
- `archived` - Include archived chats

### Create Chat
```http
POST /api/chats
Authorization: Bearer <token>
Content-Type: application/json

{
  "userId": "user_id",
  "message": "Hello!"
}
```

### Get Chat by ID
```http
GET /api/chats/:id
Authorization: Bearer <token>
```

### Get Chat Messages
```http
GET /api/chats/:id/messages
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` - Page number
- `limit` - Messages per page
- `before` - Get messages before this ID
- `after` - Get messages after this ID

### Send Message
```http
POST /api/messages
Authorization: Bearer <token>
Content-Type: application/json

{
  "chatId": "chat_id",
  "content": "Message content",
  "type": "text",
  "replyTo": "message_id"
}
```

**Message Types:**
- `text` - Text message
- `image` - Image
- `video` - Video
- `audio` - Voice message
- `document` - File
- `location` - Location
- `contact` - Contact card

### Update Message
```http
PUT /api/messages/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "Updated content"
}
```

### Delete Message
```http
DELETE /api/messages/:id
Authorization: Bearer <token>
```

### Mark as Read
```http
POST /api/messages/:id/read
Authorization: Bearer <token>
```

### React to Message
```http
POST /api/messages/:id/react
Authorization: Bearer <token>
Content-Type: application/json

{
  "reaction": "👍"
}
```

### Forward Message
```http
POST /api/messages/:id/forward
Authorization: Bearer <token>
Content-Type: application/json

{
  "chatIds": ["chat_id_1", "chat_id_2"]
}
```

### Reply to Message
```http
POST /api/messages
Authorization: Bearer <token>
Content-Type: application/json

{
  "chatId": "chat_id",
  "content": "Reply content",
  "replyTo": "message_id"
}
```

### Schedule Message
```http
POST /api/messages/schedule
Authorization: Bearer <token>
Content-Type: application/json

{
  "chatId": "chat_id",
  "content": "Scheduled message",
  "sendAt": "2026-03-22T10:00:00Z"
}
```

---

## Groups

### Get All Groups
```http
GET /api/groups
Authorization: Bearer <token>
```

### Create Group
```http
POST /api/groups
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "My Group",
  "description": "Group description",
  "members": ["user_id_1", "user_id_2"],
  "icon": "icon_url"
}
```

### Get Group by ID
```http
GET /api/groups/:id
Authorization: Bearer <token>
```

### Update Group
```http
PUT /api/groups/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Name",
  "description": "New description"
}
```

### Update Group Icon
```http
PUT /api/groups/:id/icon
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: <image_file>
```

### Add Member
```http
POST /api/groups/:id/add
Authorization: Bearer <token>
Content-Type: application/json

{
  "userId": "user_id"
}
```

### Remove Member
```http
POST /api/groups/:id/remove
Authorization: Bearer <token>
Content-Type: application/json

{
  "userId": "user_id"
}
```

### Leave Group
```http
POST /api/groups/:id/leave
Authorization: Bearer <token>
```

### Make Admin
```http
POST /api/groups/:id/make-admin
Authorization: Bearer <token>
Content-Type: application/json

{
  "userId": "user_id"
}
```

### Remove Admin
```http
POST /api/groups/:id/remove-admin
Authorization: Bearer <token>
Content-Type: application/json

{
  "userId": "user_id"
}
```

### Get Group Members
```http
GET /api/groups/:id/members
Authorization: Bearer <token>
```

### Get Group Messages
```http
GET /api/groups/:id/messages
Authorization: Bearer <token>
```

### Delete Group
```http
DELETE /api/groups/:id
Authorization: Bearer <token>
```

---

## GB Features

### Get GB Settings
```http
GET /api/gb-settings
Authorization: Bearer <token>
```

### Update GB Settings
```http
PUT /api/gb-settings
Authorization: Bearer <token>
Content-Type: application/json

{
  "privacy": {
    "hideOnlineStatus": true,
    "hideLastSeen": true,
    "hideProfilePhoto": false,
    "hideStatus": false,
    "antiDelete": true,
    "antiRevoke": true
  },
  "theme": {
    "customTheme": true,
    "primaryColor": "#25D366",
    "darkMode": true
  },
  "messaging": {
    "scheduleMessage": true,
    "autoDelete": true,
    "dndMode": false
  }
}
```

### Get Privacy Settings
```http
GET /api/gb-settings/privacy
Authorization: Bearer <token>
```

### Update Privacy Settings
```http
PUT /api/gb-settings/privacy
Authorization: Bearer <token>
Content-Type: application/json

{
  "hideOnlineStatus": true,
  "hideLastSeen": true,
  "hideProfilePhoto": false,
  "antiDelete": true,
  "antiRevoke": true
}
```

### Get Theme Settings
```http
GET /api/gb-settings/theme
Authorization: Bearer <token>
```

### Update Theme Settings
```http
PUT /api/gb-settings/theme
Authorization: Bearer <token>
Content-Type: application/json

{
  "customTheme": true,
  "primaryColor": "#25D366",
  "accentColor": "#128C7E",
  "darkMode": true,
  "chatWallpaper": "wallpaper_url"
}
```

### Get Messaging Settings
```http
GET /api/gb-settings/messaging
Authorization: Bearer <token>
```

### Update Messaging Settings
```http
PUT /api/gb-settings/messaging
Authorization: Bearer <token>
Content-Type: application/json

{
  "scheduleMessage": true,
  "autoDelete": true,
  "autoDeleteTimer": 3600,
  "dndMode": false,
  "dndStart": "22:00",
  "dndEnd": "07:00"
}
```

---

## Settings

### Get All Settings
```http
GET /api/settings
Authorization: Bearer <token>
```

### Update Settings
```http
PUT /api/settings
Authorization: Bearer <token>
Content-Type: application/json

{
  "notifications": { ... },
  "privacy": { ... },
  "chat": { ... },
  "appearance": { ... }
}
```

### Get Appearance Settings
```http
GET /api/settings/appearance
Authorization: Bearer <token>
```

### Update Appearance Settings
```http
PUT /api/settings/appearance
Authorization: Bearer <token>
Content-Type: application/json

{
  "theme": "dark",
  "fontSize": "medium",
  "chatWallpaper": "url"
}
```

### Get Notification Settings
```http
GET /api/settings/notifications
Authorization: Bearer <token>
```

### Update Notification Settings
```http
PUT /api/settings/notifications
Authorization: Bearer <token>
Content-Type: application/json

{
  "messageNotifications": true,
  "groupNotifications": true,
  "sound": true,
  "vibration": true,
  "popup": true
}
```

### Get Privacy Settings
```http
GET /api/settings/privacy
Authorization: Bearer <token>
```

### Update Privacy Settings
```http
PUT /api/settings/privacy
Authorization: Bearer <token>
Content-Type: application/json

{
  "lastSeen": "everyone",
  "profilePhoto": "contacts",
  "status": "contacts",
  "readReceipts": true
}
```

### Get Chat Settings
```http
GET /api/settings/chat
Authorization: Bearer <token>
```

### Update Chat Settings
```http
PUT /api/settings/chat
Authorization: Bearer <token>
Content-Type: application/json

{
  "enterToSend": true,
  "mediaVisibility": true,
  "autoDownload": "wifi"
}
```

### Get Storage Settings
```http
GET /api/settings/storage
Authorization: Bearer <token>
```

### Get Account Settings
```http
GET /api/settings/account
Authorization: Bearer <token>
```

---

## Permissions

### Get Permissions
```http
GET /api/permissions
Authorization: Bearer <token>
```

### Update Permissions
```http
PUT /api/permissions
Authorization: Bearer <token>
Content-Type: application/json

{
  "camera": true,
  "microphone": true,
  "contacts": true,
  "media": true,
  "location": true,
  "notifications": true
}
```

### Get Device Permissions
```http
GET /api/permissions/device
Authorization: Bearer <token>
```

### Request Permission
```http
POST /api/permissions/request
Authorization: Bearer <token>
Content-Type: application/json

{
  "permission": "camera"
}
```

---

## Backup & Recovery

### Create Backup
```http
POST /api/backup/create
Authorization: Bearer <token>
Content-Type: application/json

{
  "type": "full",
  "includeMedia": false
}
```

### List Backups
```http
GET /api/backup/list
Authorization: Bearer <token>
```

### Restore Backup
```http
POST /api/backup/restore
Authorization: Bearer <token>
Content-Type: application/json

{
  "backupId": "backup_id"
}
```

### Delete Backup
```http
DELETE /api/backup/:id
Authorization: Bearer <token>
```

### Schedule Backup
```http
POST /api/backup/schedule
Authorization: Bearer <token>
Content-Type: application/json

{
  "frequency": "weekly",
  "day": "sunday",
  "time": "02:00"
}
```

### Email Backup
```http
POST /api/backup/email
Authorization: Bearer <token>
Content-Type: application/json

{
  "email": "john@example.com"
}
```

### Request Recovery
```http
POST /api/recovery/request
Content-Type: application/json

{
  "email": "john@example.com"
}
```

### Verify Recovery Code
```http
POST /api/recovery/verify
Content-Type: application/json

{
  "email": "john@example.com",
  "code": "123456"
}
```

### Reset Password via Recovery
```http
POST /api/recovery/reset-password
Content-Type: application/json

{
  "email": "john@example.com",
  "code": "123456",
  "newPassword": "newpassword123"
}
```

### Add Trusted Contact
```http
POST /api/recovery/trusted-contact
Authorization: Bearer <token>
Content-Type: application/json

{
  "userId": "user_id"
}
```

### Remove Trusted Contact
```http
DELETE /api/recovery/trusted-contact/:id
Authorization: Bearer <token>
```

---

## Stories & Channels

### Get Stories
```http
GET /api/stories
Authorization: Bearer <token>
```

### Create Story
```http
POST /api/stories
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: <media_file>
caption: "Story caption"
```

### Delete Story
```http
DELETE /api/stories/:id
Authorization: Bearer <token>
```

### View Story
```http
POST /api/stories/:id/view
Authorization: Bearer <token>
```

### Get Channels
```http
GET /api/channels
Authorization: Bearer <token>
```

### Create Channel
```http
POST /api/channels
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "My Channel",
  "description": "Channel description"
}
```

### Update Channel
```http
PUT /api/channels/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Name",
  "description": "New description"
}
```

### Delete Channel
```http
DELETE /api/channels/:id
Authorization: Bearer <token>
```

### Follow Channel
```http
POST /api/channels/:id/follow
Authorization: Bearer <token>
```

### Unfollow Channel
```http
POST /api/channels/:id/unfollow
Authorization: Bearer <token>
```

---

## Calls

### Get Call History
```http
GET /api/calls
Authorization: Bearer <token>
```

### Initiate Call
```http
POST /api/calls
Authorization: Bearer <token>
Content-Type: application/json

{
  "userId": "user_id",
  "type": "voice"
}
```

### End Call
```http
POST /api/calls/:id/end
Authorization: Bearer <token>
```

### Get Call Details
```http
GET /api/calls/:id
Authorization: Bearer <token>
```

---

## Contacts

### Get Contacts
```http
GET /api/contacts
Authorization: Bearer <token>
```

### Add Contact
```http
POST /api/contacts
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Contact Name",
  "phone": "+1234567890"
}
```

### Update Contact
```http
PUT /api/contacts/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Name"
}
```

### Delete Contact
```http
DELETE /api/contacts/:id
Authorization: Bearer <token>
```

### Sync Contacts
```http
POST /api/contacts/sync
Authorization: Bearer <token>
Content-Type: application/json

{
  "contacts": [
    { "name": "Name", "phone": "+1234567890" }
  ]
}
```

### Block Contact
```http
POST /api/contacts/:id/block
Authorization: Bearer <token>
```

### Unblock Contact
```http
POST /api/contacts/:id/unblock
Authorization: Bearer <token>
```

### Get Blocked Contacts
```http
GET /api/contacts/blocked
Authorization: Bearer <token>
```

---

## Error Handling

### HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 429 | Too Many Requests |
| 500 | Server Error |

### Error Response Format

```json
{
  "success": false,
  "error": "Invalid credentials",
  "code": "AUTH_INVALID_CREDENTIALS",
  "details": {
    "field": "email",
    "message": "Email not found"
  }
}
```

### Common Error Codes

| Code | Description |
|------|-------------|
| `AUTH_INVALID_CREDENTIALS` | Wrong email/password |
| `AUTH_TOKEN_EXPIRED` | JWT token expired |
| `AUTH_TOKEN_INVALID` | Invalid JWT token |
| `USER_NOT_FOUND` | User doesn't exist |
| `CHAT_NOT_FOUND` | Chat doesn't exist |
| `MESSAGE_NOT_FOUND` | Message doesn't exist |
| `GROUP_NOT_FOUND` | Group doesn't exist |
| `PERMISSION_DENIED` | Insufficient permissions |
| `RATE_LIMIT_EXCEEDED` | Too many requests |
| `VALIDATION_ERROR` | Invalid input data |

---

## Rate Limiting

| Endpoint Type | Limit | Window |
|---------------|-------|--------|
| Authentication | 10 requests | 15 minutes |
| Messages | 100 requests | 1 minute |
| General API | 1000 requests | 15 minutes |

---

## WebSocket Events

### Client → Server

```javascript
// Join chat room
socket.emit('join_chat', { chatId: 'chat_id' });

// Send message
socket.emit('send_message', {
  chatId: 'chat_id',
  content: 'Hello',
  type: 'text'
});

// Typing indicator
socket.emit('typing', { chatId: 'chat_id' });

// Stop typing
socket.emit('stop_typing', { chatId: 'chat_id' });

// Mark as read
socket.emit('mark_read', { chatId: 'chat_id', messageId: 'msg_id' });
```

### Server → Client

```javascript
// New message
socket.on('new_message', (message) => { ... });

// Message read
socket.on('message_read', (data) => { ... });

// User typing
socket.on('user_typing', (data) => { ... });

// User online/offline
socket.on('user_status', (data) => { ... });

// Chat updated
socket.on('chat_updated', (chat) => { ... });
```

---

## Pagination

All list endpoints support pagination:

```http
GET /api/chats?page=1&limit=20
```

**Response:**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5
  }
}
```

---

## Search

Most list endpoints support search:

```http
GET /api/chats?search=hello
```

Search is case-insensitive and searches across multiple fields.

---

**API Version:** 2.0  
**Last Updated:** March 2026
