# GBChat — UI / Layout and API Endpoint Review

_Scope: `gbchat/client` (React + Vite + Tailwind) and `gbchat/server` (Express)._
_No features are removed by this review — every finding is either a fix or an addition._

---

## 1. Layout & navigation

### 1.1 Layout bugs found

| # | Issue | Where | Impact |
|---|-------|-------|--------|
| L1 | Double bottom padding on mobile: `MainLayout` adds `pb-16` **and** every page adds its own `pb-16` | `layout/MainLayout.jsx:38`, `pages/{Stories,Channels,Calls,Groups}Page.jsx`, `ProfilePage.jsx` | ~64px of dead space above the bottom nav, content cut off |
| L2 | Six different hand-rolled headers. Mobile header ≠ desktop header (different sizes, emoji-only titles, actions hidden on mobile) | all pages | Jumps when resizing; desktop-only actions unreachable on phones |
| L3 | Only `ChatPage` and `SettingsPage` have a menu button; **Stories / Channels / Calls / Groups have no way to open the navigation drawer on mobile** | pages | Dead-end navigation on phones |
| L4 | `ChatPage` places a `fixed` mobile bar (`h-14`) and compensates with `mt-14`; the chat list is then `absolute inset-0` | `pages/ChatPage.jsx:100-140` | List overlaps the fixed bar, story rail hidden on mobile, fragile media-query state |
| L5 | `useMediaQuery` starts as `false` and only corrects itself in an effect | `hooks/useMediaQuery.js` | First paint shows the mobile layout on desktop and vice-versa (visible flash); `MainLayout` starts with the sidebar closed |
| L6 | Bottom nav is `fixed` with `z-[9999]` | `layout/BottomNav.jsx:26` | Sits on top of modals/drawers and the FAB; conflicts with page padding |
| L7 | 6 items in the bottom bar on a 320px screen | `layout/BottomNav.jsx` | Labels wrap/truncate, tap targets < 44px |
| L8 | `TopBar.jsx` exists but is never mounted; `HomePage.jsx` is unreachable (kept, not removed) | — | Dead code, two competing shells in the codebase |
| L9 | `index.css` removes all scrollbars and disables text selection globally | `index.css:5-90` | Desktop users can't scroll precisely or copy a message; feels like a native app shell on web |
| L10 | Settings has its own hamburger that opens an in-page section drawer while the app drawer is separate | `pages/SettingsPage.jsx:58` | Two different "menus" with the same icon |
| L11 | Chat page has no URL state (`?chat=`); `ProfilePage` navigates to `/?chat=…` and nothing consumes it | `pages/ChatPage.jsx`, `ProfilePage.jsx:66` | The "Message" button on a profile does nothing |
| L12 | Z-index is ad-hoc (`z-10…z-50`, `z-[9999]`); overlays, drawers and modals stack inconsistently | several | Modals can appear *under* the drawer/backdrop |

### 1.2 What "proper layout" means here

* **One responsive shell** (`MainLayout`): fixed sidebar column on `lg+`, slide-over drawer below `lg`, bottom nav rendered *in flow* (not fixed) so pages never need padding hacks.
* **One header component** (`PageHeader`) used by every page: menu button on mobile, title + subtitle, right-aligned actions, optional toolbar row (search/filters/tabs) shared by both breakpoints.
* **Two-pane chat**: list pane (`lg:w-[380px]`) + conversation pane; single-pane on mobile with an explicit back action and URL state.
* **Sticky/flex heights** instead of `h-screen` + `overflow-hidden` on every page.
* **A11y/desktop affordances**: selectable text, slim scrollbars, visible focus rings, 44px tap targets, `safe-area` insets.

---

## 2. API endpoint review

The client is shipping calls to endpoints the server does not expose. Because almost every call is wrapped in `try/catch` with a local sample-data fallback, these failures are silent: the UI looks fine but nothing persists.

### 2.1 Verb / path mismatches (client → actual server)

