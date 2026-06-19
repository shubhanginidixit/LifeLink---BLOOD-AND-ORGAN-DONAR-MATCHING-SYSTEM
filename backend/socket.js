const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const Message = require("./models/Message");

let io;
const onlineUsers = new Map();

function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error("Authentication required"));
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch (err) {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.userId;
    if (!onlineUsers.has(userId)) onlineUsers.set(userId, new Set());
    onlineUsers.get(userId).add(socket.id);

    io.emit("online-users", Array.from(onlineUsers.keys()));

    socket.on("send-message", async (data) => {
      try {
        const msg = await Message.create({
          sender: userId,
          receiver: data.receiverId,
          text: data.text,
        });

        const populated = await msg.populate("sender", "profile.name");

        const receiverSockets = onlineUsers.get(data.receiverId);
        if (receiverSockets) {
          for (const sid of receiverSockets) {
            io.to(sid).emit("receive-message", {
              _id: msg._id,
              sender: userId,
              receiver: data.receiverId,
              text: data.text,
              timestamp: msg.timestamp,
              read: false,
              senderName: populated.sender?.profile?.name || "User",
            });
          }
        }

        socket.emit("message-sent", {
          _id: msg._id,
          sender: userId,
          receiver: data.receiverId,
          text: data.text,
          timestamp: msg.timestamp,
          read: false,
        });
      } catch (err) {
        socket.emit("chat-error", { message: "Failed to send message" });
      }
    });

    socket.on("typing", (data) => {
      const sockets = onlineUsers.get(data.receiverId);
      if (sockets) {
        for (const sid of sockets) {
          io.to(sid).emit("user-typing", { userId });
        }
      }
    });

    socket.on("stop-typing", (data) => {
      const sockets = onlineUsers.get(data.receiverId);
      if (sockets) {
        for (const sid of sockets) {
          io.to(sid).emit("user-stop-typing", { userId });
        }
      }
    });

    socket.on("mark-read", async (data) => {
      try {
        await Message.updateMany(
          { sender: data.userId, receiver: userId, read: false },
          { read: true }
        );
        const senderSockets = onlineUsers.get(data.userId);
        if (senderSockets) {
          for (const sid of senderSockets) {
            io.to(sid).emit("messages-read", { userId });
          }
        }
      } catch (err) {
        // non-critical
      }
    });

    socket.on("disconnect", () => {
      const sockets = onlineUsers.get(userId);
      if (sockets) {
        sockets.delete(socket.id);
        if (sockets.size === 0) onlineUsers.delete(userId);
      }
      io.emit("online-users", Array.from(onlineUsers.keys()));
    });
  });
}

function getIO() {
  if (!io) throw new Error("Socket.IO not initialized");
  return io;
}

function isUserOnline(userId) {
  return onlineUsers.has(userId) && onlineUsers.get(userId).size > 0;
}

function emitToUser(userId, event, data) {
  const sockets = onlineUsers.get(userId);
  if (sockets) {
    for (const sid of sockets) {
      io.to(sid).emit(event, data);
    }
  }
}

function emitToAll(event, data) {
  if (io) io.emit(event, data);
}

module.exports = { initSocket, getIO, isUserOnline, emitToUser, emitToAll };
