// backend/server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());

const server = http.createServer(app);

// ✅ This line MUST come after `server` is created
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Frontend dev server
    methods: ["GET", "POST"]
  }
});

// 🔌 Socket.IO connection handler
io.on('connection', (socket) => {
  console.log(`🟢 User connected: ${socket.id}`);

  socket.on('joinRoom', (room) => {
    socket.join(room);
    console.log(`User ${socket.id} joined room ${room}`);
  });

  socket.on('sendMessage', async ({ room, message }) => {
    const saveMessage = require('./db/saveMessage'); // Lazy require to avoid circular import
    const data = {
      chatRoomId: room,
      senderId: socket.id,
      message
    };

    await saveMessage(data);
    io.to(room).emit('receiveMessage', data);
  });

  socket.on('disconnect', () => {
    console.log(`🔴 User disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
