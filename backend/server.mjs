// server.js
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import ddbDocClient from './awsClient.mjs';
import { PutCommand, QueryCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
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
  try {
    const data = await ddbDocClient.send(new ScanCommand({
      TableName: 'messages',
      FilterExpression: 'chatRoomID = :roomId',
      ExpressionAttributeValues: {
        ':roomId': 'global',
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

  socket.on('chat message', async (msgData) => {
    io.emit('chat message', msgData); // Broadcast to all clients

    // Save to DynamoDB
    const params = {
      TableName: 'messages',
      Item: {
        chatRoomID: 'global',
        messageId: uuidv4(),
        username: msgData.username,
        message: msgData.message,
        timestamp: new Date().toISOString(),
      },
    };

    try {
      await ddbDocClient.send(new PutCommand(params));
      console.log("✅ Message saved to DynamoDB");
    } catch (err) {
      console.error("❌ Failed to save message:", err);
    }
  });
});

server.listen(5000, () => {
  console.log('Server listening on *:5000');
});
