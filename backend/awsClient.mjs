// backend/dynamoClient.js
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({
  region: "us-east-1", // ✅ Change to your region
  credentials: {
    accessKeyId: "",    // ⚠️ Replace
    secretAccessKey: "",   // ⚠️ Replace
  },
});

const ddbDocClient = DynamoDBDocumentClient.from(client);
export default ddbDocClient;
