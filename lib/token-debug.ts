// Utility functions for debugging token issues

/**
 * Enable or disable token debugging
 * @param enabled - Whether to enable token debugging
 */
export function setTokenDebugging(enabled: boolean) {
  if (typeof window !== 'undefined') {
    if (enabled) {
      localStorage.setItem("debug_tokens", "true")
      console.log("[TOKEN DEBUG] Token debugging enabled")
    } else {
      localStorage.removeItem("debug_tokens")
      console.log("[TOKEN DEBUG] Token debugging disabled")
    }
  }
}

/**
 * Check if token debugging is enabled
 * @returns boolean indicating if token debugging is enabled
 */
export function isTokenDebuggingEnabled(): boolean {
  if (typeof window !== 'undefined') {
    return localStorage.getItem("debug_tokens") === "true"
  }
  return false
}

/**
 * Get current token information for debugging
 * @returns Object with token information
 */
export function getCurrentTokenInfo() {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem("access_token")
    if (token) {
      try {
        const parts = token.split(".")
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1]))
          // Handle different possible field names for user ID and email
          // Backend stores user ID in "sub" field, not email
          const userId = payload.sub || payload.user_id || payload.id || null
          // Look for email in multiple possible fields
          const email = payload.email || payload.user_email || null
          
          // Check if user ID is actually an email (indicating a backend issue)
          const userIdIsEmail = typeof userId === 'string' && userId.includes('@')
          
          return {
            exists: true,
            userId: userId,
            userIdIsEmail: userIdIsEmail,
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
 * Log all authentication-related localStorage items
 */
export function logAuthStorage() {
  if (typeof window !== 'undefined' && localStorage.getItem("debug_tokens") === "true") {
    console.log("[TOKEN DEBUG] Current auth storage:")
    console.log("  access_token:", localStorage.getItem("access_token") ? "exists" : "null")
    console.log("  user_id:", localStorage.getItem("user_id") || "null")
    console.log("  user_data:", localStorage.getItem("user_data") || "null")
    console.log("  selected_org:", localStorage.getItem("selected_org") || "null")
  }
}