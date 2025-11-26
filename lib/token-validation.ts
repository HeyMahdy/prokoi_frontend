// Utility functions for token validation and user ID extraction

/**
 * Validate and extract user information from a JWT token
 * @param token - The JWT token to validate
 * @returns Object with validated user information or null if invalid
 */
export function validateAndExtractUserInfo(token: string | null): { 
  isValid: boolean; 
  userId: number | null; 
  email: string | null; 
  isTokenIssue: boolean 
} | null {
  if (!token) {
    return null;
  }

  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      return {
        isValid: false,
        userId: null,
        email: null,
        isTokenIssue: true
      };
    }

    const payload = JSON.parse(atob(parts[1]));
    
    // Extract user ID from possible fields
    // Backend puts user ID in "sub" field, not "user_id" or "id"
    const userId = payload.sub || payload.user_id || payload.id || null;
    // Extract email from possible fields
    // Email should be in "email" field, not "sub"
    const email = payload.email || payload.user_email || null;
    
    // Check if user ID is actually an email (backend issue)
    const userIdIsEmail = typeof userId === 'string' && userId.includes('@');
    // Check if user ID is the default placeholder (1) - this is a critical issue
    const userIdIsDefault = userId === 1 || userId === "1";
    
    // If user ID is an email or default value, this indicates a backend token issue
    if (userIdIsEmail || userIdIsDefault) {
      return {
        isValid: true, // Token itself is valid
        userId: null, // But user ID is problematic
        email: email,
        isTokenIssue: true
      };
    }
    
    // Validate that user ID is a proper number greater than 1
    const validUserId = userId && Number.isInteger(Number(userId)) && Number(userId) > 1 ? Number(userId) : null;
    
    return {
      isValid: true,
      userId: validUserId,
      email: email,
      isTokenIssue: !validUserId
    };
  } catch (e) {
    return {
      isValid: false,
      userId: null,
      email: null,
      isTokenIssue: true
    };
  }
}

/**
 * Get validated user ID from token or localStorage
 * @returns Valid user ID or null
 */
export function getValidatedUserId(): number | null {
  if (typeof window === 'undefined') return null;
  
  const token = localStorage.getItem("access_token");
  if (!token) return null;
  
  const tokenInfo = validateAndExtractUserInfo(token);
  if (tokenInfo && tokenInfo.userId) {
    return tokenInfo.userId;
  }
  
  // Fallback to localStorage user_id if token parsing fails
  // But still validate that it's not the default value
  const storedUserId = localStorage.getItem("user_id");
  if (storedUserId && 
      storedUserId !== "1" && 
      Number.isInteger(Number(storedUserId)) && 
      Number(storedUserId) > 1) {
    return Number(storedUserId);
  }
  
  return null;
}

/**
 * Check if there's a token issue that needs to be handled
 * @returns True if there's a token issue, false otherwise
 */
export function hasTokenIssue(): boolean {
  if (typeof window === 'undefined') return false;
  
  const token = localStorage.getItem("access_token");
  if (!token) return false;
  
  const tokenInfo = validateAndExtractUserInfo(token);
  return tokenInfo ? tokenInfo.isTokenIssue : false;
}