// server/socket/handlers/chatHandler.js
import Message from "../../models/Message.js";
import Chat from "../../models/Chat.js";

export const chatHandler = (io, socket) => {
  socket.on("sendMessage", async (data) => {
    try {
      const { chatId, message } = data;

      // Emit to chat room
      socket.to(chatId).emit("newMessage", { chatId, message });
    } catch (error) {
      console.error("Chat handler error:", error);
    }
  });

  socket.on("messageRead", async ({ chatId, messageIds }) => {
    try {
      await Message.updateMany(
        { _id: { $in: messageIds }, sender: { $ne: socket.userId } },
        {
          $addToSet: {
            readBy: { user: socket.userId, readAt: new Date() },
          },
        }
      );

      socket.to(chatId).emit("messagesRead", {
        chatId,
        userId: socket.userId,
        messageIds,
      });
    } catch (error) {
      console.error("Read handler error:", error);
    }
  });

  socket.on("messageDelivered", async ({ chatId, messageIds }) => {
    try {
      await Message.updateMany(
        { _id: { $in: messageIds } },
        {
          $addToSet: {
            deliveredTo: { user: socket.userId, deliveredAt: new Date() },
          },
        }
      );

      socket.to(chatId).emit("messagesDelivered", {
        chatId,
        userId: socket.userId,
        messageIds,
      });
    } catch (error) {
      console.error("Delivery handler error:", error);
    }
  });
};