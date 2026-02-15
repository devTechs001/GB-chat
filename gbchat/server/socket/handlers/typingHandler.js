// server/socket/handlers/typingHandler.js
export const typingHandler = (io, socket) => {
  socket.on("typing", ({ chatId }) => {
    socket.to(chatId).emit("userTyping", {
      chatId,
      userId: socket.userId,
      fullName: socket.user.fullName,
    });
  });

  socket.on("stopTyping", ({ chatId }) => {
    socket.to(chatId).emit("userStopTyping", {
      chatId,
      userId: socket.userId,
    });
  });

  socket.on("recording", ({ chatId }) => {
    socket.to(chatId).emit("userRecording", {
      chatId,
      userId: socket.userId,
      fullName: socket.user.fullName,
    });
  });
};