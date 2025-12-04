# WebSocket Implementation

This document describes the WebSocket implementation for real-time notifications in the application.

## Overview

The WebSocket implementation handles the conversion of email addresses to numeric user IDs before establishing connections. This is necessary because the backend API requires numeric IDs for WebSocket connections, but the frontend may only have access to email addresses.

## Flow

1. User authenticates and we obtain their email address
2. Immediately call `http://localhost:8001/users/get-user-id-by-email` with the email in the request body
3. Receive a numeric user ID in the response format: `{ "user_id": 1 }`
4. Use this numeric ID to construct the WebSocket URL: `ws://localhost:8001/api/notifications/WebSocket/{user_id}/WS_CONNECTION`
5. Establish the WebSocket connection

This flow is automatically triggered immediately after successful login or signup.

## Implementation Files

- [`lib/websocket-manager.ts`](file:///home/mahdy/Downloads/auth-app/lib/websocket-manager.ts) - Main WebSocket manager class
- [`lib/websocket-example.ts`](file:///home/mahdy/Downloads/auth-app/lib/websocket-example.ts) - Example usage
- [`test-websocket.ts`](file:///home/mahdy/Downloads/auth-app/test-websocket.ts) - Test file

## Usage

The WebSocket connection is automatically established after login/signup. However, you can also manually trigger it:

```typescript
import { websocketManager } from "./lib/websocket-manager";

// Connect using user's email
await websocketManager.connectWithEmail("user@example.com");

// Check connection status
if (websocketManager.isConnected()) {
  console.log("Connected to WebSocket");
}

// Disconnect when needed
websocketManager.disconnect();
```

## Features

- Automatic reconnection with exponential backoff
- Error handling and logging
- Connection state management
- Email to numeric ID conversion

## API Endpoints

- User ID Lookup: `POST http://localhost:8001/users/get-user-id-by-email`
- WebSocket Connection: `ws://localhost:8001/api/notifications/WebSocket/{user_id}/WS_CONNECTION`