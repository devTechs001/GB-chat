// server/socket/handlers/presenceHandler.js
export const presenceHandler = (io, socket, onlineUsers) => {
  socket.on("getOnlineUsers", () => {
    const users = Array.from(onlineUsers.keys());
    socket.emit("onlineUsers", users);
  });

  socket.on("setStatus", async (status) => {
    const { User } = await import("../../models/User.js");
    await User.findByIdAndUpdate(socket.userId, { status });
    io.emit("userStatusChanged", { userId: socket.userId, status });
  });
};