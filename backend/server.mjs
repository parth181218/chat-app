// ✅ server.mjs (or server.js)
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import ddbDocClient from './awsClient.mjs';
import { PutCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';
import cors from 'cors';

const app = express();
app.use(cors());

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  }
});

app.get('/messages', async (req, res) => {
  const roomId = req.query.room || 'general';
  try {
    const data = await ddbDocClient.send(new ScanCommand({
      TableName: 'messages',
      FilterExpression: 'chatRoomID = :roomId',
      ExpressionAttributeValues: {
        ':roomId': roomId,
      }
    }));
    res.json(data.Items || []);
  } catch (err) {
    console.error("❌ Failed to fetch messages:", err);
    res.status(500).json({ error: 'Failed to load messages' });
  }
});

io.on('connection', (socket) => {
  console.log('User connected');

  socket.on('join', ({ username, room }) => {
    socket.username = username;
    socket.room = room;
    socket.join(room);
    console.log(`${username} joined room: ${room}`);
  });

  socket.on('chat message', async (msgData) => {
    const room = socket.room || 'general';
    io.to(room).emit('chat message', msgData);

    const params = {
      TableName: 'messages',
      Item: {
        chatRoomID: room,
        messageId: uuidv4(),
        username: msgData.username,
        message: msgData.text,
        timestamp: new Date().toISOString(),
      },
    };

    try {
      await ddbDocClient.send(new PutCommand(params));
    } catch (err) {
      console.error("❌ Failed to save message:", err);
    }
  });

  socket.on('typing', (username) => {
    socket.to(socket.room).emit('typing', username);
  });
});

server.listen(5000, () => {
  console.log('Server listening on *:5000');
});
