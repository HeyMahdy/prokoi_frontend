// Test file for WebSocket implementation
import { websocketManager } from "./lib/websocket-manager";

// Simple test function
async function testWebSocketConnection() {
  console.log("Testing WebSocket connection with email-to-ID conversion...");
  
  // Example email - in a real app, this would come from auth storage
  const userEmail = "test@example.com";
  
  try {
    // This will:
    // 1. Call http://localhost:8001/users/get-user-id-by-email with the email in the body
    // 2. Receive a numeric user ID in response
    // 3. Use that ID to construct the WebSocket URL
    // 4. Connect to ws://localhost:8001/api/notifications/WebSocket/{user_id}/WS_CONNECTION
    await websocketManager.connectWithEmail(userEmail);
  } catch (error) {
    console.error("Failed to connect:", error);
  }
}

// Run the test
testWebSocketConnection();