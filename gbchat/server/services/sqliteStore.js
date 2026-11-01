// server/services/sqliteStore.js
/**
 * Local, offline-capable mirror of a user's most important data.
 *
 * Why SQLite? Mongo is the source of truth and needs a server. This store is a
 * *local* copy that survives restarts, works with the process offline (Mongo
 * down ⇒ the API can still answer from the last snapshot) and is a single file
 * the user can download as a real backup.
 *
 *   data/backups/<userId>.db        one file per account
 *   tables: meta, profile, chats, messages, contacts
 *
 * Uses the built-in `node:sqlite` (Node ≥ 22.5) so there is no native build
 * step and nothing to compile in Docker. If the runtime is older, every call
 * degrades to `{ available: false }` and the REST layer answers 503 — the app
 * itself keeps working.
 */
import fs from "node:fs";
import path from "node:path";

const DATA_DIR = process.env.SQLITE_DIR || path.join(process.cwd(), "data", "backups");

let DatabaseSync = null;
let loadError = null;

// The built-in module still emits an ExperimentalWarning on every start. It is
// harmless, and suppressing just this one keeps the boot logs readable.
const originalEmitWarning = process.emitWarning;
process.emitWarning = (warning, ...rest) => {
  const text = typeof warning === "string" ? warning : warning?.message || "";
  if (text.includes("SQLite is an experimental feature")) return;
  return originalEmitWarning.call(process, warning, ...rest);
};

try {
  ({ DatabaseSync } = await import("node:sqlite"));
} catch (error) {
  loadError = error.message;
} finally {
  process.emitWarning = originalEmitWarning;
}

export const isSqliteAvailable = () => Boolean(DatabaseSync);

export const sqliteInfo = () => ({
  available: isSqliteAvailable(),
  runtime: process.version,
  requires: "node:sqlite (Node ≥ 22.5)",
  directory: DATA_DIR,
  error: loadError,
});

const ensureDir = () => {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
};

/** Only ever touches `<dir>/<safe-user-id>.db`. */
const fileFor = (userId) => {
  const safe = String(userId).replace(/[^a-zA-Z0-9_-]/g, "");
  if (!safe) throw new Error("Invalid user id");
  return path.join(DATA_DIR, `${safe}.db`);
};

