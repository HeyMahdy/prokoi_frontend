#!/usr/bin/env node

/**
 * Script to verify that the token handling fixes are working correctly
 * This script simulates the backend behavior where the email is stored in the 'sub' field
 */

import { validateAndExtractUserInfo } from './lib/token-validation';

// Mock JWT token with email in sub field (simulating backend behavior)
const mockTokenWithEmailInSub = 
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9." +
  "eyJzdWIiOiJ4QGdtYWlsLmNvbSIsImV4cCI6MTc2OTk5OTc1NSwiaWF0IjoxNzY5OTk2MTU1fQ." +
  "signature";

// Mock JWT token with numeric ID in sub field (alternative backend behavior)
const mockTokenWithIdInSub = 
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9." +
  "eyJzdWIiOjEyMywiZXhwIjoxNzY5OTk5NzU1LCJpYXQiOjE3Njk5OTYxNTV9." +
  "signature";

console.log("=== Token Validation Test ===");

// Test token with email in sub field
console.log("\n1. Testing token with email in 'sub' field:");
const result1 = validateAndExtractUserInfo(mockTokenWithEmailInSub);
console.log("Result:", result1);
console.log("Expected: userId should be 'x@gmail.com', isTokenIssue should be false");

// Test token with numeric ID in sub field
console.log("\n2. Testing token with numeric ID in 'sub' field:");
const result2 = validateAndExtractUserInfo(mockTokenWithIdInSub);
console.log("Result:", result2);
console.log("Expected: userId should be 123, isTokenIssue should be false");

// Test invalid token
console.log("\n3. Testing invalid token:");
const result3 = validateAndExtractUserInfo("invalid.token.here");
console.log("Result:", result3);
console.log("Expected: isValid should be false");

console.log("\n=== Test Complete ===");