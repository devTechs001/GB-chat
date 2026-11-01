# GBChat — endpoint audit

Generated: 2026-11-01 · `node scripts/audit-endpoints.mjs`

## Summary

| Metric | Value |
| --- | --- |
| Registered routes | **410** |
| Mounted routers | **27** |
| Distinct client calls | **118** |
| Client calls without a route | **0** |
| Routes no client calls yet | 292 |
| Mutating routes without auth middleware | 0 |
| Duplicate route definitions | 0 |
| Shadowed routes | 0 |

## Routes per router

| Router | Mount | Auth | Routes |
| --- | --- | --- | --- |
| `(inline in index.js)` | `—` | no | 2 |
| `accountRoutes` | `/api/account` | yes | 14 |
| `appearanceRoutes` | `/api/appearance` | yes | 19 |
| `authRoutes` | `/api/auth` | yes | 16 |
| `backupRoutes` | `/api/backup` | yes | 10 |
| `callRoutes` | `/api/calls` | yes | 10 |
| `channelRoutes` | `/api/channels` | yes | 17 |
| `chatDisplayRoutes` | `/api/chat-display` | yes | 9 |
| `chatLockRoutes` | `/api/chat-lock` | yes | 9 |
| `chatRoutes` | `/api/chats` | yes | 23 |
| `chatSettingsRoutes` | `/api/chat-settings` | yes | 17 |
| `contactRoutes` | `/api/contacts` | yes | 11 |
| `deviceRoutes` | `/api/devices` | yes | 10 |
| `emojiRoutes` | `/api/emoji` | yes | 7 |
| `gbFeaturesRoutes` | `/api/gb-features` | yes | 16 |
| `gbSettingsRoutes` | `/api/gb-settings` | yes | 65 |
| `groupRoutes` | `/api/groups` | yes | 34 |
| `messageRoutes` | `/api/messages` | yes | 17 |
| `notificationRoutes` | `/api/notifications` | yes | 15 |
| `permissionRoutes` | `/api/permissions` | yes | 17 |
| `privacyRoutes` | `/api/privacy` | yes | 11 |
| `recoveryRoutes` | `/api/recovery` | yes | 16 |
| `storageRoutes` | `/api/storage` | yes | 7 |
| `storyRoutes` | `/api/stories` | yes | 14 |
| `systemRoutes` | `/api/system` | yes | 5 |
| `translationRoutes` | `/api/translations` | yes | 4 |
| `userRoutes` | `/api/users` | yes | 15 |

## All routes