| Client call | Server actually has | Verdict |
|---|---|---|
| `POST /chats/:id/archive` | `PUT /chats/:id/archive` | fix client |
| `POST /chats/:id/pin` | `PUT /chats/:id/pin` | fix client |
| `POST /chats/:id/mute` | `PUT /chats/:id/mute` | fix client |
| `POST /chats/:id/unpin\|unmute\|unarchive` | not implemented (only `PUT` toggles) | add server aliases |
| `POST /chats/:id/clear` | `DELETE /chats/:id/clear` | fix client |
| `POST /groups/create` | `POST /groups` | fix client |
| `GET /groups/:id` | not implemented | add server |
| `DELETE /groups/:id` | not implemented | add server |
| `POST /groups/:id/admins/:memberId` | `PUT /groups/:id/members/:memberId/admin` | fix client |
| `POST /messages` (create) | `POST /messages/:chatId` | fix client |
| `PATCH /messages/:id` (edit) | `PUT /messages/:id/edit` | fix client |
| `POST /messages/:id/reply` | not implemented (reply = `sendMessage` with `replyTo`) | fix client |
| `POST /messages/:id/unstar` | not implemented (only `/star`) | add server |
| `POST /messages/schedule` (create) | `POST /messages/schedule` is bound to *list* scheduled messages | add server create handler, keep list |
| `POST /messages/translate` | `POST /translations/translate` | fix client |
| `GET /users/blocked` | `GET /privacy/blocked` | fix client |
| `POST /users/:id/unblock` | not implemented | add server |
| `POST /auth/verify-otp` | `POST /auth/phone-verify/confirm` | fix client / add alias |
| `POST /auth/resend-otp` | `POST /auth/phone-verify/resend` | fix client / add alias |
| `POST /auth/change-password` | `POST /account/change-password` | fix client / add alias |
| `POST /auth/refresh` | **not implemented** | add server (the axios interceptor depends on it) |
| `GET/PATCH /settings/privacy` | `GET/PUT /privacy/settings` | fix client |
| `GET /settings/devices` | `GET /devices/linked` | fix client |
| `POST /settings/2fa/*` | `POST /account/2fa/*` | fix client |
| `POST /channels/:id/unsubscribe` | not implemented | add server |
| `PATCH /channels/:id`, `DELETE /channels/:id`, `GET /channels/:id`, `GET /channels/:id/stats` | not implemented (only list/posts/subscribe) | add server |
| `GET /stories/:id`, `GET /stories/:id/viewers`, `POST /stories/mute/:id` | not implemented | add server |
| `GET /calls/stats` | exists server-side but unused by client | fine |
| `GET/POST/PUT/DELETE /notifications` (list, mark read) | **no list endpoints at all** (no `Notification` model) | documented, left out of this pass |
| `POST /upload/file\|image\|signed-url` | **no upload routes mounted** | documented, left out of this pass |
| `POST /chats/:id/report`, `POST /stories/:id/save`, `POST /groups/export`, `POST /groups/bulk-invite` | not implemented | documented |

### 2.2 Structural problems

* `lib/api.js` hardcodes `http://localhost:5000/api` when `VITE_API_URL` is unset → breaks any deploy where the frontend is served by the same origin, and breaks the Vite dev proxy that already exists in `vite.config.js`. Default must be the relative `/api`.
* `lib/apiService` (the “official” API map) is **never imported** and half of its paths are wrong — it is worse than not having it. It gets rewritten to match the server 1:1 and exported for reuse.
* `setTimeout`-based "status simulation" and dozens of `console.log` blocks in `ChatArea` flood the console in production.
* The axios interceptor only reads tokens from `localStorage.token`, while the auth store keeps its own copy in `auth-storage`.

---

## 3. What changed in this pass

### 3.1 Layout & UI

**New shared primitives**

