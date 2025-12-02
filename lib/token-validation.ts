// Utility functions for token validation and user ID extraction

import { authStorage } from "./auth-storage"

/**
 * Validate and extract user information from a JWT token
 * @param token - The JWT token to validate
 * @returns Object with validated user information or null if invalid
 */
export function validateAndExtractUserInfo(token: string | null): {
  isValid: boolean;
  userId: string | number | null;
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
    // Backend puts user email in "sub" field (not numeric ID)
    const userId = payload.sub || payload.user_id || payload.id || null;
    // Extract email from possible fields
    const email = payload.email || payload.user_email || null;

    // Check if user ID is the default placeholder (1) - this is a critical issue
    const userIdIsDefault = userId === 1 || userId === "1";
    // Check if user ID is an email (current backend behavior)
    const userIdIsEmail = typeof userId === 'string' && userId.includes('@');

    // If user ID is default value, this indicates a backend token issue
    if (userIdIsDefault) {
      return {
        isValid: true, // Token itself is valid
        userId: null, // But user ID is problematic
        email: email,
        isTokenIssue: true
      };
    }

    // If userId is an email, use it as email and set userId to null
    if (userIdIsEmail) {
      return {
        isValid: true,
        userId: userId, // Use the email as the userId since that's what the backend provides
        email: email || userId, // Use userId as email if email field not present
        isTokenIssue: false // This is not an issue since it's the intended behavior
      };
    }

    // Validate that user ID is present and looks like a proper ID
    const validUserId = userId ? userId : null;

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
 * Get validated user ID from token or storage
 * @returns Valid user ID or null
 */
export function getValidatedUserId(): string | number | null {
  if (typeof window === 'undefined') return null;

  const token = authStorage.getAuthToken();
  if (!token) return null;

  const tokenInfo = validateAndExtractUserInfo(token);
  if (tokenInfo && tokenInfo.userId) {
    return tokenInfo.userId;
  }

  // Fallback to storage user_id if token parsing fails
  // But still validate that it's not the default value
  const storedUserId = authStorage.getUserId();
  if (storedUserId && storedUserId !== "1") {
    // Check if it looks like a number, if so return as number, else return as string
    if (Number.isInteger(Number(storedUserId)) && Number(storedUserId) > 0) {
      return Number(storedUserId);
    }
    return storedUserId;
  }

  return null;
}

/**
 * Check if there's a token issue that needs to be handled
 * @returns True if there's a token issue, false otherwise
 */
export function hasTokenIssue(): boolean {
  if (typeof window === 'undefined') return false;

  const token = authStorage.getAuthToken();
  if (!token) return false;

  const tokenInfo = validateAndExtractUserInfo(token);
  return tokenInfo ? tokenInfo.isTokenIssue : false;
}