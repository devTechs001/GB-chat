// server/socket/handlers/deviceHandler.js
import Device from "../../models/Device.js";

export const deviceHandler = (io, socket, onlineUsers) => {
  // Handle device heartbeat (keep-alive)
  socket.on("device:heartbeat", async (data) => {
    try {
      const { deviceId } = data;
      if (!deviceId) return;

      const device = await Device.findById(deviceId);
      if (device && device.isActive) {
        await device.updateLastSeen();
      }
    } catch (error) {
      console.error("Device heartbeat error:", error);
    }
  });

  // Handle device sync request
  socket.on("device:sync", async (data) => {
    try {
      const { deviceId } = data;
      if (!deviceId) return;

      const device = await Device.findById(deviceId).populate("user");
      if (device && device.isActive) {
        // Send sync confirmation
        socket.emit("device:synced", {
          success: true,
          deviceId,
          timestamp: new Date(),
        });
      }
    } catch (error) {
      console.error("Device sync error:", error);
      socket.emit("device:synced", {
        success: false,
        error: "Sync failed",
      });
    }
  });

  // Handle device logout
  socket.on("device:logout", async (data) => {
    try {
      const { deviceId } = data;
      if (!deviceId) return;

      await Device.findByIdAndUpdate(deviceId, {
        isActive: false,
        lastSeen: new Date(),
      });

      socket.emit("device:loggedOut", {
        success: true,
        message: "Logged out successfully",
      });
    } catch (error) {
      console.error("Device logout error:", error);
    }
  });

  // Handle real-time message sync across devices
  socket.on("device:syncMessage", (data) => {
    try {
      const { userId, messageData } = data;
      if (!userId || !messageData) return;

      // Broadcast to all other devices of the same user
      socket.to(userId).emit("message:synced", {
        message: messageData,
        timestamp: new Date(),
      });
    } catch (error) {
      console.error("Message sync error:", error);
    }
  });

  // Handle chat list sync
  socket.on("device:syncChats", async (data) => {
    try {
      const { userId } = data;
      if (!userId) return;

      // Notify other devices to refresh chat list
      socket.to(userId).emit("chats:refresh", {
        timestamp: new Date(),
      });
    } catch (error) {
      console.error("Chat sync error:", error);
    }
  });
};
