// backend/server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// Allow frontend origin
app.use(cors());

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Frontend dev server
    methods: ["GET", "POST"]
  }
});

// Socket.IO logic
io.on('connection', (socket) => {
  console.log(`🟢 User connected: ${socket.id}`);

  socket.on('joinRoom', (room) => {
    socket.join(room);
    console.log(`User ${socket.id} joined room ${room}`);
  });

  socket.on('sendMessage', ({ room, message }) => {
    console.log(`Message in ${room}: ${message}`);
    io.to(room).emit('receiveMessage', { message, sender: socket.id });
  });

  socket.on('disconnect', () => {
    console.log(`🔴 User disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
