// server/socket/handlers/callHandler.js
import Call from "../../models/Call.js";

export const callHandler = (io, socket, onlineUsers) => {
  socket.on("initiateCall", async ({ recipientId, type, chatId }) => {
    const call = await Call.create({
      caller: socket.userId,
      participants: [
        { user: socket.userId, status: "accepted" },
        { user: recipientId, status: "ringing" },
      ],
      type,
      chat: chatId,
      status: "ringing",
    });

    const recipientSocketId = onlineUsers.get(recipientId);
    if (recipientSocketId) {
      io.to(recipientSocketId).emit("incomingCall", {
        callId: call._id,
        caller: {
          _id: socket.userId,
          fullName: socket.user.fullName,
          avatar: socket.user.avatar,
        },
        type,
      });
    } else {
      call.status = "missed";
      await call.save();
      socket.emit("callFailed", { reason: "User offline" });
    }
  });

  socket.on("acceptCall", async ({ callId }) => {
    const call = await Call.findById(callId);
    call.status = "ongoing";
    call.startedAt = new Date();

    const participant = call.participants.find(
      (p) => p.user.toString() === socket.userId
    );
    if (participant) {
      participant.status = "accepted";
      participant.joinedAt = new Date();
    }

    await call.save();

    const callerSocketId = onlineUsers.get(call.caller.toString());
    if (callerSocketId) {
      io.to(callerSocketId).emit("callAccepted", { callId });
    }
  });

  socket.on("declineCall", async ({ callId }) => {
    const call = await Call.findById(callId);
    call.status = "declined";
    await call.save();

    const callerSocketId = onlineUsers.get(call.caller.toString());
    if (callerSocketId) {
      io.to(callerSocketId).emit("callDeclined", { callId });
    }
  });

  socket.on("endCall", async ({ callId }) => {
    const call = await Call.findById(callId);
    call.status = "ended";
    call.endedAt = new Date();
    if (call.startedAt) {
      call.duration = Math.round((call.endedAt - call.startedAt) / 1000);
    }
    await call.save();

    call.participants.forEach((p) => {
      if (p.user.toString() !== socket.userId) {
        const sid = onlineUsers.get(p.user.toString());
        if (sid) io.to(sid).emit("callEnded", { callId });
      }
    });
  });

  // WebRTC signaling
  socket.on("webrtc:offer", ({ to, offer }) => {
    const sid = onlineUsers.get(to);
    if (sid) io.to(sid).emit("webrtc:offer", { from: socket.userId, offer });
  });

  socket.on("webrtc:answer", ({ to, answer }) => {
    const sid = onlineUsers.get(to);
    if (sid) io.to(sid).emit("webrtc:answer", { from: socket.userId, answer });
  });

  socket.on("webrtc:ice-candidate", ({ to, candidate }) => {
    const sid = onlineUsers.get(to);
    if (sid)
      io.to(sid).emit("webrtc:ice-candidate", {
        from: socket.userId,
        candidate,
      });
  });
};