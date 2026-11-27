// server/services/socketService.js
/**
 * Realtime fan-out helpers.
 *
 * Why this exists: controllers, notification producers and background jobs all
 * need "send this to that user" but must not import `socket/index.js` — that
 * module builds the server and imports every handler, so importing it from a
 * controller would create a cycle (index → handlers → controller → index).
 *
 * Instead the server *registers* its io instance here once, and everyone else
 * reads it. Every helper degrades to a no-op when no socket server exists
 * (worker process, unit tests, HTTP-only service), so callers never need a
 * null check.
 */

let ioRef = null;

/** Called once by socket/index.js after the server is constructed. */
export const registerSocketServer = (io) => {
  ioRef = io;
  return io;
};

export const getSocketServer = () => ioRef;

export const isRealtimeEnabled = () => Boolean(ioRef);

/**
 * Emit an event to every device of one user.
 * @returns {number} how many sockets received it (0 when realtime is off)
 */
export const emitToUser = (userId, event, payload) => {
  if (!ioRef || !userId || !event) return 0;
  const room = String(userId);
  const sockets = ioRef.sockets?.adapter?.rooms?.get(room);
  ioRef.to(room).emit(event, payload);
  return sockets?.size || 0;
};

/** Emit the same event to several users, de-duplicated. */
export const emitToUsers = (userIds = [], event, payload) => {
  const unique = [...new Set((userIds || []).filter(Boolean).map(String))];
  let delivered = 0;
  unique.forEach((id) => {
    delivered += emitToUser(id, event, payload);
  });
  return delivered;
};

/** Emit to a chat/group room (members that joined it, not their personal rooms). */
export const emitToRoom = (roomId, event, payload) => {
  if (!ioRef || !roomId || !event) return 0;
  ioRef.to(String(roomId)).emit(event, payload);
  return ioRef.sockets?.adapter?.rooms?.get(String(roomId))?.size || 0;
};

/** Force a socket into a room (used when a user opens a chat). */
export const joinRoom = (socket, roomId) => {
  if (!socket || !roomId) return false;
  socket.join(String(roomId));
  return true;
};

export const leaveRoom = (socket, roomId) => {
  if (!socket || !roomId) return false;
  socket.leave(String(roomId));
  return true;
};

/** Number of live sockets for a user, so callers can decide to push instead. */
export const countUserSockets = (userId) =>
  ioRef?.sockets?.adapter?.rooms?.get(String(userId))?.size || 0;

/** Presence snapshot maintained by socket/index.js. */
export const isUserOnline = (userId, onlineUsers) => {
  if (onlineUsers?.has) return onlineUsers.has(String(userId));
  return countUserSockets(userId) > 0;
};

export default {
  registerSocketServer,
  getSocketServer,
  isRealtimeEnabled,
  emitToUser,
  emitToUsers,
  emitToRoom,
  joinRoom,
  leaveRoom,
  countUserSockets,
  isUserOnline,
};