| File | Purpose |
|---|---|
| `components/layout/PageHeader.jsx` | One responsive header for every page: drawer trigger (mobile), icon tile, title + subtitle + badge, right-aligned actions, optional toolbar row (search / filters / tabs) |
| `components/layout/EmptyState.jsx` | One empty/zero-data state used by chats, stories, channels, calls |
| `components/layout/MainLayout.jsx` | Rebuilt shell: static collapsible sidebar (`lg+`), slide-over drawer with backdrop + Esc handling (`< lg`), in-flow bottom nav, right side panel |
| `components/layout/Sidebar.jsx` | Rebuilt: collapsible rail (state persisted), active-route indicator, unread badge, profile card, theme toggle, legal links, logout |
| `components/layout/BottomNav.jsx` | In-flow (no longer `fixed` + `z-[9999]`), unread badge, 6 equal-width tabs with 44px targets |

**Page-level fixes**

* `ChatPage` is a real two-pane layout: list pane (`lg:w-[380px]`) + conversation pane; single pane on mobile with a back action; the active chat lives in the URL (`?chat=<id>`), so a profile's "Message" button, refresh and browser-back all work.
* `ChatList` header now uses `PageHeader` (search, sort, new-chat all still available on mobile), with skeleton loading and a real empty state.
* `SettingsPage` is master/detail instead of a second hamburger drawer: section list on mobile → section content with back, permanent sidebar on desktop, plus padded content and a fixed-scrolling GB Features drawer.
* `StoriesPage`, `ChannelsPage`, `CallsPage`, `GroupsPage` use one header each; actions that were desktop-only (filters, view modes, insights) are now reachable on mobile.
* `ProfilePage` reads the profile payload correctly (`data.user ?? data`), has an offline fallback and a consistent sticky header.
* `CallsPage` filter actually filters ("Missed/Incoming/Outgoing" used to compare against the call *type*).
* `useMediaQuery` resolves synchronously → no desktop/mobile layout flash; also fixes the sidebar starting closed on desktop.
* `index.css`: text selection restored, slim desktop scrollbars (opt-in `scrollbar-hide` still available), visible focus rings, `prefers-reduced-motion` support, `page-shell` / `page-scroll` / `surface-card` / `page-header` utilities.
* `index.html`: pinch-zoom re-enabled (accessibility).
* `vite.config.js`: dev/preview servers bind to `0.0.0.0`, allow tunnel hosts, and expose an overridable API target (`VITE_DEV_API_TARGET`).
* Demo mode (`Enter demo` on the auth screen) renders the whole app on sample data without a backend — useful for design review and for environments without MongoDB.

### 3.2 API endpoints

* `lib/api.js` rewritten as a 1:1 mirror of the mounted Express routes; `apiService` is now accurate (it previously pointed at ~20 endpoints that did not exist and was never imported).
* Default base URL is now the same-origin `/api` instead of the hardcoded `http://localhost:5000/api`, so the Vite proxy and same-origin deployments work; the interceptor is demo-aware and no longer spams toasts.
* Client call sites corrected to the routes the server exposes (see the table in §2.1): chats archive/pin/mute/clear verbs, `messages/:chatId`, message edit, groups create/update/members-admin, translations, storage, contacts favourite, devices.
* **Added server endpoints** (nothing removed):
  * auth: `POST /auth/refresh`, `POST /auth/verify-otp`, `POST /auth/resend-otp`
  * chats: `PUT|POST /chats/:id/unarchive|unpin|unmute`, `POST /chats/:id/clear`, `GET /chats/:id/media`, `GET /chats/:id/search`, `POST /chats/:id/report`
  * messages: `POST /messages/:messageId/unstar`, `POST /messages/schedule` now *creates* a scheduled message (`GET /scheduled` still lists them)
  * users: `POST /users/:userId/unblock`, `GET /users/blocked`, `PATCH /users/status`
  * groups: `GET|DELETE /groups/:id`, `PUT|PATCH /groups/:id`, `DELETE /groups/:id/members/:memberId/admin`, `POST /groups/:id/mute|unmute`, `PATCH /groups/:id/archive|star|mute`, `POST /groups/bulk-invite`, `POST /groups/export`
  * channels: `GET|PATCH|DELETE /channels/:id`, `GET /channels/:id/stats`, `POST /channels/:id/unsubscribe`, `POST /channels/posts/:postId/like`
  * stories: `GET /stories/:id`, `GET /stories/:id/viewers`, `POST /stories/:id/save`
  * devices: `POST /devices/generate-code`, `POST /devices/verify-code` (+ `linkCode` fields on the Device model)
  * chat lock: `POST /chat-lock/unlock-biometric`
  * user model: `starredChats`
