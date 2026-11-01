// server/socket/index.js
import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import { getSocketAdapterClients, isRedisConfigured } from "../config/redis.js";
import { socketRateLimit } from "./rateLimit.js";
import { markPresence } from "../grpc/server.js";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { chatHandler } from "./handlers/chatHandler.js";
import { presenceHandler } from "./handlers/presenceHandler.js";
import { typingHandler } from "./handlers/typingHandler.js";
import { callHandler } from "./handlers/callHandler.js";
import { deviceHandler } from "./handlers/deviceHandler.js";

const onlineUsers = new Map();
let ioInstance = null; // Store IO instance for external access

export const getOnlineUsers = () => onlineUsers;

export const getIO = () => ioInstance;

export const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      credentials: true,
      methods: ["GET", "POST"],
    },
    pingTimeout: 60000,
    pingInterval: 25000,
    transports: ['websocket', 'polling'], // Allow both transports
    // Horizontal scaling: several nodes can share one client connection stream
    maxHttpBufferSize: Number(process.env.SOCKET_MAX_BUFFER) || 1e6,
    connectionStateRecovery: {
      maxDisconnectionDuration: 2 * 60 * 1000,
      skipMiddlewares: true,
    },
  });

  // Cross-node fan-out (multi-server): every node publishes to Redis and the
  // adapter broadcasts to the other replicas, so a socket on node B receives
  // events raised on node A.
  if (isRedisConfigured) {
    getSocketAdapterClients()
      .then((clients) => {
        if (!clients) return;
        io.adapter(createAdapter(clients.pubClient, clients.subClient));
        console.log("🔗 Socket.IO Redis adapter enabled (multi-node mode)");
      })
      .catch((error) => console.warn("[socket] Redis adapter unavailable:", error.message));
  }

  // Store IO instance
  ioInstance = io;

  // Auth middleware
  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth.token ||
        socket.handshake.query.token ||
        socket.handshake.headers.cookie
          ?.split(";")
          .find((c) => c.trim().startsWith("gbchat_token="))
          ?.split("=")[1];

      if (!token) {
        console.log('[Socket] No token provided')
        return next(new Error("Authentication error"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);
      if (!user) {
        console.log('[Socket] User not found:', decoded.userId)
        return next(new Error("User not found"));
      }

      socket.userId = user._id.toString();
      socket.user = user;
      console.log('[Socket] Authenticated user:', user.fullName, '(', socket.userId, ')')
      next();
    } catch (error) {
      console.error('[Socket] Auth error:', error.message)
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`⚡ User connected: ${socket.user.fullName} (${socket.userId})`);

    // Abuse protection: every socket gets its own token bucket
    socketRateLimit(socket);

    // Join personal room
    socket.join(socket.userId);

    // Set online
    onlineUsers.set(socket.userId, socket.id);
    User.findByIdAndUpdate(socket.userId, { status: "online" }).exec();
    // Mirror presence into the shared store so gRPC lookups see this node
    markPresence(socket.userId, { online: true, socketId: socket.id }).catch(() => {});

    // Broadcast online status
    io.emit("userOnline", {
      userId: socket.userId,
      status: "online",
    });

    // Register handlers
    chatHandler(io, socket);
    presenceHandler(io, socket, onlineUsers);
    typingHandler(io, socket);
    callHandler(io, socket, onlineUsers);
    deviceHandler(io, socket, onlineUsers);

    // Join chat rooms
    socket.on("joinChat", (chatId) => {
      socket.join(chatId);
    });

    socket.on("leaveChat", (chatId) => {
      socket.leave(chatId);
    });

    // Disconnect
    socket.on("disconnect", async () => {
      console.log(`💔 User disconnected: ${socket.user.fullName}`);
      onlineUsers.delete(socket.userId);
      markPresence(socket.userId, { online: false, socketId: socket.id }).catch(() => {});

      await User.findByIdAndUpdate(socket.userId, {
        status: "offline",
        lastSeen: new Date(),
      });

      io.emit("userOffline", {
        userId: socket.userId,
        lastSeen: new Date(),
      });
    });
  });

  return io;
};