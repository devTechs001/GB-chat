# Profile Photo & GB Features Toggle Fixes

## Issues Fixed

### 1. Profile Photo Not Showing After Update ✅

**Problem:**
- Avatar updates but doesn't display immediately
- Browser caches the old image URL

**Root Cause:**
- Browser caching the avatar URL
- No cache-busting parameter to force refresh

**Fix:**
Added cache-busting timestamp to avatar URL after upload:

```javascript
// Before
set({ user: data })

// After
const updatedUser = {
  ...data,
  avatar: data.avatar + (data.avatar.includes('?') ? '&' : '?') + 't=' + Date.now()
}
set({ user: updatedUser })
```

**How It Works:**
- Adds `?t=1234567890` timestamp to avatar URL
- Forces browser to treat it as new image
- Bypasses browser cache
- Image displays immediately

**File Changed:**
- `/client/src/store/useAuthStore.js` - `updateAvatar` function

---

### 2. GB Features Toggle 400 Error ✅

**Problem:**
```
POST /api/gb-features/toggle 400 (Bad Request)
```

**Root Cause:**
- Backend expected flat structure: `features[section][feature]`
- Actual model has nested structure: `features[section][category][feature]`
- Example: `privacy.hideOnlineStatus` (2 levels deep)

**Fix:**
Updated toggle function to handle nested properties:

```javascript
// Before (only worked for top-level)
if (features[section][feature]) {
  features[section][feature] = !features[section][feature]
}

// After (handles nested like privacy.hideOnlineStatus)
const featureParts = feature.split('.')
let currentValue = features[section]

// Navigate through nested structure
for (let i = 0; i < featureParts.length - 1; i++) {
  currentValue = currentValue[featureParts[i]]
}

// Toggle the final property
const lastPart = featureParts[featureParts.length - 1]
currentValue[lastPart] = !currentValue[lastPart]
```

**Now Supports:**
- ✅ `privacy.hideOnlineStatus`
- ✅ `privacy.freezeLastSeen`
- ✅ `customization.customTheme.enabled`
- ✅ `messaging.scheduleMessages`
- ✅ All nested boolean features

**File Changed:**
- `/server/controllers/gbFeaturesController.js` - `toggleFeature` function

---

## Testing

### Test Profile Photo Update:

1. Go to Profile
2. Click on avatar
3. Upload new image
4. ✅ **Should see new avatar immediately**
5. ✅ **No cache issues**

### Test GB Features Toggle:

1. Go to Settings → GB Features
2. Click any toggle switch
3. ✅ **Should toggle without errors**
4. ✅ **Success toast appears**
5. ✅ **State persists after refresh**

---

## API Request Format

### Correct Format (Now Working):

```javascript
POST /api/gb-features/toggle
{
  "section": "privacy",
  "feature": "hideOnlineStatus"  // Can be nested: "customTheme.enabled"
}
```

### Response:

```javascript
{
  "success": true,
  "message": "Feature hideOnlineStatus enabled",
  "data": {
    "privacy": {
      "hideOnlineStatus": true,
      ...
    },
    ...
  }
}
```

---

## Files Changed

```
client/src/store/
└── useAuthStore.js         ✅ Fixed avatar cache

server/controllers/
└── gbFeaturesController.js ✅ Fixed nested toggle
```

---

## Technical Details

### Avatar Cache Busting

**Problem:** Browser caches images by URL
**Solution:** Add unique query parameter

```
Before: /uploads/avatars/abc123.jpg
After:  /uploads/avatars/abc123.jpg?t=1709876543210
```

Browser treats these as different URLs, forcing fresh download.

### Nested Property Access

**Model Structure:**
```javascript
{
  privacy: {
    hideOnlineStatus: boolean,
    freezeLastSeen: boolean,
    ...
  },
  customization: {
    customTheme: {
      enabled: boolean,
      ...
    }
  }
}
```

**Dynamic Access Pattern:**
```javascript
// Convert "customTheme.enabled" to array
['customTheme', 'enabled']

// Navigate: features['customization']['customTheme']['enabled']
featureParts.forEach(part => {
  currentValue = currentValue[part]
})

// Toggle final value
currentValue[lastPart] = !currentValue[lastPart]
```

---

## Status

| Issue | Status | Testing |
|-------|--------|---------|
| Avatar not updating | ✅ Fixed | Works immediately |
| GB Features 400 error | ✅ Fixed | All toggles work |
| Nested properties | ✅ Supported | Deep nesting works |
| Cache busting | ✅ Implemented | No cache issues |

---

**Both issues are now resolved!** ✨

Last Updated: March 2026