const openDb = (userId) => {
  if (!DatabaseSync) {
    const error = new Error("SQLite support is unavailable in this Node runtime");
    error.statusCode = 503;
    throw error;
  }
  ensureDir();

  const db = new DatabaseSync(fileFor(userId));
  db.exec(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS meta (
      key TEXT PRIMARY KEY,
      value TEXT
    );
    CREATE TABLE IF NOT EXISTS profile (
      id TEXT PRIMARY KEY,
      payload TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS chats (
      id TEXT PRIMARY KEY,
      name TEXT,
      is_group INTEGER DEFAULT 0,
      avatar TEXT,
      last_message_at TEXT,
      unread_count INTEGER DEFAULT 0,
      payload TEXT
    );
    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      chat_id TEXT NOT NULL,
      sender_id TEXT,
      sender_name TEXT,
      type TEXT,
      text TEXT,
      media_url TEXT,
      created_at TEXT,
      payload TEXT
    );
    CREATE TABLE IF NOT EXISTS contacts (
      id TEXT PRIMARY KEY,
      name TEXT,
      phone TEXT,
      email TEXT,
      avatar TEXT,
      payload TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_messages_chat ON messages(chat_id, created_at);
  `);
  return db;
};

const setMeta = (db, key, value) => {
  db.prepare(
    "INSERT INTO meta (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value"
  ).run(key, String(value));
};

const getMeta = (db, key) => {
  const row = db.prepare("SELECT value FROM meta WHERE key = ?").get(key);
  return row ? row.value : null;
};

/**
 * Write a full snapshot for one user. Runs in a single transaction: either the
 * whole backup lands or nothing does, so a crash mid-write can never leave a
 * half-restored mirror behind.
 */
export const writeSnapshot = (userId, { profile, chats = [], messages = [], contacts = [] }) => {
  const db = openDb(userId);
  const now = new Date().toISOString();

  try {
    db.exec("BEGIN");
    db.exec("DELETE FROM chats; DELETE FROM messages; DELETE FROM contacts; DELETE FROM profile;");

    if (profile) {
      db.prepare("INSERT INTO profile (id, payload, updated_at) VALUES (?, ?, ?)").run(
        String(profile._id || userId),
        JSON.stringify(profile),
        now
      );
    }

    const insertChat = db.prepare(
      `INSERT INTO chats (id, name, is_group, avatar, last_message_at, unread_count, payload)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    );
    for (const chat of chats) {
      insertChat.run(
        String(chat._id),
        chat.name || "",
        chat.isGroup ? 1 : 0,
        chat.avatar || "",
        chat.lastMessageAt ? new Date(chat.lastMessageAt).toISOString() : "",
        Number(chat.unreadCount || 0),
        JSON.stringify(chat)
      );
    }

    const insertMessage = db.prepare(
      `INSERT OR REPLACE INTO messages
       (id, chat_id, sender_id, sender_name, type, text, media_url, created_at, payload)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );
    for (const message of messages) {
      const chatId =
        typeof message.chat === "object" && message.chat
          ? message.chat._id || message.chat.id
          : message.chat;
      if (!chatId) continue;
      insertMessage.run(
        String(message._id),
        String(chatId),
        String(message.sender?._id || message.sender || ""),
        message.sender?.fullName || message.sender?.name || "",
        message.type || "text",
        message.content?.text || "",
        message.content?.media?.url || "",
        message.createdAt ? new Date(message.createdAt).toISOString() : now,
        JSON.stringify(message)
      );
    }

    const insertContact = db.prepare(
      "INSERT OR REPLACE INTO contacts (id, name, phone, email, avatar, payload) VALUES (?, ?, ?, ?, ?, ?)"
    );
    for (const contact of contacts) {
      const id = contact._id || contact.user?._id || contact.contactUserId;
      if (!id) continue;
      insertContact.run(
        String(id),
        contact.fullName || contact.name || "",
        contact.phone || contact.phoneNumber || "",
        contact.email || "",
        contact.avatar || "",
        JSON.stringify(contact)
      );
    }

    setMeta(db, "last_snapshot_at", now);
    setMeta(db, "chats", chats.length);
    setMeta(db, "messages", messages.length);
    setMeta(db, "contacts", contacts.length);
    db.exec("COMMIT");

    return {
      lastSnapshotAt: now,
      chats: chats.length,
      messages: messages.length,
      contacts: contacts.length,
      sizeBytes: fileSize(userId),
    };
  } catch (error) {
    try {
      db.exec("ROLLBACK");
    } catch {
      /* transaction already closed */
    }
    throw error;
  } finally {
    db.close();
  }
};

const fileSize = (userId) => {
  try {
    return fs.statSync(fileFor(userId)).size;
  } catch {
    return 0;
  }
};

export const hasSnapshot = (userId) => {
  try {
    return fs.existsSync(fileFor(userId));
  } catch {
    return false;
  }
};

/** Lightweight read used by the settings dashboard. */
export const snapshotStatus = (userId) => {
  if (!isSqliteAvailable()) return { available: false, ...sqliteInfo() };
  if (!hasSnapshot(userId)) {
    return { available: true, exists: false, sizeBytes: 0, chats: 0, messages: 0, contacts: 0, lastSnapshotAt: null };
  }

  const db = openDb(userId);
  try {
    return {
      available: true,
      exists: true,
      sizeBytes: fileSize(userId),
      chats: Number(getMeta(db, "chats") || 0),
      messages: Number(getMeta(db, "messages") || 0),
      contacts: Number(getMeta(db, "contacts") || 0),
      lastSnapshotAt: getMeta(db, "last_snapshot_at"),
    };
  } finally {
    db.close();
  }
};

/** Rebuild the JSON export (used by GET /api/backup/export and import checks). */
export const readSnapshot = (userId) => {
  const db = openDb(userId);
  try {
    const parse = (row) => (row?.payload ? JSON.parse(row.payload) : null);
    return {
      version: 1,
      exportedAt: new Date().toISOString(),
      profile: parse(db.prepare("SELECT payload FROM profile LIMIT 1").get()),
      chats: db.prepare("SELECT payload FROM chats").all().map(parse).filter(Boolean),
      messages: db.prepare("SELECT payload FROM messages ORDER BY created_at").all().map(parse).filter(Boolean),
      contacts: db.prepare("SELECT payload FROM contacts").all().map(parse).filter(Boolean),
    };
  } finally {
    db.close();
  }
};

export const snapshotPath = (userId) => {
  if (!hasSnapshot(userId)) {
    const error = new Error("No local backup yet — create one first");
    error.statusCode = 404;
    throw error;
  }
  return fileFor(userId);
};

export const deleteSnapshot = (userId) => {
  const removed = [];
  for (const suffix of ["", "-wal", "-shm"]) {
    const file = `${fileFor(userId)}${suffix}`;
    if (fs.existsSync(file)) {
      fs.unlinkSync(file);
      removed.push(path.basename(file));
    }
  }
  return removed;
};
