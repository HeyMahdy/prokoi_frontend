// Example usage of WebSocketManager
import { websocketManager } from "./websocket-manager";

/**
 * Example function showing how to use the WebSocket manager
 * @param userEmail - User's email address
 */
export async function connectToNotifications(userEmail: string): Promise<void> {
  try {
    console.log(`[Example] Initializing WebSocket connection for ${userEmail}`);
    await websocketManager.connectWithEmail(userEmail);
  } catch (error) {
    console.error("[Example] Failed to initialize WebSocket connection:", error);
  }
}

// Example usage:
// connectToNotifications("user@example.com");