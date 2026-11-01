# Offline mode & local backup

Two separate things that are easy to mix up:

| Layer | Lives on | Answers | Survives |
| --- | --- | --- | --- |
| **SQLite mirror** | the API host (`data/backups/<userId>.db`) | "give me a file I can keep" | process restarts, Mongo outages |
| **Browser cache (IndexedDB)** | the user's device | "keep the app usable with no network" | page reloads, offline periods |
| **JSON export** | wherever the user puts it | "portable, readable, re-importable" | everything |

A **Mongo backup document** (`POST /api/backup`, `Backup.model.js`) is a fourth,
older path — it stores a payload the client sends and supports scheduling and
e-mail. It is untouched and still available.

---

## 1. SQLite mirror (server)

```
gbchat/server/services/sqliteStore.js     schema + read/write/delete
gbchat/server/controllers/localBackupController.js  REST handlers
gbchat/server/routes/localBackupRoutes.js /api/backup/local/*
gbchat/server/routes/offlineRoutes.js     /api/backup/offline/*
```

* Uses the built-in **`node:sqlite`** (Node ≥ 22.5) — no native module, nothing
  to compile in Docker. On older runtimes every handler answers
  `503 SQLITE_UNAVAILABLE` and the rest of the app is unaffected.
* One file per account: `data/backups/<sanitised-user-id>.db`
  (override the directory with `SQLITE_DIR`).
* Tables: `meta`, `profile`, `chats`, `messages`, `contacts`
  (`messages` is indexed on `(chat_id, created_at)`).
* A snapshot is written inside a **single transaction** — a crash mid-write
  leaves the previous snapshot intact, never a half-restored mirror.
* `WAL` journal mode: readers do not block the writer.

### Endpoints

| Method | Path | Notes |
| --- | --- | --- |
| GET | `/api/backup/local/status` | `{ sqlite, backup, mongo }` |
| GET | `/api/backup/local/exists` | `{ exists, sizeBytes }` |
| POST | `/api/backup/local/snapshot` | Rebuild from Mongo (500 chats / 5 000 messages by default) |
| GET | `/api/backup/local/export` | `application/json` download |
| GET | `/api/backup/local/download` | `application/vnd.sqlite3` download |
| POST | `/api/backup/local/import` | Body = a previous export |
| DELETE | `/api/backup/local` | Removes the file (and `-wal`, `-shm`) |
| GET | `/api/backup/offline/chats` | Reads the mirror — works with Mongo down |
| GET | `/api/backup/offline/messages/:chatId` | Same, per chat |

Mount order matters: these routers are registered **before**
`app.use("/api/backup", backupRoutes)`, otherwise `/api/backup/:backupId`
would capture `/local/...` and `/offline/...`.

### Sizing

| Env var | Default | Meaning |
| --- | --- | --- |
| `SQLITE_DIR` | `<cwd>/data/backups` | Where the files live |
| `OFFLINE_MESSAGE_LIMIT` | `5000` | Messages per snapshot |

`data/` is git-ignored; mount it as a volume in Docker if you want snapshots to
survive container replacement.

---

## 2. Browser cache + outbox (client)

```
gbchat/client/src/lib/offlineDb.js       IndexedDB wrapper
gbchat/client/src/hooks/useOfflineSync.js outbox replay + online/offline state
gbchat/client/src/components/layout/OfflineBanner.jsx status strip
```

* `kv` store — chat list, profile, contacts (last successful fetch).
* `messages` store — per-chat messages, indexed by `chatId`, ordered by
  `createdAt`.
* `outbox` store — messages composed offline.

Behaviour:

1. `useChatStore.fetchChats()` writes the normalised list to the cache and, if
   the request fails with anything other than 401, falls back to it (with
   `error: "Offline — showing your cached conversations"`).
2. `fetchMessages()` caches every successful page and reads the cache when the
   request fails.
3. `sendMessage()` optimistically renders the bubble. If the request fails
   **without a response** (offline), the message is queued and marked `queued`
   instead of `failed`.
4. `useOfflineSync` flushes the outbox on `online` and on demand. 4xx responses
   drop the item (the server will never accept it); network errors keep it.
5. `OfflineBanner` shows the state and a "Send now" action; tapping the box
   opens `/backup`.

If IndexedDB is blocked (private mode), `offlineDb` falls back to
`localStorage` for chats/profile and keeps the last 200 messages per chat.

### Storage keys

```
gbchat-offline                  database
  kv        { key, value, updatedAt }
  messages  { id, chatId, createdAt, payload }
  outbox    { id, chatId, text, type, queuedAt }
gbchat.offline.*                localStorage fallback
```

---

## 3. The `/backup` dashboard

`client/src/pages/BackupPage.jsx` (linked from Settings → Storage):

* **Local SQLite backup** — size, chats, messages, contacts, last snapshot,
  `node:sqlite` availability, Mongo state; actions: create snapshot, download
  `.db`, download JSON, delete.
* **On-device cache** — engine, cached chats/messages, queued messages;
  actions: flush queue, export offline data, restore from file, clear cache.
* **Server backups** — the five most recent Mongo backup documents.

Importing a file restores the browser cache **and** (best effort) the server
mirror, so a wiped device can be re-seeded from one JSON file.

---

## 4. Limitations (honest list)

* The mirror is per user and rebuilt on demand — it is a backup, not a live
  replica; a Mongo write after the snapshot does not reach the file.
* It is stored unencrypted on the API host. Treat the disk as trusted or add
  application-level encryption before enabling this on shared infrastructure.
* Restoring into Mongo is deliberately **not** implemented: an export can
  re-seed the local mirror and the browser, but not rewrite server history.
* Outbox replay is at-most-once per queued item and has no idempotency key, so
  a message that also arrived through another path can duplicate.
* Story expiry, presence and typing are not cached offline.
