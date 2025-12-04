// WebSocket Manager for handling notification connections
import { authStorage } from "./auth-storage";

// API endpoint for converting email to user ID
const USER_ID_LOOKUP_ENDPOINT = "http://localhost:8001/users/get-user-id-by-email";
const WEBSOCKET_BASE_URL = "ws://localhost:8001/api/notifications/WebSocket";

export class WebSocketManager {
  private websocket: WebSocket | null = null;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 1000; // Initial delay in ms
  private userEmail: string | null = null;
  private userId: number | null = null;
  private listeners: ((message: any) => void)[] = [];

  /**
   * Connect to WebSocket using user email
   * @param userEmail - User's email address
   */
  public async connectWithEmail(userEmail: string): Promise<void> {
    this.userEmail = userEmail;

    try {
      // Convert email to numeric user ID
      const userId = await this.getUserIdByEmail(userEmail);
      this.userId = userId;

      // Construct WebSocket URL with numeric user ID
      const websocketUrl = `${WEBSOCKET_BASE_URL}/${userId}/WS_CONNECTION`;

      console.log(`[WebSocket] Connecting to: ${websocketUrl}`);

      // Create WebSocket connection
      this.websocket = new WebSocket(websocketUrl);

      // Set up event handlers
      this.setupEventHandlers();

      // Reset reconnect attempts on successful connection initiation
      this.reconnectAttempts = 0;
    } catch (error) {
      console.error("[WebSocket] Failed to establish connection:", error);
      this.handleReconnect();
    }
  }

  /**
   * Convert email to numeric user ID by calling the API endpoint
   * @param email - User's email address
   * @returns Promise resolving to numeric user ID
   */
  private async getUserIdByEmail(email: string): Promise<number> {
    try {
      console.log(`[WebSocket] Converting email to user ID: ${email}`);

      const response = await fetch(USER_ID_LOOKUP_ENDPOINT, {
        method: "POST", // Using POST as per requirement (email in body)
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }), // Send email in request body
      });

      if (!response.ok) {
        throw new Error(`Failed to get user ID: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.user_id) {
        throw new Error("Invalid response format: missing user_id");
      }

      console.log(`[WebSocket] Email ${email} converted to user ID: ${data.user_id}`);
      return data.user_id;
    } catch (error) {
      console.error("[WebSocket] Error getting user ID by email:", error);
      throw error;
    }
  }

  /**
   * Set up WebSocket event handlers
   */
  private setupEventHandlers(): void {
    if (!this.websocket) return;

    this.websocket.onopen = () => {
      console.log("[WebSocket] Connection established");
    };

    this.websocket.onmessage = (event) => {
      console.log("[WebSocket] Message received:", event.data);
      // Handle incoming messages here
      this.handleMessage(event.data);
    };

    this.websocket.onclose = (event) => {
      console.log(`[WebSocket] Connection closed: ${event.reason}`);
      this.handleReconnect();
    };

    this.websocket.onerror = (error) => {
      console.error("[WebSocket] Connection error:", error);
    };
  }

  /**
   * Handle incoming WebSocket messages
   * @param data - Message data
   */
  private handleMessage(data: any): void {
    try {
      const message = JSON.parse(data);
      // Process notification message
      console.log("[WebSocket] Processing message:", message);

      // Notify all listeners
      this.listeners.forEach(listener => listener(message));
    } catch (error) {
      console.error("[WebSocket] Error parsing message:", error);
    }
  }

  /**
   * Subscribe to WebSocket messages
   * @param callback - Function to be called when a message is received
   * @returns Unsubscribe function
   */
  public subscribe(callback: (message: any) => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  /**
   * Acknowledge a notification
   * @param notificationId - ID of the notification to acknowledge
   */
  public async acknowledgeNotification(notificationId: string | number): Promise<void> {
    if (this.userId === null) {
      console.warn("[WebSocket] Cannot acknowledge notification: User ID not available");
      // Try to recover user ID from storage if possible, or fail
      // For now, we'll just log an error, but in a real app we might want to fetch it again
      return;
    }

    try {
      console.log(`[WebSocket] Acknowledging notification: ${notificationId} for user ${this.userId}`);

      const body = {
        user_id: this.userId,
        message_ids: [String(notificationId)]
      };

      const response = await fetch("http://localhost:8001/api/notifications/ACKNOWLEDGE", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`Failed to acknowledge notification: ${response.status}`);
      }

      console.log(`[WebSocket] Notification ${notificationId} acknowledged successfully`);
    } catch (error) {
      console.error("[WebSocket] Error acknowledging notification:", error);
      throw error;
    }
  }

  /**
   * Handle reconnection logic
   */
  private handleReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts && this.userEmail) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1); // Exponential backoff

      console.log(`[WebSocket] Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);

      setTimeout(() => {
        this.connectWithEmail(this.userEmail!);
      }, delay);
    } else {
      console.error("[WebSocket] Max reconnection attempts reached or no user email available");
    }
  }

  /**
   * Close WebSocket connection
   */
  public disconnect(): void {
    if (this.websocket) {
      this.websocket.close();
      this.websocket = null;
    }
    this.reconnectAttempts = 0;
    this.listeners = [];
    this.userId = null;
  }

  /**
   * Check if WebSocket is currently connected
   * @returns Boolean indicating connection status
   */
  public isConnected(): boolean {
    return this.websocket?.readyState === WebSocket.OPEN;
  }
}

// Export singleton instance
export const websocketManager = new WebSocketManager();