* New tool: `npm run check:endpoints` (`scripts/check-endpoints.mjs`) diffs client calls against registered server routes. **Current status: 382 server routes, 82 active client calls, 0 unmatched.**

### 3.3 Known gaps (deliberately not touched)

* **Notifications feed** – the client has a notification store and UI hooks, but there is no `Notification` model or list/read endpoints. Needs a model + controller; out of scope for a UI pass.
* **Uploads** – `/upload/file`, `/upload/image`, `/upload/signed-url` have no router; images currently go through the per-chat multer upload.
* **Group invite link / join**, `POST /stories/mute|unmute`, `GET /channels/:id/follow` – still absent.
* **`npm run lint` is broken** – `gbchat/client/eslint.config.js` uses the ESLint 9 flat-config helpers (`eslint/config`, `@eslint/js`, `globals`) while `eslint ^8.56` is installed, and the two packages the config imports are not in `devDependencies`. Either bump ESLint to v9 (+ those two devDeps) or point the `lint` script at the existing `eslintrc.cjs` with `ESLINT_USE_FLAT_CONFIG=false`.
* `components/layout/TopBar.jsx` and `pages/HomePage.jsx` are unused. They were left in place (no feature removal); they can be deleted in a follow-up.

## 4. Round 2 — polish, realtime and theming

### 4.1 Theme system
* `store/useThemeStore.js` rewritten: 12 themes (`light`, `dark`, `gb-green`, `amoled`, `midnight`, `ocean`, `forest`, `sunset`, `rose`, `cyberpunk`, `forestlight`, `sakura`). Each theme declares a **mode**, a full primary scale and surface tokens (canvas / surface / surface-alt / border / text / muted).
* `applyTheme()` writes those to CSS custom properties on `<html>` (`--app-*`, `--color-primary-*`), sets `data-theme` / `data-mode` and `color-scheme`, so a theme change repaints the whole app — not just one accent colour.
* `index.css` gained a token layer (`--app-*`, radii, elevations, `--list-pane-width`, `--nav-rail-width`), desktop primitives (`.app-canvas`, `.panel`, `.panel-header`, `.nav-rail`, `.list-pane`, `.detail-pane`, `.elev-1..3`, `.hover-lift`) and a *theme surface bridge* that maps the existing Tailwind neutral greys onto the active theme tokens.
* Appearance settings renders palette swatches (accent / surface / canvas) with light-dark iconography instead of emoji, and "reset" now restores every appearance field.

### 4.2 Loading screen
* `components/common/Splash.jsx` rebuilt: branded logo mark, determinate progress, status copy, structural skeletons. No random blurred orbs, no `Math.random()` in render.
* `components/common/Skeleton.jsx` adds `Skeleton`, `ListSkeleton`, `CardGridSkeleton`, `SettingsSkeleton`; used by the chat list, contacts, notification feed, media gallery and call picker.

### 4.3 Stories — the "liking one likes all" bug
Root cause: `StoryViewer` kept a single local `isLiked` flag that was never scoped to a story, never persisted, and shared across every story in the viewer.
* `useStoryStore` now has `reactToStory(storyId, reaction, userId)` with per-story optimistic state (`myReaction`) and rollback, `viewStory(storyId, userId)` (idempotent, optimistic), `fetchStoryViewers`.
* `StoryViewer` derives `reaction` from the story being viewed (`myReaction` → `viewers[]` → legacy `reactions[]`), resets on story change, and calls `POST /stories/:id/react`. Replies post to `POST /stories/:id/reply` with the server's `{ text }` payload; the viewer list comes from `GET /stories/:id/viewers`.
* `GET /stories` is grouped per author (`{ user, stories[] }`) — the store now flattens it, so cards, ownership and view counts are correct.
* Cards show `myReaction` per story instead of a shared `isLiked`.
* Server-side: story view/reaction/reply now create `Notification` records for the owner.

