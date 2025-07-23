// backend/db/saveMessage.js
const docClient = require("../awsClient");
const { PutCommand } = require("@aws-sdk/lib-dynamodb");

async function saveMessage({ chatRoomId, senderId, message }) {
  const timestamp = new Date().toISOString();

  const params = {
    TableName: "messages",
    Item: {
      chatRoomId,
      timestamp,
      senderId,
      message,
    },
  };

  try {
    await docClient.send(new PutCommand(params));
    console.log("✅ Message saved to DynamoDB");
  } catch (err) {
    console.error("❌ Failed to save message:", err);
  }
}

module.exports = saveMessage;