| Method | Path | Auth | Called by client | File |
| --- | --- | --- | --- | --- |
| GET | `*` | — | — | index.js |
| DELETE | `/api/account` | yes | — | server/routes/accountRoutes.js |
| POST | `/api/account/2fa/disable` | yes | — | server/routes/accountRoutes.js |
| POST | `/api/account/2fa/enable` | yes | — | server/routes/accountRoutes.js |
| POST | `/api/account/2fa/verify` | yes | — | server/routes/accountRoutes.js |
| POST | `/api/account/change-password` | yes | — | server/routes/accountRoutes.js |
| POST | `/api/account/deactivate` | yes | — | server/routes/accountRoutes.js |
| GET | `/api/account/export` | yes | — | server/routes/accountRoutes.js |
| PUT | `/api/account/profile` | yes | — | server/routes/accountRoutes.js |
| POST | `/api/account/reactivate` | yes | — | server/routes/accountRoutes.js |
| GET | `/api/account/sessions` | yes | — | server/routes/accountRoutes.js |
| POST | `/api/account/sessions/logout-all` | yes | — | server/routes/accountRoutes.js |
| POST | `/api/account/sessions/logout/:id` | yes | — | server/routes/accountRoutes.js |
| GET | `/api/account/settings` | yes | — | server/routes/accountRoutes.js |
| PUT | `/api/account/settings` | yes | — | server/routes/accountRoutes.js |
| POST | `/api/appearance/accessibility` | yes | — | server/routes/appearanceRoutes.js |
| POST | `/api/appearance/bubble-style` | yes | — | server/routes/appearanceRoutes.js |
| POST | `/api/appearance/chat-effects` | yes | — | server/routes/appearanceRoutes.js |
| POST | `/api/appearance/create-theme` | yes | — | server/routes/appearanceRoutes.js |
| POST | `/api/appearance/custom-colors` | yes | — | server/routes/appearanceRoutes.js |
| DELETE | `/api/appearance/custom-theme/:id` | yes | — | server/routes/appearanceRoutes.js |
| GET | `/api/appearance/custom-themes` | yes | — | server/routes/appearanceRoutes.js |
| POST | `/api/appearance/dark-mode-level` | yes | — | server/routes/appearanceRoutes.js |
| POST | `/api/appearance/font-size` | yes | — | server/routes/appearanceRoutes.js |
| POST | `/api/appearance/gradient` | yes | — | server/routes/appearanceRoutes.js |
| POST | `/api/appearance/message-animation` | yes | — | server/routes/appearanceRoutes.js |
| POST | `/api/appearance/reset` | yes | — | server/routes/appearanceRoutes.js |
| GET | `/api/appearance/settings` | yes | — | server/routes/appearanceRoutes.js |
| PUT | `/api/appearance/settings` | yes | — | server/routes/appearanceRoutes.js |
| POST | `/api/appearance/theme` | yes | — | server/routes/appearanceRoutes.js |
| GET | `/api/appearance/themes` | yes | — | server/routes/appearanceRoutes.js |
| POST | `/api/appearance/wallpaper` | yes | — | server/routes/appearanceRoutes.js |
| POST | `/api/appearance/wallpaper/upload` | yes | — | server/routes/appearanceRoutes.js |
| GET | `/api/appearance/wallpapers` | yes | — | server/routes/appearanceRoutes.js |
| POST | `/api/auth/forgot-password` | yes | yes | server/routes/authRoutes.js |
| POST | `/api/auth/forgot-password/phone` | yes | yes | server/routes/authRoutes.js |
| POST | `/api/auth/login` | yes | yes | server/routes/authRoutes.js |
| POST | `/api/auth/logout` | yes | — | server/routes/authRoutes.js |
| GET | `/api/auth/me` | yes | yes | server/routes/authRoutes.js |
| POST | `/api/auth/phone-login` | yes | yes | server/routes/authRoutes.js |
| POST | `/api/auth/phone-verify` | yes | yes | server/routes/authRoutes.js |
| POST | `/api/auth/phone-verify/confirm` | yes | — | server/routes/authRoutes.js |
| POST | `/api/auth/phone-verify/resend` | yes | yes | server/routes/authRoutes.js |
| PUT | `/api/auth/profile` | yes | yes | server/routes/authRoutes.js |
| POST | `/api/auth/refresh` | yes | — | server/routes/authRoutes.js |
| POST | `/api/auth/register` | yes | yes | server/routes/authRoutes.js |
| POST | `/api/auth/resend-otp` | yes | yes | server/routes/authRoutes.js |
| POST | `/api/auth/reset-password` | yes | — | server/routes/authRoutes.js |
| POST | `/api/auth/reset-password/phone` | yes | yes | server/routes/authRoutes.js |
| POST | `/api/auth/verify-otp` | yes | yes | server/routes/authRoutes.js |
| GET | `/api/backup` | yes | — | server/routes/backupRoutes.js |
| POST | `/api/backup` | yes | — | server/routes/backupRoutes.js |
| DELETE | `/api/backup/:id` | yes | — | server/routes/backupRoutes.js |
| GET | `/api/backup/:id` | yes | — | server/routes/backupRoutes.js |
| GET | `/api/backup/:id/export` | yes | — | server/routes/backupRoutes.js |
| POST | `/api/backup/email` | yes | — | server/routes/backupRoutes.js |
| POST | `/api/backup/restore` | yes | — | server/routes/backupRoutes.js |
| POST | `/api/backup/schedule` | yes | — | server/routes/backupRoutes.js |
| POST | `/api/backup/schedule/cancel` | yes | — | server/routes/backupRoutes.js |
| GET | `/api/backup/stats` | yes | — | server/routes/backupRoutes.js |
| GET | `/api/calls/:id` | yes | — | server/routes/callRoutes.js |
| POST | `/api/calls/:id/accept` | yes | yes | server/routes/callRoutes.js |
| POST | `/api/calls/:id/add-participant` | yes | — | server/routes/callRoutes.js |
| POST | `/api/calls/:id/cancel` | yes | — | server/routes/callRoutes.js |
| POST | `/api/calls/:id/end` | yes | yes | server/routes/callRoutes.js |
| POST | `/api/calls/:id/reject` | yes | yes | server/routes/callRoutes.js |
| GET | `/api/calls/active` | yes | — | server/routes/callRoutes.js |
| GET | `/api/calls/history` | yes | yes | server/routes/callRoutes.js |
| POST | `/api/calls/initiate` | yes | yes | server/routes/callRoutes.js |
| GET | `/api/calls/stats` | yes | — | server/routes/callRoutes.js |
| GET | `/api/channels` | yes | yes | server/routes/channelRoutes.js |
| POST | `/api/channels` | yes | — | server/routes/channelRoutes.js |
| DELETE | `/api/channels/:id` | yes | — | server/routes/channelRoutes.js |
| GET | `/api/channels/:id` | yes | — | server/routes/channelRoutes.js |
| PATCH | `/api/channels/:id` | yes | — | server/routes/channelRoutes.js |
| PUT | `/api/channels/:id` | yes | — | server/routes/channelRoutes.js |
| GET | `/api/channels/:id/posts` | yes | yes | server/routes/channelRoutes.js |
| POST | `/api/channels/:id/posts` | yes | — | server/routes/channelRoutes.js |
| POST | `/api/channels/:id/posts/schedule` | yes | yes | server/routes/channelRoutes.js |
| GET | `/api/channels/:id/posts/scheduled` | yes | yes | server/routes/channelRoutes.js |
| DELETE | `/api/channels/:id/posts/scheduled/:id` | yes | yes | server/routes/channelRoutes.js |
| POST | `/api/channels/:id/posts/scheduled/:id/publish` | yes | yes | server/routes/channelRoutes.js |
| GET | `/api/channels/:id/stats` | yes | — | server/routes/channelRoutes.js |
| POST | `/api/channels/:id/subscribe` | yes | yes | server/routes/channelRoutes.js |
| POST | `/api/channels/:id/unsubscribe` | yes | yes | server/routes/channelRoutes.js |
| GET | `/api/channels/mine` | yes | yes | server/routes/channelRoutes.js |
| POST | `/api/channels/posts/:id/like` | yes | yes | server/routes/channelRoutes.js |
| POST | `/api/chat-display/bubble-style` | yes | — | server/routes/chatDisplayRoutes.js |
| POST | `/api/chat-display/font-size` | yes | — | server/routes/chatDisplayRoutes.js |
| POST | `/api/chat-display/reset` | yes | — | server/routes/chatDisplayRoutes.js |
| GET | `/api/chat-display/settings` | yes | — | server/routes/chatDisplayRoutes.js |
| PUT | `/api/chat-display/settings` | yes | — | server/routes/chatDisplayRoutes.js |
| POST | `/api/chat-display/theme` | yes | — | server/routes/chatDisplayRoutes.js |
| POST | `/api/chat-display/toggle-network/:id` | yes | — | server/routes/chatDisplayRoutes.js |
| POST | `/api/chat-display/toggle-status/:id` | yes | — | server/routes/chatDisplayRoutes.js |
| POST | `/api/chat-display/toggle-timestamp/:id` | yes | — | server/routes/chatDisplayRoutes.js |
| PUT | `/api/chat-lock/:id/settings` | yes | yes | server/routes/chatLockRoutes.js |
| POST | `/api/chat-lock/:id/toggle` | yes | yes | server/routes/chatLockRoutes.js |
| POST | `/api/chat-lock/lock` | yes | yes | server/routes/chatLockRoutes.js |
| GET | `/api/chat-lock/locked` | yes | — | server/routes/chatLockRoutes.js |
| DELETE | `/api/chat-lock/remove` | yes | yes | server/routes/chatLockRoutes.js |
| GET | `/api/chat-lock/status/:id` | yes | yes | server/routes/chatLockRoutes.js |
| POST | `/api/chat-lock/toggle` | yes | — | server/routes/chatLockRoutes.js |
| POST | `/api/chat-lock/unlock` | yes | yes | server/routes/chatLockRoutes.js |
| POST | `/api/chat-lock/unlock-biometric` | yes | yes | server/routes/chatLockRoutes.js |
| GET | `/api/chat-settings` | yes | — | server/routes/chatSettingsRoutes.js |
| PUT | `/api/chat-settings` | yes | — | server/routes/chatSettingsRoutes.js |
| POST | `/api/chat-settings/archive-all` | yes | — | server/routes/chatSettingsRoutes.js |
| POST | `/api/chat-settings/auto-archive` | yes | — | server/routes/chatSettingsRoutes.js |
| POST | `/api/chat-settings/auto-reply` | yes | — | server/routes/chatSettingsRoutes.js |
| POST | `/api/chat-settings/clear-all` | yes | — | server/routes/chatSettingsRoutes.js |
| GET | `/api/chat-settings/export` | yes | — | server/routes/chatSettingsRoutes.js |
| GET | `/api/chat-settings/folders` | yes | — | server/routes/chatSettingsRoutes.js |
| POST | `/api/chat-settings/folders` | yes | — | server/routes/chatSettingsRoutes.js |
| DELETE | `/api/chat-settings/folders/:id` | yes | — | server/routes/chatSettingsRoutes.js |
| PUT | `/api/chat-settings/folders/:id` | yes | — | server/routes/chatSettingsRoutes.js |
| GET | `/api/chat-settings/global-wallpaper` | yes | — | server/routes/chatSettingsRoutes.js |
| POST | `/api/chat-settings/global-wallpaper` | yes | — | server/routes/chatSettingsRoutes.js |
| POST | `/api/chat-settings/media-quality` | yes | — | server/routes/chatSettingsRoutes.js |
| POST | `/api/chat-settings/quick-reactions` | yes | — | server/routes/chatSettingsRoutes.js |
| POST | `/api/chat-settings/swipe-actions` | yes | — | server/routes/chatSettingsRoutes.js |
| POST | `/api/chat-settings/toggle/:id` | yes | — | server/routes/chatSettingsRoutes.js |
| GET | `/api/chats` | yes | yes | server/routes/chatRoutes.js |
| POST | `/api/chats` | yes | yes | server/routes/chatRoutes.js |
| DELETE | `/api/chats/:id` | yes | — | server/routes/chatRoutes.js |
| GET | `/api/chats/:id` | yes | — | server/routes/chatRoutes.js |
| POST | `/api/chats/:id/archive` | yes | — | server/routes/chatRoutes.js |
| PUT | `/api/chats/:id/archive` | yes | — | server/routes/chatRoutes.js |
| DELETE | `/api/chats/:id/clear` | yes | yes | server/routes/chatRoutes.js |
| POST | `/api/chats/:id/clear` | yes | — | server/routes/chatRoutes.js |
| GET | `/api/chats/:id/media` | yes | yes | server/routes/chatRoutes.js |
| POST | `/api/chats/:id/mute` | yes | yes | server/routes/chatRoutes.js |
| PUT | `/api/chats/:id/mute` | yes | — | server/routes/chatRoutes.js |
| POST | `/api/chats/:id/pin` | yes | — | server/routes/chatRoutes.js |
| PUT | `/api/chats/:id/pin` | yes | — | server/routes/chatRoutes.js |
| POST | `/api/chats/:id/read` | yes | — | server/routes/chatRoutes.js |
| POST | `/api/chats/:id/report` | yes | yes | server/routes/chatRoutes.js |
| GET | `/api/chats/:id/search` | yes | — | server/routes/chatRoutes.js |
| POST | `/api/chats/:id/unarchive` | yes | — | server/routes/chatRoutes.js |
| PUT | `/api/chats/:id/unarchive` | yes | — | server/routes/chatRoutes.js |
| POST | `/api/chats/:id/unmute` | yes | — | server/routes/chatRoutes.js |
| PUT | `/api/chats/:id/unmute` | yes | — | server/routes/chatRoutes.js |
| POST | `/api/chats/:id/unpin` | yes | — | server/routes/chatRoutes.js |
| PUT | `/api/chats/:id/unpin` | yes | — | server/routes/chatRoutes.js |
| GET | `/api/chats/archived` | yes | — | server/routes/chatRoutes.js |
| GET | `/api/contacts` | yes | yes | server/routes/contactRoutes.js |
| POST | `/api/contacts` | yes | yes | server/routes/contactRoutes.js |
| DELETE | `/api/contacts/:id` | yes | yes | server/routes/contactRoutes.js |
| GET | `/api/contacts/:id` | yes | — | server/routes/contactRoutes.js |
| PUT | `/api/contacts/:id` | yes | — | server/routes/contactRoutes.js |
| PATCH | `/api/contacts/:id/block` | yes | — | server/routes/contactRoutes.js |
| PATCH | `/api/contacts/:id/favorite` | yes | yes | server/routes/contactRoutes.js |
| GET | `/api/contacts/export` | yes | — | server/routes/contactRoutes.js |
| POST | `/api/contacts/import` | yes | — | server/routes/contactRoutes.js |
| POST | `/api/contacts/merge` | yes | — | server/routes/contactRoutes.js |
| GET | `/api/contacts/stats` | yes | — | server/routes/contactRoutes.js |
| DELETE | `/api/devices/:id` | yes | yes | server/routes/deviceRoutes.js |
| POST | `/api/devices/:id/heartbeat` | yes | — | server/routes/deviceRoutes.js |
| POST | `/api/devices/:id/refresh` | yes | — | server/routes/deviceRoutes.js |
| POST | `/api/devices/generate-code` | yes | yes | server/routes/deviceRoutes.js |
| POST | `/api/devices/generate-qr` | yes | yes | server/routes/deviceRoutes.js |
| POST | `/api/devices/link-phone` | yes | — | server/routes/deviceRoutes.js |
| GET | `/api/devices/linked` | yes | yes | server/routes/deviceRoutes.js |
| GET | `/api/devices/qr-status/:id` | yes | yes | server/routes/deviceRoutes.js |
| POST | `/api/devices/verify-code` | yes | yes | server/routes/deviceRoutes.js |
| POST | `/api/devices/verify-qr` | yes | — | server/routes/deviceRoutes.js |
| GET | `/api/emoji/all` | yes | — | server/routes/emojiRoutes.js |
| GET | `/api/emoji/categories` | yes | — | server/routes/emojiRoutes.js |
| GET | `/api/emoji/category/:id` | yes | — | server/routes/emojiRoutes.js |
| GET | `/api/emoji/frequent` | yes | — | server/routes/emojiRoutes.js |
| POST | `/api/emoji/frequent` | yes | — | server/routes/emojiRoutes.js |
| GET | `/api/emoji/search` | yes | — | server/routes/emojiRoutes.js |
| GET | `/api/emoji/unicode/:id` | yes | — | server/routes/emojiRoutes.js |
| GET | `/api/gb-features` | yes | — | server/routes/gbFeaturesRoutes.js |
| PUT | `/api/gb-features` | yes | — | server/routes/gbFeaturesRoutes.js |
| POST | `/api/gb-features/cancel-schedule` | yes | — | server/routes/gbFeaturesRoutes.js |
| DELETE | `/api/gb-features/filters` | yes | — | server/routes/gbFeaturesRoutes.js |
| GET | `/api/gb-features/filters` | yes | — | server/routes/gbFeaturesRoutes.js |
| POST | `/api/gb-features/filters` | yes | — | server/routes/gbFeaturesRoutes.js |
| PUT | `/api/gb-features/filters` | yes | — | server/routes/gbFeaturesRoutes.js |
| POST | `/api/gb-features/pin` | yes | — | server/routes/gbFeaturesRoutes.js |
| GET | `/api/gb-features/pinned` | yes | — | server/routes/gbFeaturesRoutes.js |
| POST | `/api/gb-features/schedule` | yes | — | server/routes/gbFeaturesRoutes.js |
| GET | `/api/gb-features/scheduled` | yes | — | server/routes/gbFeaturesRoutes.js |
| POST | `/api/gb-features/star` | yes | — | server/routes/gbFeaturesRoutes.js |
| GET | `/api/gb-features/starred` | yes | — | server/routes/gbFeaturesRoutes.js |
| POST | `/api/gb-features/toggle` | yes | — | server/routes/gbFeaturesRoutes.js |
| POST | `/api/gb-features/unpin` | yes | — | server/routes/gbFeaturesRoutes.js |
| POST | `/api/gb-features/unstar` | yes | — | server/routes/gbFeaturesRoutes.js |
| GET | `/api/gb-settings` | yes | — | server/routes/gbSettingsRoutes.js |
| PUT | `/api/gb-settings` | yes | — | server/routes/gbSettingsRoutes.js |
| GET | `/api/gb-settings/advanced` | yes | — | server/routes/gbSettingsRoutes.js |
| PUT | `/api/gb-settings/advanced` | yes | — | server/routes/gbSettingsRoutes.js |
| POST | `/api/gb-settings/advanced/archive-on-swipe` | yes | — | server/routes/gbSettingsRoutes.js |
| POST | `/api/gb-settings/advanced/confirm-clear` | yes | — | server/routes/gbSettingsRoutes.js |
| POST | `/api/gb-settings/advanced/copy-sent` | yes | — | server/routes/gbSettingsRoutes.js |
| POST | `/api/gb-settings/advanced/double-tap` | yes | — | server/routes/gbSettingsRoutes.js |
| POST | `/api/gb-settings/advanced/enter-to-send` | yes | — | server/routes/gbSettingsRoutes.js |
| POST | `/api/gb-settings/advanced/exact-timestamps` | yes | — | server/routes/gbSettingsRoutes.js |
| POST | `/api/gb-settings/advanced/extended-status` | yes | — | server/routes/gbSettingsRoutes.js |
| POST | `/api/gb-settings/auto-delete` | yes | — | server/routes/gbSettingsRoutes.js |
| POST | `/api/gb-settings/auto-download` | yes | — | server/routes/gbSettingsRoutes.js |
| POST | `/api/gb-settings/call-quality` | yes | — | server/routes/gbSettingsRoutes.js |
| POST | `/api/gb-settings/dnd` | yes | — | server/routes/gbSettingsRoutes.js |
| POST | `/api/gb-settings/font` | yes | — | server/routes/gbSettingsRoutes.js |
| GET | `/api/gb-settings/groups` | yes | — | server/routes/gbSettingsRoutes.js |
| PUT | `/api/gb-settings/groups` | yes | — | server/routes/gbSettingsRoutes.js |
| POST | `/api/gb-settings/groups/auto-join` | yes | — | server/routes/gbSettingsRoutes.js |
| GET | `/api/gb-settings/groups/hidden` | yes | — | server/routes/gbSettingsRoutes.js |
| POST | `/api/gb-settings/groups/hide` | yes | — | server/routes/gbSettingsRoutes.js |
| POST | `/api/gb-settings/groups/join-via-link` | yes | — | server/routes/gbSettingsRoutes.js |
| POST | `/api/gb-settings/groups/unhide` | yes | — | server/routes/gbSettingsRoutes.js |
| GET | `/api/gb-settings/home-screen` | yes | — | server/routes/gbSettingsRoutes.js |
| PUT | `/api/gb-settings/home-screen` | yes | — | server/routes/gbSettingsRoutes.js |
| POST | `/api/gb-settings/icon-pack` | yes | — | server/routes/gbSettingsRoutes.js |
| GET | `/api/gb-settings/media` | yes | — | server/routes/gbSettingsRoutes.js |
| PUT | `/api/gb-settings/media` | yes | — | server/routes/gbSettingsRoutes.js |
| POST | `/api/gb-settings/media/auto-save-status` | yes | — | server/routes/gbSettingsRoutes.js |
| POST | `/api/gb-settings/media/gallery-viewer` | yes | — | server/routes/gbSettingsRoutes.js |
| POST | `/api/gb-settings/media/hd-upload` | yes | — | server/routes/gbSettingsRoutes.js |
| POST | `/api/gb-settings/media/zoom` | yes | — | server/routes/gbSettingsRoutes.js |
| GET | `/api/gb-settings/messaging` | yes | — | server/routes/gbSettingsRoutes.js |
| PUT | `/api/gb-settings/messaging` | yes | — | server/routes/gbSettingsRoutes.js |
| DELETE | `/api/gb-settings/messaging/filter` | yes | — | server/routes/gbSettingsRoutes.js |
| POST | `/api/gb-settings/messaging/filter` | yes | — | server/routes/gbSettingsRoutes.js |
| GET | `/api/gb-settings/messaging/filters` | yes | — | server/routes/gbSettingsRoutes.js |
| POST | `/api/gb-settings/messaging/pin` | yes | — | server/routes/gbSettingsRoutes.js |
| GET | `/api/gb-settings/messaging/pinned` | yes | — | server/routes/gbSettingsRoutes.js |
| POST | `/api/gb-settings/messaging/schedule` | yes | — | server/routes/gbSettingsRoutes.js |
| POST | `/api/gb-settings/messaging/star` | yes | — | server/routes/gbSettingsRoutes.js |
| GET | `/api/gb-settings/messaging/starred` | yes | — | server/routes/gbSettingsRoutes.js |
| POST | `/api/gb-settings/messaging/unpin` | yes | — | server/routes/gbSettingsRoutes.js |
| POST | `/api/gb-settings/messaging/unstar` | yes | — | server/routes/gbSettingsRoutes.js |
| GET | `/api/gb-settings/privacy` | yes | — | server/routes/gbSettingsRoutes.js |
| PUT | `/api/gb-settings/privacy` | yes | — | server/routes/gbSettingsRoutes.js |
| POST | `/api/gb-settings/privacy/anti-delete-status` | yes | — | server/routes/gbSettingsRoutes.js |
| POST | `/api/gb-settings/privacy/anti-revoke` | yes | — | server/routes/gbSettingsRoutes.js |
| POST | `/api/gb-settings/privacy/anti-status-view` | yes | — | server/routes/gbSettingsRoutes.js |
| POST | `/api/gb-settings/privacy/delivery-receipts` | yes | — | server/routes/gbSettingsRoutes.js |
| POST | `/api/gb-settings/privacy/forward-label` | yes | — | server/routes/gbSettingsRoutes.js |
| POST | `/api/gb-settings/privacy/incognito-mode` | yes | — | server/routes/gbSettingsRoutes.js |
| POST | `/api/gb-settings/privacy/last-seen` | yes | — | server/routes/gbSettingsRoutes.js |
| POST | `/api/gb-settings/privacy/online-status` | yes | — | server/routes/gbSettingsRoutes.js |
| POST | `/api/gb-settings/privacy/read-receipts` | yes | — | server/routes/gbSettingsRoutes.js |
| POST | `/api/gb-settings/privacy/view-once-bypass` | yes | — | server/routes/gbSettingsRoutes.js |
| POST | `/api/gb-settings/reset` | yes | — | server/routes/gbSettingsRoutes.js |
| GET | `/api/gb-settings/stats` | yes | — | server/routes/gbSettingsRoutes.js |
| POST | `/api/gb-settings/theme` | yes | — | server/routes/gbSettingsRoutes.js |
| GET | `/api/gb-settings/themes` | yes | — | server/routes/gbSettingsRoutes.js |
| PUT | `/api/gb-settings/themes` | yes | — | server/routes/gbSettingsRoutes.js |
| POST | `/api/gb-settings/themes/custom` | yes | — | server/routes/gbSettingsRoutes.js |
| POST | `/api/gb-settings/themes/font` | yes | — | server/routes/gbSettingsRoutes.js |
| POST | `/api/gb-settings/themes/widget` | yes | — | server/routes/gbSettingsRoutes.js |
| POST | `/api/gb-settings/upload-quality` | yes | — | server/routes/gbSettingsRoutes.js |
| GET | `/api/groups` | yes | yes | server/routes/groupRoutes.js |
| POST | `/api/groups` | yes | yes | server/routes/groupRoutes.js |
| DELETE | `/api/groups/:id` | yes | yes | server/routes/groupRoutes.js |
| GET | `/api/groups/:id` | yes | — | server/routes/groupRoutes.js |
| PATCH | `/api/groups/:id` | yes | yes | server/routes/groupRoutes.js |
| PUT | `/api/groups/:id` | yes | — | server/routes/groupRoutes.js |
| GET | `/api/groups/:id/announcements` | yes | — | server/routes/groupRoutes.js |
| POST | `/api/groups/:id/announcements` | yes | yes | server/routes/groupRoutes.js |
| DELETE | `/api/groups/:id/announcements/:id` | yes | — | server/routes/groupRoutes.js |
| POST | `/api/groups/:id/announcements/:id/pin` | yes | — | server/routes/groupRoutes.js |
| PATCH | `/api/groups/:id/archive` | yes | yes | server/routes/groupRoutes.js |
| GET | `/api/groups/:id/events` | yes | — | server/routes/groupRoutes.js |
| POST | `/api/groups/:id/events` | yes | yes | server/routes/groupRoutes.js |
| DELETE | `/api/groups/:id/events/:id` | yes | — | server/routes/groupRoutes.js |
| POST | `/api/groups/:id/events/:id/rsvp` | yes | yes | server/routes/groupRoutes.js |
| POST | `/api/groups/:id/leave` | yes | yes | server/routes/groupRoutes.js |
| POST | `/api/groups/:id/members` | yes | — | server/routes/groupRoutes.js |
| DELETE | `/api/groups/:id/members/:id` | yes | yes | server/routes/groupRoutes.js |
| DELETE | `/api/groups/:id/members/:id/admin` | yes | yes | server/routes/groupRoutes.js |
| PUT | `/api/groups/:id/members/:id/admin` | yes | yes | server/routes/groupRoutes.js |
| PATCH | `/api/groups/:id/mute` | yes | yes | server/routes/groupRoutes.js |
| POST | `/api/groups/:id/mute` | yes | yes | server/routes/groupRoutes.js |
| GET | `/api/groups/:id/polls` | yes | — | server/routes/groupRoutes.js |
| POST | `/api/groups/:id/polls` | yes | yes | server/routes/groupRoutes.js |
| POST | `/api/groups/:id/polls/:id/end` | yes | — | server/routes/groupRoutes.js |
| POST | `/api/groups/:id/polls/:id/vote` | yes | yes | server/routes/groupRoutes.js |
| PUT | `/api/groups/:id/settings` | yes | — | server/routes/groupRoutes.js |
| PATCH | `/api/groups/:id/star` | yes | yes | server/routes/groupRoutes.js |
| POST | `/api/groups/:id/unmute` | yes | yes | server/routes/groupRoutes.js |
| POST | `/api/groups/bulk-invite` | yes | yes | server/routes/groupRoutes.js |
| POST | `/api/groups/export` | yes | yes | server/routes/groupRoutes.js |
| POST | `/api/groups/import` | yes | yes | server/routes/groupRoutes.js |
| GET | `/api/groups/preferences` | yes | yes | server/routes/groupRoutes.js |
| PUT | `/api/groups/preferences` | yes | yes | server/routes/groupRoutes.js |
| GET | `/api/health` | — | — | index.js |
| DELETE | `/api/messages/:id` | yes | — | server/routes/messageRoutes.js |
| GET | `/api/messages/:id` | yes | yes | server/routes/messageRoutes.js |
| POST | `/api/messages/:id` | yes | yes | server/routes/messageRoutes.js |
| PUT | `/api/messages/:id/edit` | yes | — | server/routes/messageRoutes.js |
| POST | `/api/messages/:id/forward` | yes | — | server/routes/messageRoutes.js |
| POST | `/api/messages/:id/react` | yes | — | server/routes/messageRoutes.js |
| DELETE | `/api/messages/:id/react/:id` | yes | — | server/routes/messageRoutes.js |
| GET | `/api/messages/:id/reactions` | yes | — | server/routes/messageRoutes.js |
| POST | `/api/messages/:id/star` | yes | — | server/routes/messageRoutes.js |
| POST | `/api/messages/:id/unstar` | yes | yes | server/routes/messageRoutes.js |
| POST | `/api/messages/:id/voice` | yes | — | server/routes/messageRoutes.js |
| POST | `/api/messages/cancel-schedule` | yes | — | server/routes/messageRoutes.js |
| GET | `/api/messages/schedule` | yes | — | server/routes/messageRoutes.js |
| POST | `/api/messages/schedule` | yes | yes | server/routes/messageRoutes.js |
| GET | `/api/messages/scheduled` | yes | — | server/routes/messageRoutes.js |
| GET | `/api/messages/search` | yes | — | server/routes/messageRoutes.js |
| GET | `/api/messages/starred` | yes | — | server/routes/messageRoutes.js |
| DELETE | `/api/notifications` | yes | yes | server/routes/notificationRoutes.js |
| GET | `/api/notifications` | yes | yes | server/routes/notificationRoutes.js |
| DELETE | `/api/notifications/:id` | yes | yes | server/routes/notificationRoutes.js |
| PATCH | `/api/notifications/:id/read` | yes | yes | server/routes/notificationRoutes.js |
| POST | `/api/notifications/dnd` | yes | — | server/routes/notificationRoutes.js |
| POST | `/api/notifications/dnd/schedule` | yes | — | server/routes/notificationRoutes.js |
| POST | `/api/notifications/permission` | yes | — | server/routes/notificationRoutes.js |
| PATCH | `/api/notifications/read-all` | yes | yes | server/routes/notificationRoutes.js |
| GET | `/api/notifications/settings` | yes | yes | server/routes/notificationRoutes.js |
| PUT | `/api/notifications/settings` | yes | yes | server/routes/notificationRoutes.js |
| POST | `/api/notifications/sound` | yes | — | server/routes/notificationRoutes.js |
| GET | `/api/notifications/sounds` | yes | — | server/routes/notificationRoutes.js |
| POST | `/api/notifications/test` | yes | — | server/routes/notificationRoutes.js |
| POST | `/api/notifications/toggle/:id` | yes | — | server/routes/notificationRoutes.js |
| GET | `/api/notifications/unread-count` | yes | yes | server/routes/notificationRoutes.js |
| GET | `/api/permissions` | yes | yes | server/routes/permissionRoutes.js |
| POST | `/api/permissions/block` | yes | — | server/routes/permissionRoutes.js |
| GET | `/api/permissions/blocked` | yes | — | server/routes/permissionRoutes.js |
| PUT | `/api/permissions/device` | yes | — | server/routes/permissionRoutes.js |
| POST | `/api/permissions/device/camera` | yes | yes | server/routes/permissionRoutes.js |
| POST | `/api/permissions/device/contacts` | yes | yes | server/routes/permissionRoutes.js |
| POST | `/api/permissions/device/location` | yes | — | server/routes/permissionRoutes.js |
| POST | `/api/permissions/device/media` | yes | yes | server/routes/permissionRoutes.js |
| POST | `/api/permissions/device/microphone` | yes | yes | server/routes/permissionRoutes.js |
| POST | `/api/permissions/device/notifications` | yes | yes | server/routes/permissionRoutes.js |
| POST | `/api/permissions/device/photos` | yes | — | server/routes/permissionRoutes.js |
| POST | `/api/permissions/device/storage` | yes | — | server/routes/permissionRoutes.js |
| PUT | `/api/permissions/feature` | yes | — | server/routes/permissionRoutes.js |
| GET | `/api/permissions/history` | yes | — | server/routes/permissionRoutes.js |
| PUT | `/api/permissions/privacy` | yes | — | server/routes/permissionRoutes.js |
| POST | `/api/permissions/reset` | yes | yes | server/routes/permissionRoutes.js |
| POST | `/api/permissions/unblock` | yes | — | server/routes/permissionRoutes.js |
| POST | `/api/privacy/2fa/disable` | yes | — | server/routes/privacyRoutes.js |
| POST | `/api/privacy/2fa/enable` | yes | — | server/routes/privacyRoutes.js |
| POST | `/api/privacy/block/:id` | yes | — | server/routes/privacyRoutes.js |
| GET | `/api/privacy/blocked` | yes | — | server/routes/privacyRoutes.js |
| POST | `/api/privacy/disappearing-messages` | yes | — | server/routes/privacyRoutes.js |
| POST | `/api/privacy/groups` | yes | — | server/routes/privacyRoutes.js |
| GET | `/api/privacy/is-blocked/:id` | yes | — | server/routes/privacyRoutes.js |
| POST | `/api/privacy/last-seen` | yes | — | server/routes/privacyRoutes.js |
| GET | `/api/privacy/settings` | yes | — | server/routes/privacyRoutes.js |
| PUT | `/api/privacy/settings` | yes | — | server/routes/privacyRoutes.js |
| POST | `/api/privacy/unblock/:id` | yes | — | server/routes/privacyRoutes.js |
| GET | `/api/recovery` | yes | — | server/routes/recoveryRoutes.js |
| POST | `/api/recovery/2fa/disable` | yes | — | server/routes/recoveryRoutes.js |
| POST | `/api/recovery/2fa/setup` | yes | — | server/routes/recoveryRoutes.js |
| POST | `/api/recovery/2fa/verify` | yes | — | server/routes/recoveryRoutes.js |
| POST | `/api/recovery/codes/generate` | yes | — | server/routes/recoveryRoutes.js |
| POST | `/api/recovery/codes/verify` | yes | — | server/routes/recoveryRoutes.js |
| POST | `/api/recovery/email/setup` | yes | — | server/routes/recoveryRoutes.js |
| POST | `/api/recovery/email/verify` | yes | — | server/routes/recoveryRoutes.js |
| GET | `/api/recovery/history` | yes | — | server/routes/recoveryRoutes.js |
| POST | `/api/recovery/phone/setup` | yes | — | server/routes/recoveryRoutes.js |
| PUT | `/api/recovery/protection` | yes | — | server/routes/recoveryRoutes.js |
| POST | `/api/recovery/request` | yes | — | server/routes/recoveryRoutes.js |
| POST | `/api/recovery/reset-password` | yes | — | server/routes/recoveryRoutes.js |
| GET | `/api/recovery/trusted-contacts` | yes | — | server/routes/recoveryRoutes.js |
| POST | `/api/recovery/trusted-contacts/add` | yes | — | server/routes/recoveryRoutes.js |
| POST | `/api/recovery/trusted-contacts/remove` | yes | — | server/routes/recoveryRoutes.js |
| GET | `/api/storage/by-chat` | yes | — | server/routes/storageRoutes.js |
| POST | `/api/storage/clear-cache` | yes | — | server/routes/storageRoutes.js |
| POST | `/api/storage/clear-temp` | yes | — | server/routes/storageRoutes.js |
| DELETE | `/api/storage/clear/:id` | yes | yes | server/routes/storageRoutes.js |
| GET | `/api/storage/network-usage` | yes | — | server/routes/storageRoutes.js |
| POST | `/api/storage/reset-network-stats` | yes | — | server/routes/storageRoutes.js |
| GET | `/api/storage/usage` | yes | yes | server/routes/storageRoutes.js |
| GET | `/api/stories` | yes | yes | server/routes/storyRoutes.js |
| POST | `/api/stories` | yes | yes | server/routes/storyRoutes.js |
| DELETE | `/api/stories/:id` | yes | yes | server/routes/storyRoutes.js |
| GET | `/api/stories/:id` | yes | — | server/routes/storyRoutes.js |
| POST | `/api/stories/:id/react` | yes | yes | server/routes/storyRoutes.js |
| POST | `/api/stories/:id/reply` | yes | yes | server/routes/storyRoutes.js |
| POST | `/api/stories/:id/save` | yes | yes | server/routes/storyRoutes.js |
| POST | `/api/stories/:id/view` | yes | yes | server/routes/storyRoutes.js |
| GET | `/api/stories/:id/viewers` | yes | yes | server/routes/storyRoutes.js |
| GET | `/api/stories/highlights` | yes | yes | server/routes/storyRoutes.js |
| POST | `/api/stories/highlights` | yes | yes | server/routes/storyRoutes.js |
| DELETE | `/api/stories/highlights/:id` | yes | yes | server/routes/storyRoutes.js |
| PATCH | `/api/stories/highlights/:id` | yes | yes | server/routes/storyRoutes.js |
| GET | `/api/stories/mine` | yes | yes | server/routes/storyRoutes.js |
| GET | `/api/system/info` | yes | — | server/routes/systemRoutes.js |
| GET | `/api/system/live` | yes | — | server/routes/systemRoutes.js |
| POST | `/api/system/notify` | yes | — | server/routes/systemRoutes.js |
| GET | `/api/system/presence/:id` | yes | — | server/routes/systemRoutes.js |
| GET | `/api/system/ready` | yes | — | server/routes/systemRoutes.js |
| POST | `/api/translations/detect` | yes | — | server/routes/translationRoutes.js |
| GET | `/api/translations/languages` | yes | — | server/routes/translationRoutes.js |
| POST | `/api/translations/translate` | yes | yes | server/routes/translationRoutes.js |
| POST | `/api/translations/translate-text` | yes | yes | server/routes/translationRoutes.js |
| GET | `/api/users/:id` | yes | yes | server/routes/userRoutes.js |
| POST | `/api/users/:id/block` | yes | yes | server/routes/userRoutes.js |
| GET | `/api/users/:id/media` | yes | — | server/routes/userRoutes.js |
| GET | `/api/users/:id/stats` | yes | — | server/routes/userRoutes.js |
| POST | `/api/users/:id/unblock` | yes | yes | server/routes/userRoutes.js |
| DELETE | `/api/users/avatar` | yes | yes | server/routes/userRoutes.js |
| POST | `/api/users/avatar` | yes | yes | server/routes/userRoutes.js |
| GET | `/api/users/blocked` | yes | — | server/routes/userRoutes.js |
| GET | `/api/users/online` | yes | — | server/routes/userRoutes.js |
| GET | `/api/users/privacy-settings` | yes | — | server/routes/userRoutes.js |
| PATCH | `/api/users/privacy-settings` | yes | yes | server/routes/userRoutes.js |
| PUT | `/api/users/privacy-settings` | yes | — | server/routes/userRoutes.js |
| PATCH | `/api/users/profile` | yes | yes | server/routes/userRoutes.js |
| GET | `/api/users/search` | yes | yes | server/routes/userRoutes.js |
| PATCH | `/api/users/status` | yes | yes | server/routes/userRoutes.js |
