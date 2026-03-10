# GBChat Group Features - Complete Documentation

**Version:** 2.0.0  
**Last Updated:** March 10, 2026  
**Status:** Production Ready ✅

---

## 📋 TABLE OF CONTENTS

1. [Overview](#overview)
2. [Group Features](#group-features)
3. [API Endpoints](#api-endpoints)
4. [Frontend Components](#frontend-components)
5. [Usage Guide](#usage-guide)
6. [Troubleshooting](#troubleshooting)

---

## 🎯 OVERVIEW

GBChat now includes **comprehensive group management features** with polls, events, announcements, and advanced admin controls. All features are accessible through the enhanced Groups page.

---

## ✨ GROUP FEATURES

### 1. Group Management

#### Create Groups
- Add group name, description, and avatar
- Invite multiple members at once
- Set group privacy settings
- Configure admin permissions

#### Group Settings
- Edit group info (name, description, avatar)
- Manage member permissions
- Configure who can send messages
- Set max members limit
- Control member addition (admin only or all members)

#### Member Management
- Add new members
- Remove members (admins only)
- Promote members to admin
- View member list with roles
- See member online status

### 2. Group Polls 📊

**Features:**
- Create polls with up to 10 options
- Allow multiple votes per user
- Anonymous voting option
- Set poll expiration time
- Real-time vote counting
- Visual results with progress bars
- End polls manually or auto-expire

**Poll Settings:**
- **Duration**: 1h, 6h, 12h, 24h, 48h, 1 week
- **Multiple votes**: Allow users to select multiple options
- **Anonymous**: Hide voter identities
- **Results**: Show results only after voting

### 3. Group Events 📅

**Features:**
- Create events with date, time, and location
- Online events with meeting links
- RSVP tracking (Going, Maybe, Can't Go)
- Event reminders
- View attendee list
- Event details modal

**Event Types:**
- **In-Person**: Physical location with address
- **Online**: Video call link (Zoom, Google Meet, etc.)
- **Hybrid**: Both location and online link

**RSVP Options:**
- ✅ Going
- 🤔 Maybe
- ❌ Can't Go

### 4. Group Announcements 📢

**Features:**
- Create important announcements
- Pin announcements to top
- Target specific audiences (all, admins, members)
- Attach images, links, and documents
- Schedule announcements for later
- Track likes and comments

**Announcement Options:**
- **Pin**: Keep at top of announcements list
- **Target Audience**: 
  - 👥 Everyone
  - 🛡️ Admins Only
  - 👤 Members
- **Attachments**: Images, links, documents
- **Schedule**: Post at specific date/time

### 5. Group Filters & Search 🔍

**Quick Filters:**
- All Groups
- Admin (groups you admin)
- Unread (groups with unread messages)
- Muted (muted groups)
- Starred (favorite groups)

**Search:**
- Search by group name
- Real-time filtering
- Clear search button

**Sort Options:**
- Name (alphabetical)
- Recent (last activity)
- Unread (unread count)
- Members (group size)

### 6. Quick Actions ⚡

**Bottom Action Buttons:**
- 🆕 **New Group**: Create a new group
- 📣 **Broadcast**: Send message to multiple groups
- 📊 **Poll**: Quick poll creation
- 📅 **Event**: Quick event creation
- ⋯ **More**: Additional options menu

---

## 🔌 API ENDPOINTS

### Base URL
```
/api/groups
```

### Group CRUD

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/` | Create new group |
| PUT | `/:id` | Update group info |
| POST | `/:id/members` | Add members |
| DELETE | `/:id/members/:memberId` | Remove member |
| POST | `/:id/leave` | Leave group |
| PUT | `/:id/members/:memberId/admin` | Make admin |
| PUT | `/:id/settings` | Update group settings |

### Polls

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/:id/polls` | Create poll |
| GET | `/:id/polls` | Get all polls |
| POST | `/:id/polls/:pollId/vote` | Vote on poll |
| POST | `/:id/polls/:pollId/end` | End poll |

**Create Poll Body:**
```json
{
  "question": "What's the best day for the meeting?",
  "options": [
    { "text": "Monday" },
    { "text": "Wednesday" },
    { "text": "Friday" }
  ],
  "allowMultipleVotes": false,
  "anonymous": true,
  "durationHours": 24
}
```

### Events

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/:id/events` | Create event |
| GET | `/:id/events` | Get all events |
| POST | `/:id/events/:eventId/rsvp` | RSVP to event |
| DELETE | `/:id/events/:eventId` | Delete event |

**Create Event Body:**
```json
{
  "title": "Team Meeting",
  "description": "Weekly sync-up",
  "date": "2026-03-15",
  "time": "14:00",
  "location": "Conference Room A",
  "isOnline": false,
  "sendReminder": true
}
```

### Announcements

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/:id/announcements` | Create announcement |
| GET | `/:id/announcements` | Get all announcements |
| POST | `/:id/announcements/:announcementId/pin` | Pin/unpin |
| DELETE | `/:id/announcements/:announcementId` | Delete |

**Create Announcement Body:**
```json
{
  "title": "Office Closure Notice",
  "content": "The office will be closed on...",
  "isPinned": true,
  "attachments": [],
  "targetAudience": "all"
}
```

---

## 🎨 FRONTEND COMPONENTS

### GroupsPage
**Location:** `client/src/pages/GroupsPage.jsx`

**Features:**
- Tab navigation (Groups, Announcements, Polls, Events)
- Search and filter functionality
- Group list with avatars and member count
- Quick action buttons
- Refresh functionality
- Responsive design (mobile/desktop)

### GroupPolls
**Location:** `client/src/components/groups/GroupPolls.jsx`

**Components:**
- `PollCard`: Display poll with voting interface
- `CreatePollModal`: Create new poll
- `PollResultsModal`: View detailed results

### GroupEvents
**Location:** `client/src/components/groups/GroupEvents.jsx`

**Components:**
- `EventCard`: Display upcoming event
- `CreateEventModal`: Create new event
- `EventDetailModal`: View event details and RSVP

### GroupInfo
**Location:** `client/src/components/groups/GroupInfo.jsx`

**Features:**
- Group avatar and details
- Quick actions (add members, mute, edit)
- Tabs: Members, Media, Links, Docs
- Leave/Delete group buttons

### AnnouncementCreator
**Location:** `client/src/components/groups/AnnouncementCreator.jsx`

**Features:**
- Title and content inputs
- Attachment options (image, link, document)
- Pin toggle
- Target audience selector
- Schedule date/time picker

---

## 📖 USAGE GUIDE

### Creating a Group

1. Click the **"New Group"** button
2. Enter group name and description
3. Upload group avatar (optional)
4. Select members to add
5. Configure group settings
6. Click **"Create Group"**

### Creating a Poll

1. Go to **Groups** page
2. Click **"Polls"** tab
3. Click **"Create Poll"**
4. Enter your question
5. Add options (2-10)
6. Configure settings:
   - Allow multiple votes
   - Anonymous voting
   - Duration
7. Click **"Create Poll"**

### Creating an Event

1. Go to **Groups** page
2. Click **"Events"** tab
3. Click **"Create Event"**
4. Enter event details:
   - Title and description
   - Date and time
   - Location or online link
5. Enable reminder (optional)
6. Click **"Create Event"**

### Creating an Announcement

1. Go to **Groups** page
2. Click **"Announcements"** tab
3. Click **"Create Announcement"**
4. Enter title and content
5. Add attachments (optional)
6. Configure options:
   - Pin to top
   - Target audience
   - Schedule for later
7. Click **"Post Announcement"**

### Managing Group Members

1. Open group info
2. Go to **"Members"** tab
3. View member list with roles
4. Admin actions:
   - Promote to admin
   - Remove member
   - Add new members

---

## 🔧 TROUBLESHOOTING

### Common Issues

#### Poll Not Showing
**Solution:**
1. Refresh the page
2. Check group permissions
3. Verify poll was created successfully

#### Can't RSVP to Event
**Solution:**
1. Ensure you're a group member
2. Check if event is still active
3. Clear browser cache

#### Announcement Not Posting
**Solution:**
1. Verify admin permissions
2. Check title and content are filled
3. Check network connection

#### Group Not Loading
**Solution:**
1. Refresh the page
2. Check internet connection
3. Clear localStorage
4. Re-login if needed

### Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| "Group not found" | Invalid group ID | Refresh or navigate back |
| "Only admins can..." | Permission denied | Contact group admin |
| "Poll not found" | Poll deleted/expired | Refresh page |
| "Already voted" | Duplicate vote | View results instead |

---

## 📊 FEATURES COMPARISON

| Feature | WhatsApp | Telegram | GBChat |
|---------|----------|----------|--------|
| Create Groups | ✅ | ✅ | ✅ |
| Polls | ✅ | ✅ | ✅✅ |
| Events | ❌ | ✅ | ✅✅ |
| Announcements | ❌ | ✅ | ✅✅ |
| Pin Messages | ✅ | ✅ | ✅ |
| Member Management | ✅ | ✅ | ✅✅ |
| Admin Controls | Basic | Advanced | Advanced |
| Search & Filters | Basic | Basic | ✅✅ |

---

## 🔐 PERMISSIONS

### Admin Permissions
- Edit group info
- Add/remove members
- Promote members to admin
- Create announcements
- Pin announcements
- Delete events/polls
- Manage group settings

### Member Permissions
- View group info
- Vote in polls
- RSVP to events
- Send messages (if enabled)
- Add members (if allowed)

---

## 📱 RESPONSIVE DESIGN

### Mobile
- Bottom navigation
- Swipe gestures
- Touch-optimized buttons
- Collapsible filters

### Desktop
- Sidebar navigation
- Keyboard shortcuts
- Hover effects
- Multi-column layout

---

## 🚀 PERFORMANCE

### Optimizations
- Lazy loading of components
- Virtual scrolling for large lists
- Debounced search
- Cached API responses
- Optimistic UI updates

### Limits
- Max members per group: 256
- Max poll options: 10
- Max poll duration: 1 week
- Max announcements: 100
- Max events: 50

---

## 📞 SUPPORT

### Documentation
- `README_ENHANCED.md` - Complete feature documentation
- `GB_FEATURES.md` - GB WhatsApp features
- `GB_SETTINGS_ENDPOINTS.md` - Settings API

### Contact
- GitHub Issues
- Discord community
- Email: support@gbchat.dev

---

**GBChat Group Features v2.0.0**  
**Built with ❤️ for Enhanced Group Communication**  
**Status**: Production Ready ✅

**Last Updated**: March 10, 2026  
**Maintained by**: GBChat Team  
**License**: MIT
