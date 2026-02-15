// server/socket/index.js
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { chatHandler } from "./handlers/chatHandler.js";
import { presenceHandler } from "./handlers/presenceHandler.js";
import { typingHandler } from "./handlers/typingHandler.js";
import { callHandler } from "./handlers/callHandler.js";

const onlineUsers = new Map();

export const getOnlineUsers = () => onlineUsers;

export const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      credentials: true,
    },
    pingTimeout: 60000,
  });

  // Auth middleware
  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth.token ||
        socket.handshake.headers.cookie
          ?.split(";")
          .find((c) => c.trim().startsWith("gbchat_token="))
          ?.split("=")[1];

      if (!token) return next(new Error("Authentication error"));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);
      if (!user) return next(new Error("User not found"));

      socket.userId = user._id.toString();
      socket.user = user;
      next();
    } catch (error) {
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`⚡ User connected: ${socket.user.fullName} (${socket.userId})`);

    // Join personal room
    socket.join(socket.userId);

    // Set online
    onlineUsers.set(socket.userId, socket.id);
    User.findByIdAndUpdate(socket.userId, { status: "online" }).exec();

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