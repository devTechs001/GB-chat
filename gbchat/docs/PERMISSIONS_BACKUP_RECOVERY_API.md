# Permissions, Backup & Recovery API Documentation

Complete API documentation for GBChat's permission management, data backup, and account recovery features.

## Table of Contents

1. [Permissions API](#permissions-api)
2. [Backup API](#backup-api)
3. [Recovery API](#recovery-api)

---

## Permissions API

**Base URL:** `/api/permissions`

All routes require authentication via Bearer token.

### Device Permissions

#### Get All Permissions
```http
GET /
```

**Response:**
```json
{
  "success": true,
  "data": {
    "devicePermissions": {
      "contacts": { "granted": false, "grantedAt": null },
      "camera": { "granted": true, "grantedAt": "2024-01-01T00:00:00Z" },
      "microphone": { "granted": true },
      "mediaLibrary": { "granted": true },
      "photos": { "granted": true },
      "storage": { "granted": false },
      "location": { "granted": false },
      "notifications": { "granted": true },
      "bluetooth": { "granted": false },
      "nearbyDevices": { "granted": false },
      "calendar": { "granted": false },
      "phone": { "granted": false },
      "sms": { "granted": false }
    },
    "featurePermissions": { ... },
    "privacyPermissions": { ... },
    "blockedUsers": []
  }
}
```

#### Update Device Permissions
```http
PUT /device
Content-Type: application/json

{
  "permissions": {
    "camera": { "granted": true },
    "microphone": { "granted": true }
  },
  "device": "iPhone 15 Pro"
}
```

#### Individual Permission Toggles

**Contacts:**
```http
POST /device/contacts
Content-Type: application/json

{ "granted": true, "device": "iPhone 15 Pro" }
```

**Camera:**
```http
POST /device/camera
Content-Type: application/json

{ "granted": true }
```

**Microphone:**
```http
POST /device/microphone
Content-Type: application/json

{ "granted": true }
```

**Media Library:**
```http
POST /device/media
Content-Type: application/json

{ "granted": true }
```

**Photos:**
```http
POST /device/photos
Content-Type: application/json

{ "granted": true }
```

**Storage:**
```http
POST /device/storage
Content-Type: application/json

{ "granted": true }
```

**Location:**
```http
POST /device/location
Content-Type: application/json

{ "granted": true, "accuracy": "precise" }
```

**Notifications:**
```http
POST /device/notifications
Content-Type: application/json

{
  "granted": true,
  "settings": {
    "showPreview": true,
    "sound": true,
    "badge": true,
    "banner": true,
    "lockScreen": true
  }
}
```

### Feature Permissions

#### Update Feature Permissions
```http
PUT /feature
Content-Type: application/json

{
  "featurePermissions": {
    "voiceMessages": true,
    "videoCalls": true,
    "locationSharing": true,
    "fileSharing": true,
    "screenSharing": true,
    "readReceipts": true,
    "typingIndicator": true,
    "lastSeen": true,
    "profilePhoto": true,
    "statusUpdates": true
  }
}
```

### Privacy Permissions

#### Update Privacy Permissions
```http
PUT /privacy
Content-Type: application/json

{
  "privacyPermissions": {
    "whoCanSeeOnline": "contacts",
    "whoCanSeeLastSeen": "contacts",
    "whoCanSeeProfilePhoto": "everyone",
    "whoCanSeeStatus": "contacts",
    "whoCanAddToGroups": "contacts",
    "whoCanCall": "contacts",
    "readReceipts": true,
    "typingIndicator": true
  }
}
```

### Blocked Users

#### Get Blocked Users
```http
GET /blocked
```

#### Block User
```http
POST /block
Content-Type: application/json

{
  "userId": "user_id_here",
  "reason": "Spam"
}
```

#### Unblock User
```http
POST /unblock
Content-Type: application/json

{ "userId": "user_id_here" }
```

### Permission History

#### Get History
```http
GET /history
```

**Response:**
```json
{
  "success": true,
  "data": {
    "history": [
      {
        "permissionType": "camera",
        "action": "granted",
        "timestamp": "2024-01-01T00:00:00Z",
        "device": "iPhone 15 Pro"
      }
    ]
  }
}
```

### Reset Permissions

```http
POST /reset
Content-Type: application/json

{ "section": "device" } // or 'feature', 'privacy', or omit for all
```

---

## Backup API

**Base URL:** `/api/backup`

### Create Backup

```http
POST /
Content-Type: application/json

{
  "type": "full", // full, chats, media, contacts, settings
  "data": {
    "chats": [...],
    "contacts": [...],
    "settings": {...}
  },
  "options": {
    "encrypted": true,
    "storageLocation": "local"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Backup created successfully",
  "data": {
    "backupId": "...",
    "type": "full",
    "size": 1024000,
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

### Get Backups

```http
GET /?type=chats&limit=10
```

**Response:**
```json
{
  "success": true,
  "data": {
    "backups": [
      {
        "_id": "...",
        "type": "full",
        "size": 1024000,
        "status": "completed",
        "createdAt": "2024-01-01T00:00:00Z"
      }
    ]
  }
}
```

### Get Backup Details

```http
GET /:backupId
```

### Restore Backup

```http
POST /restore
Content-Type: application/json

{ "backupId": "..." }
```

**Response:**
```json
{
  "success": true,
  "message": "Backup ready to restore",
  "data": {
    "type": "full",
    "data": { ... },
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

### Delete Backup

```http
DELETE /:backupId
```

### Export Backup

```http
GET /:backupId/export?format=json
```

Formats: `json`, `csv` (for contacts)

### Schedule Backup

```http
POST /schedule
Content-Type: application/json

{
  "type": "full",
  "frequency": "weekly", // daily, weekly, monthly
  "time": "02:00",
  "dayOfWeek": 0 // 0-6 (Sunday-Saturday)
}
```

### Cancel Scheduled Backup

```http
POST /schedule/cancel
Content-Type: application/json

{ "type": "full" }
```

### Email Backup

```http
POST /email
Content-Type: application/json

{
  "backupId": "...",
  "email": "user@example.com"
}
```

### Get Backup Stats

```http
GET /stats
```

**Response:**
```json
{
  "success": true,
  "data": {
    "stats": [
      {
        "_id": "full",
        "count": 5,
        "totalSize": 5120000,
        "lastBackup": "2024-01-01T00:00:00Z"
      }
    ],
    "summary": {
      "totalBackups": 5,
      "totalSize": 5120000,
      "totalSizeFormatted": "4.88 MB"
    }
  }
}
```

---

## Recovery API

**Base URL:** `/api/recovery`

### Get Recovery Settings

```http
GET /
```

**Response:**
```json
{
  "success": true,
  "data": {
    "emailRecovery": {
      "enabled": true,
      "email": "user@example.com",
      "verified": true
    },
    "phoneRecovery": {
      "enabled": false,
      "phoneNumber": null,
      "verified": false
    },
    "twoFactorAuth": {
      "enabled": false,
      "method": "email"
    },
    "trustedContacts": [],
    "accountProtection": {
      "lockoutEnabled": true,
      "failedAttempts": 0,
      "lockedUntil": null
    }
  }
}
```

### Setup Email Recovery

```http
POST /email/setup
Content-Type: application/json

{ "email": "recovery@example.com" }
```

**Response:**
```json
{
  "success": true,
  "message": "Verification email sent. Please check your inbox."
}
```

### Verify Email Recovery

```http
POST /email/verify
Content-Type: application/json

{ "token": "verification_token_here" }
```

### Setup Phone Recovery

```http
POST /phone/setup
Content-Type: application/json

{ "phoneNumber": "+1234567890" }
```

### Generate Recovery Codes

```http
POST /codes/generate
```

**Response:**
```json
{
  "success": true,
  "message": "Recovery codes generated",
  "data": {
    "codes": [
      "A1B2C3D4",
      "E5F6G7H8",
      "I9J0K1L2",
      ...
    ],
    "message": "Save these codes in a safe place. Each code can only be used once."
  }
}
```

### Verify Recovery Code

```http
POST /codes/verify
Content-Type: application/json

{ "code": "A1B2C3D4" }
```

### Setup Two-Factor Authentication

```http
POST /2fa/setup
Content-Type: application/json

{
  "method": "authenticator" // email, sms, authenticator, whatsapp
}
```

**Response (for authenticator):**
```json
{
  "success": true,
  "message": "Scan QR code with authenticator app",
  "data": {
    "secret": "JBSWY3DPEHPK3PXP",
    "qrUri": "otpauth://totp/GBChat:user@example.com?secret=...",
    "message": "After scanning, enter the 6-digit code to enable 2FA"
  }
}
```

### Verify 2FA Setup

```http
POST /2fa/verify
Content-Type: application/json

{ "code": "123456" }
```

### Disable 2FA

```http
POST /2fa/disable
Content-Type: application/json

{ "code": "123456" } // Current 2FA code or recovery code
```

### Trusted Contacts

#### Get Trusted Contacts
```http
GET /trusted-contacts
```

#### Add Trusted Contact
```http
POST /trusted-contacts/add
Content-Type: application/json

{
  "userId": "user_id",
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890"
}
```

#### Remove Trusted Contact
```http
POST /trusted-contacts/remove
Content-Type: application/json

{ "contactId": "contact_id" }
```

### Account Protection

#### Update Account Protection
```http
PUT /protection
Content-Type: application/json

{
  "lockoutEnabled": true,
  "requireVerification": true,
  "notifyOnNewDevice": true,
  "notifyOnPasswordChange": true
}
```

### Get Recovery History

```http
GET /history
```

### Request Account Recovery (Public Route)

```http
POST /request
Content-Type: application/json

{
  "email": "user@example.com",
  "reason": "Forgot password"
}
```

### Reset Password via Recovery

```http
POST /reset-password
Content-Type: application/json

{
  "token": "recovery_token",
  "newPassword": "NewSecurePassword123!"
}
```

---

## Error Responses

All endpoints return errors in this format:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

### Common HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Internal Server Error

---

## Security Best Practices

1. **Always use HTTPS** in production
2. **Never commit recovery codes** to version control
3. **Rotate secrets regularly** (JWT, encryption keys)
4. **Enable 2FA** for all users
5. **Monitor recovery attempts** for suspicious activity
6. **Rate limit** sensitive endpoints
7. **Encrypt backups** at rest and in transit
8. **Set expiration** on backup files
9. **Notify users** of security events (new device, password change)
10. **Implement account lockout** after failed attempts

---

## Example Usage (JavaScript/Fetch)

### Request Camera Permission

```javascript
const response = await fetch('/api/permissions/device/camera', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ granted: true })
});

const data = await response.json();
console.log(data);
```

### Create Backup

```javascript
const response = await fetch('/api/backup', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    type: 'full',
    data: { chats: [...], contacts: [...] },
    options: { encrypted: true }
  })
});

const data = await response.json();
console.log('Backup ID:', data.data.backupId);
```

### Setup 2FA

```javascript
// Step 1: Setup
const setupResponse = await fetch('/api/recovery/2fa/setup', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ method: 'authenticator' })
});

const { data } = await setupResponse.json();
// Display QR code using data.qrUri

// Step 2: Verify
const verifyResponse = await fetch('/api/recovery/2fa/verify', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ code: '123456' })
});
```

---

## Environment Variables Required

Add these to your `.env` file:

```bash
# Email Service (for recovery emails)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Client URL (for recovery links)
CLIENT_URL=https://gbchat.netlify.app

# Security
BCRYPT_ROUNDS=12
```
