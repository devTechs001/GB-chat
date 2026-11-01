# Web Push — background notifications

GBChat sends real push notifications through the browser's push service
(FCM, Mozilla autopush, Apple), not just in-app toasts. That means a message
arrives on a phone with the app closed and the screen off.

This document covers how it works, how to configure it, and what to check when
a push does not arrive.

---

## 1. How a push travels

```
POST /api/messages/:chatId
        │
        ├─ Message saved
        ├─ socket.io  → users with the app open (instant, in-app)
        └─ webPush.sendToUsers(participants)
                 │
                 ├─ PushSubscription.find({ user, isActive })
                 ├─ web-push signs with VAPID + encrypts (aes128gcm)
                 └─ HTTPS POST → fcm.googleapis.com / updates.push.services.mozilla.com
                                    │
                              service worker `push` event
                                    │
                              showNotification()  → user taps
                                    │
                              notificationclick → focus/open /chats/:id
```

Two suppression rules keep it from being noisy:

| Where | Rule |
| --- | --- |
| **Server** | Participants with `isMuted` (or an active `muteUntil`) are skipped. |
| **Service worker** | If a focused/visible app window exists and the payload is not `force`, the banner is suppressed and the page gets a `PUSH_RECEIVED` message instead. Push is *always* still sent by the server — it cannot know who is looking at the app. |

---

## 2. Configuration

Generate a key pair once per environment:

```bash
cd gbchat/server
npm run generate:vapid
```

It prints:

```env
VAPID_PUBLIC_KEY=BIn5el5R…
VAPID_PRIVATE_KEY=dumu4hw…
VAPID_SUBJECT=mailto:notifications@gbchat.app
```

Add them to `gbchat/server/.env` (or your host's environment). Optional knobs:

| Variable | Default | Meaning |
| --- | --- | --- |
| `WEB_PUSH_ENABLED` | `true` | `false` turns the whole feature off |
| `WEB_PUSH_TTL_SECONDS` | `86400` | How long the push service may hold an undelivered message |
| `WEB_PUSH_MAX_SUBS_PER_USER` | `20` | Older subscriptions beyond this are dropped |

**Without keys the app still works.** `GET /api/push/public-key` returns
`enabled: false` with a reason, Settings → Notifications shows "Disabled on the
server", and in-app notifications behave exactly as before. Nothing crashes.

> The public key is shipped to the browser; the private key must never be
> committed. `.env` files are untracked in this repository (see §6).

---

## 3. API

All routes are authenticated (`protect`); write routes are rate-limited.

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/api/push/public-key` | `{ enabled, publicKey, reason }` |
| `GET` | `/api/push/status` | `{ enabled, mine, server: { subscriptions, users, failing } }` |
| `POST` | `/api/push/subscribe` | Upsert a subscription `{ subscription: { endpoint, keys: { p256dh, auth }, expirationTime } }` |
| `DELETE` | `/api/push/subscribe` | Remove one endpoint `{ endpoint }` |
| `DELETE` | `/api/push/subscriptions` | Remove every subscription for the account |
| `POST` | `/api/push/test` | Deliver a test push to the caller's own devices |

### Storage

`PushSubscription` is its own collection, not a field on `User`, because one
account normally has several browsers:

| Field | Notes |
| --- | --- |
| `user` | owner |
| `endpoint` | the capability URL from the browser |
| `endpointHash` | SHA-256 of the endpoint — **unique index**. Keeps the index inside Mongo's key limit and out of the index files. |
| `keys.p256dh`, `keys.auth` | subscription keys |
| `failureCount`, `lastError`, `lastUsedAt` | delivery health |

Re-subscribing the same browser updates the existing row (a shared device can
change accounts without leaving a stale subscription behind). 404/410 from the
push service means the subscription is dead and it is deleted on the spot.

---

## 4. Client

`src/lib/push.js`

| Function | Notes |
| --- | --- |
| `isPushSupported()` | Push API + service worker + Notification |
| `enablePush()` | The **only** path that asks for permission, and only from a click |
| `disablePush()` | Unsubscribes locally, then deletes the server row |
| `syncPushSubscription()` | Silent: re-registers an existing subscription on load (returning user, account switch) |
| `sendTestPush()` | Settings → Notifications → "Send test push" |

Settings → Notifications → **Push notifications** shows three states with an
action each: *Active on this device*, *Off on this device*, *Blocked in browser
settings* (only the browser can undo that), plus *Disabled on the server*.

The service worker (`public/sw.js`) handles `push` and `notificationclick`:
it prefers focusing a window already on the target route, otherwise opens one.

---

## 5. Troubleshooting

| Symptom | Check |
| --- | --- |
| UI says *Disabled on the server* | `GET /api/push/public-key` → `reason`. Usually VAPID keys missing. |
| "0 devices registered" after enabling | Permission denied, or `POST /api/push/subscribe` failed — look for `[push]` lines in the server log. |
| Test push returns `sent: 0` | The account has no `PushSubscription` rows (wrong account, or a different browser). |
| Push arrives minutes late | That is the push service batching; `urgency: high` is set for messages and missed calls. |
| Works in Chrome, not iOS Safari | iOS requires the PWA to be **installed to the Home Screen** (iOS 16.4+). |

---

## 6. Security notes

* The private VAPID key identifies your server to every push service. Treat it
  like a signing key; rotate with `npm run generate:vapid` (all subscriptions
  must re-subscribe, which the client does silently on next load).
* `endpoint` values are capability URLs: anyone holding one can send pushes to
  that browser. They are never logged and never returned by the API.
* This round also **untracked `gbchat/.env` and `gbchat/server/.env`** from Git
  (they were committed with placeholder secrets). The files stay on disk; only
  `.env.example` belongs in the repository.