### 4.4 Profile
* "Clicking my profile shows user not found" fixed: `/profile/:userId` now treats `me`, the cached `auth-storage` user and the signed-in id as *self* (rendered from local state, no network round-trip), falls back to cached data for other ids, and shows an actionable empty state instead of a bare string.
* Avatar upload works from the profile page (camera-badge button, 5 MB + MIME validation) and **removal** is now real: `DELETE /api/users/avatar` (new endpoint, clears local files too). The old "upload an empty file" hack is gone.

### 4.5 Realtime
* `hooks/useSocket.js` rewritten around **one shared socket** (previously every `useSocket()` call opened its own connection with `forceNew: true`, so the server's `onlineUsers` map pointed at a stale socket). Handlers are attached once.
* Client event names aligned with the server contract: `newMessage`, `messagesRead`/`messagesDelivered`, `typing`/`stopTyping` → `userTyping`/`userStopTyping`, `onlineUsers`/`userOnline`/`userOffline`, `incomingCall`/`callAccepted`/`callDeclined`/`callEnded`/`callFailed`.
* `useChatStore` gained the missing realtime actions (`receiveMessage`, `updateMessageStatus`, `setTyping`, `setOnlineUsers`, `updateContact`).

### 4.6 Calls (audio + video)
* `hooks/usePeerConnection.js` implements the full signaling handshake the server already exposes (`webrtc:offer`, `webrtc:answer`, `webrtc:ice-candidate`), queues ICE candidates until the remote description exists, supports screen share track replacement, TURN via `VITE_TURN_URL`/`VITE_TURN_USERNAME`/`VITE_TURN_CREDENTIAL`, and surfaces media-permission errors.
* `useCallStore` normalises server `Call` documents into the UI shape (direction, peer, participants), uses the real `participantId` payload, and never falls back to fake history outside demo mode.
* New `components/calls/IncomingCallOverlay.jsx` — global ringing card with accept/decline, mounted in `App`, plus the live `CallInterface` ("Ringing…" until answered).

### 4.7 Previously sample-only surfaces now on real APIs
| Surface | Endpoint |
| --- | --- |
| Chat list | `GET /api/chats` (normalised participants, unread, last message) |
| Groups list | `GET /api/groups` (**new**), plus star/archive/mute/leave/delete actions |
| Group create (multi-select) | `POST /api/groups` |
| Contacts | `GET/POST/DELETE /api/contacts`, `PATCH /api/contacts/:id/favorite` |
| Notifications feed | `GET /api/notifications`, `PATCH /:id/read`, `PATCH /read-all`, `DELETE /:id`, `DELETE /` (**new**), backed by a new `Notification` model |
| Notification settings | `GET/PUT /api/notifications/settings` |
| Media, links & docs | `GET /api/chats/:id/media` (normalised `content.media`, lightbox, error + retry) |
| App permissions | `GET /api/permissions`, `POST /api/permissions/device/*`, real contacts import |
| Contact list for new calls | `GET /api/contacts` |

### 4.8 Emoji → icons
All emoji used as UI chrome were replaced with Heroicons across auth/feature grids, settings headers and toasts, story highlights, privacy toggles, cache cleaner, device list, empty states, announcement targeting and group toasts. Emoji that are *content* (chat effects, avatar creator parts, language flags, story reactions) were intentionally kept.

### 4.9 Known gaps (still open)
* Group calls (server models 1:1 only) and channel scheduled posts.
* ESLint config mismatch (see §3.3) — lint is not runnable in this repo yet.
* WebRTC needs a TURN server for real NAT traversal in production (`VITE_TURN_*`).
