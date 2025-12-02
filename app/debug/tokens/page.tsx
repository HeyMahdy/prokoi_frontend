"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { setTokenDebugging, isTokenDebuggingEnabled, getCurrentTokenInfo, logAuthStorage } from "@/lib/token-debug"
import { useRouter } from "next/navigation"
import { authStorage as authStorageLib } from "@/lib/auth-storage"

export default function TokenDebugPage() {
  const router = useRouter()
  const [isDebugging, setIsDebugging] = useState(false)
  const [tokenInfo, setTokenInfo] = useState<any>(null)
  const [authStorage, setAuthStorage] = useState<any>(null)

  useEffect(() => {
    setIsDebugging(isTokenDebuggingEnabled())

    const interval = setInterval(() => {
      setTokenInfo(getCurrentTokenInfo())
      if (typeof window !== 'undefined') {
        const userData = authStorageLib.getUserData();
        setAuthStorage({
          access_token: authStorageLib.getAuthToken() ? "exists" : "null",
          user_id: authStorageLib.getUserId() || "null",
          user_data: userData ? JSON.stringify(userData) : "null",
          selected_org: authStorageLib.getSelectedOrg() || "null",
        })
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const toggleDebugging = () => {
    const newDebuggingState = !isDebugging
    setTokenDebugging(newDebuggingState)
    setIsDebugging(newDebuggingState)
  }

  const refreshTokenInfo = () => {
    setTokenInfo(getCurrentTokenInfo())
    if (typeof window !== 'undefined') {
      const userData = authStorageLib.getUserData();
      setAuthStorage({
        access_token: authStorageLib.getAuthToken() ? "exists" : "null",
        user_id: authStorageLib.getUserId() || "null",
        user_data: userData ? JSON.stringify(userData) : "null",
        selected_org: authStorageLib.getSelectedOrg() || "null",
      })
    }
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Token Debugging</h1>
            <p className="text-muted-foreground">Debug authentication token issues</p>
          </div>
          <Button onClick={() => router.push("/dashboard")}>Back to Dashboard</Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Debugging Controls</CardTitle>
            <CardDescription>Enable or disable token debugging</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Token Debugging</h3>
                <p className="text-sm text-muted-foreground">
                  {isDebugging ? "Enabled - Logging token information" : "Disabled - No token logging"}
                </p>
              </div>
              <Button onClick={toggleDebugging} variant={isDebugging ? "default" : "outline"}>
                {isDebugging ? "Disable Debugging" : "Enable Debugging"}
              </Button>
            </div>

            <div className="flex gap-2">
              <Button onClick={refreshTokenInfo}>Refresh Token Info</Button>
              <Button onClick={logAuthStorage} variant="outline">Log Auth Storage</Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Current Token Information</CardTitle>
              <CardDescription>Details about the currently stored token</CardDescription>
            </CardHeader>
            <CardContent>
              {tokenInfo ? (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Token Exists:</span>
                    <span className={tokenInfo.exists ? "text-green-600" : "text-red-600"}>
                      {tokenInfo.exists ? "Yes" : "No"}
                    </span>
                  </div>

                  {tokenInfo.exists && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">User ID:</span>
                        <span>{tokenInfo.userId || "Not found"}</span>
                      </div>
                      {tokenInfo.userIdIsEmail && (
                        <div className="flex justify-between bg-yellow-100 p-2 rounded">
                          <span className="text-muted-foreground font-bold">WARNING:</span>
                          <span className="text-red-600">User ID is an email - Backend Issue!</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Email:</span>
                        <span>{tokenInfo.email || "Not found"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Issued At:</span>
                        <span>{tokenInfo.iat || "Not found"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Expires At:</span>
                        <span>{tokenInfo.exp || "Not found"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Token Preview:</span>
                        <span className="font-mono text-xs">{tokenInfo.tokenPreview}</span>
                      </div>
                    </>
                  )}

                  {tokenInfo.error && (
                    <div className="text-red-600">{tokenInfo.error}</div>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground">No token information available</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Auth Storage</CardTitle>
              <CardDescription>Current authentication data in localStorage</CardDescription>
            </CardHeader>
            <CardContent>
              {authStorage ? (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">access_token:</span>
                    <span>{authStorage.access_token}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">user_id:</span>
                    <span>{authStorage.user_id}</span>
                  </div>
                  {authStorage.user_id === "1" && (
                    <div className="flex justify-between bg-yellow-100 p-2 rounded">
                      <span className="text-muted-foreground font-bold">WARNING:</span>
                      <span className="text-red-600">User ID is default value (1) - Token Issue!</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">user_data:</span>
                    <span className="truncate max-w-[200px]">
                      {authStorage.user_data 
                        ? typeof authStorage.user_data === 'string' 
                          ? authStorage.user_data 
                          : JSON.stringify(authStorage.user_data, null, 2)
                        : 'null'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">selected_org:</span>
                    <span>
                      {authStorage.selected_org 
                        ? typeof authStorage.selected_org === 'string' 
                          ? authStorage.selected_org 
                          : JSON.stringify(authStorage.selected_org, null, 2)
                        : 'null'}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">No auth storage information available</p>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Instructions</CardTitle>
            <CardDescription>How to use this debugging tool</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p>1. Enable debugging to start logging token information to the console</p>
              <p>2. Log in as different users and observe the console output</p>
              <p>3. Check if the token information changes correctly when switching users</p>
              <p>4. Look for any errors or inconsistencies in the token data</p>
              <p>5. Use "Log Auth Storage" to dump all authentication data to the console</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}