
import { validateAndExtractUserInfo } from "./lib/token-validation";

// Mock token with email in 'sub' field
// Header: {"alg":"HS256","typ":"JWT"} -> eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9
// Payload: {"sub":"test@example.com","exp":1735689600} -> eyJzdWIiOiJ0ZXN0QGV4YW1wbGUuY29tIiwiZXhwIjoxNzM1Njg5NjAwfQ
// Signature: (ignored by our client-side parser) -> signature
const mockToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0QGV4YW1wbGUuY29tIiwiZXhwIjoxNzM1Njg5NjAwfQ.signature";

console.log("Testing token validation with email user ID...");
const result = validateAndExtractUserInfo(mockToken);

console.log("Result:", JSON.stringify(result, null, 2));

if (result && result.isValid && result.userId === "test@example.com" && !result.isTokenIssue) {
    console.log("SUCCESS: Token with email user ID is valid.");
} else {
    console.error("FAILURE: Token validation failed or flagged as issue.");
    process.exit(1);
}
