// backend/dynamoClient.js
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({
  region: "us-east-1", // ✅ Change to your region
  credentials: {
    accessKeyId: "AKIASJLFNQYH5RHAPDFP",    // ⚠️ Replace
    secretAccessKey: "eW56KWtYhtfTIh61jIHyuI81zRbodN4ZTN5bhS+T",   // ⚠️ Replace
  },
});

const ddbDocClient = DynamoDBDocumentClient.from(client);
export default ddbDocClient;
