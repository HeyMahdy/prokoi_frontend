"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { clearTokenCache } from "@/lib/api"
import { mutate } from "swr"
import { logAuthStorage } from "@/lib/token-debug"
import { authStorage } from "@/lib/auth-storage"
import { websocketManager } from "@/lib/websocket-manager"

export function SignupForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  })

  // Helper function to extract and validate user ID from login response
  const extractValidUserId = (data: any, token: string): string | number => {
    // Don't use any default value - properly validate and extract user ID
    let userId: string | number | null = null;

    // First try to get user ID from response data
    if (data.user_id && data.user_id !== 1) {
      userId = data.user_id;
    } else if (data.id && data.id !== 1) {
      userId = data.id;
    }

    // If not in response data, try to extract from token
    if (userId === null) {
      try {
        const parts = token.split(".");
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1]));
          // Backend stores user ID in "sub" field, not "user_id" or "id"
          const userIdFromToken = payload.sub || payload.user_id || payload.id || null;
          // Only use if it's a valid ID (string or number) and not the default value 1
          if (userIdFromToken && userIdFromToken !== 1 && userIdFromToken !== "1") {
            userId = userIdFromToken;
          }
        }
      } catch (e) {
        // If we can't parse token, userId remains null
      }
    }

    // If we still don't have a valid user ID, throw an error
    if (userId === null) {
      throw new Error("Could not extract valid user ID from response or token");
    }

    return userId;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("http://127.0.0.1:8001/users/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password_hash: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Signup failed");
      }

      // After successful signup, automatically log the user in
      const loginResponse = await fetch("http://127.0.0.1:8001/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const loginData = await loginResponse.json();

      if (!loginResponse.ok) {
        throw new Error(loginData.detail || "Failed to log in after signup");
      }

      // Log the start of login process
      if (authStorage.isDebugEnabled()) {
        console.log("[TOKEN DEBUG] Starting auto-login process for:", formData.email);
        logAuthStorage();
      }

      // Clear any existing authentication data first
      authStorage.clearAll();

      // Clear ALL SWR caches to ensure no cached data with old tokens
      if (authStorage.isDebugEnabled()) {
        console.log("[TOKEN DEBUG] Clearing all SWR caches");
      }
      mutate(() => true, undefined, { revalidate: false });

      // Clear the token cache
      clearTokenCache();

      // Store access token in storage
      authStorage.setAuthToken(loginData.access_token);

      // Extract and validate user ID from response - throw error if invalid
      let extractedUserId: string | number;
      try {
        extractedUserId = extractValidUserId(loginData, loginData.access_token);
      } catch (extractionError) {
        // If we can't extract a valid user ID, this indicates a token issue
        throw new Error("Authentication token issue: " + (extractionError instanceof Error ? extractionError.message : "Could not extract valid user ID"));
      }

      authStorage.setUserId(extractedUserId);

      // Store user data
      authStorage.setUserData({
        id: extractedUserId,
        name: loginData.name || formData.name,
        email: formData.email,
      });

      // Log after storing new token
      if (authStorage.isDebugEnabled()) {
        console.log("[TOKEN DEBUG] New token stored in storage");
        logAuthStorage();
      }

      // Dispatch a custom event to notify other parts of the app about the login
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('userLogin', { detail: loginData }));
        if (authStorage.isDebugEnabled()) {
          console.log("[TOKEN DEBUG] Dispatched userLogin event");
        }
      }

      // Immediately call POST /users/get-user-id-by-email and establish WebSocket connection
      try {
        console.log("[WebSocket] Initiating WebSocket connection after signup/login");
        await websocketManager.connectWithEmail(formData.email);
      } catch (websocketError) {
        console.error("[WebSocket] Failed to establish WebSocket connection:", websocketError);
        // Don't block signup/login even if WebSocket connection fails
      }

      // Redirect to dashboard
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred during signup");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4 pt-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="John Doe"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="john@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              disabled={isLoading}
            />
          </div>
        </CardContent>

        <CardFooter>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Creating account..." : "Sign up"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}