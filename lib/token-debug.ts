// Utility functions for debugging token issues

import { authStorage } from "./auth-storage"

/**
 * Enable or disable token debugging
 * @param enabled - Whether to enable token debugging
 */
export function setTokenDebugging(enabled: boolean) {
  authStorage.setDebugEnabled(enabled)
  if (enabled) {
    console.log("[TOKEN DEBUG] Token debugging enabled")
  } else {
    console.log("[TOKEN DEBUG] Token debugging disabled")
  }
}

/**
 * Check if token debugging is enabled
 * @returns boolean indicating if token debugging is enabled
 */
export function isTokenDebuggingEnabled(): boolean {
  return authStorage.isDebugEnabled()
}

/**
 * Get current token information for debugging
 * @returns Object with token information
 */
export function getCurrentTokenInfo() {
  if (typeof window !== 'undefined') {
    const token = authStorage.getAuthToken()
    if (token) {
      try {
        const parts = token.split(".")
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1]))
          // Handle different possible field names for user ID and email
          // Backend stores user ID in "sub" field, which can be an email
          const userId = payload.sub || payload.user_id || payload.id || null
          // Look for email in multiple possible fields
          const email = payload.email || payload.user_email || null

          // Check if user ID is actually an email (this is now valid)
          const userIdIsEmail = typeof userId === 'string' && userId.includes('@')

          return {
            exists: true,
            userId: userId,
            userIdIsEmail: userIdIsEmail, // Kept for info, but not an error
            email: email,
            exp: payload.exp ? new Date(payload.exp * 1000).toISOString() : null,
            iat: payload.iat ? new Date(payload.iat * 1000).toISOString() : null,
            tokenPreview: `${token.substring(0, 20)}...`,
            rawPayload: payload // Include raw payload for debugging
          }
        }
      } catch (e) {
        return {
          exists: true,
          error: "Failed to parse token",
          tokenPreview: `${token.substring(0, 20)}...`
        }
      }
    }
    return {
      exists: false,
      userId: null,
      email: null
    }
  }
  return null
}

/**
 * Log all authentication-related storage items
 */
export function logAuthStorage() {
  if (authStorage.isDebugEnabled()) {
    console.log("[TOKEN DEBUG] Current auth storage:")
    console.log("  access_token:", authStorage.getAuthToken() ? "exists" : "null")
    console.log("  user_id:", authStorage.getUserId() || "null")
    console.log("  user_data:", authStorage.getUserData() ? "exists" : "null")
    console.log("  selected_org:", authStorage.getSelectedOrg() ? "exists" : "null")
  }
}