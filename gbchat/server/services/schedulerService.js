// server/services/schedulerService.js
import cron from "node-cron";
import Message from "../models/Message.js";
import Chat from "../models/Chat.js";
import { acquireLock } from "../config/redis.js";

export const startScheduler = (io) => {
  // Check for scheduled messages every minute
  cron.schedule("* * * * *", async () => {
    // Only one replica runs the job per tick (no-op without Redis).
    if (!(await acquireLock("scheduler", 55_000))) return;
    try {
      const now = new Date();
      const scheduledMessages = await Message.find({
        isScheduled: true,
        scheduledAt: { $lte: now },
      }).populate("sender", "fullName avatar");

      for (const message of scheduledMessages) {
        message.isScheduled = false;
        message.createdAt = now;
        await message.save();

        const chat = await Chat.findById(message.chat);
        chat.lastMessage = message._id;
        await chat.save();

        chat.participants.forEach((p) => {
          io.to(p.user.toString()).emit("newMessage", {
            message,
            chatId: message.chat,
          });
        });
      }

      // Self-destructing messages
      const selfDestructMessages = await Message.find({
        "selfDestruct.enabled": true,
        "selfDestruct.viewedAt": { $ne: null },
      });

      for (const msg of selfDestructMessages) {
        const elapsed =
          (now - msg.selfDestruct.viewedAt) / 1000;
        if (elapsed >= msg.selfDestruct.duration) {
          msg.isDeleted = true;
          msg.deletedForEveryone = true;
          msg.content = { text: "Message expired" };
          await msg.save();

          const chat = await Chat.findById(msg.chat);
          chat.participants.forEach((p) => {
            io.to(p.user.toString()).emit("messageDeleted", {
              messageId: msg._id,
              chatId: msg.chat,
              forEveryone: true,
            });
          });
        }
      }
    } catch (error) {
      console.error("Scheduler error:", error);
    }
  });

  console.log("[scheduler] started (scheduled messages + self-destructing messages)");
};