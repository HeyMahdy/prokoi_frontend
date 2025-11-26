"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import useSWR from "swr"
import { fetchWithAuth } from "@/lib/api"
import { getValidatedUserId } from "@/lib/token-validation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, User } from "lucide-react"
import { AddSkillForm } from "@/components/profile/add-skill-form"
import { SkillsTable } from "@/components/profile/skills-table"
import { isTokenDebuggingEnabled } from "@/lib/token-debug"
import { authStorage } from "@/lib/auth-storage"

interface User {
  id: number
  name: string
  email: string
}

export default function ProfilePage() {
  const router = useRouter()
  const [userId, setUserId] = useState<number | null>(null)
  const [initTried, setInitTried] = useState(false)

  useEffect(() => {
    const token = authStorage.getAuthToken()
    if (!token) {
      router.push("/login")
      return
    }

    // Use the new validated user ID extraction
    const validatedUserId = getValidatedUserId();
    if (validatedUserId) {
      setUserId(validatedUserId);
      setInitTried(true);
      return;
    }

    // Log error in debug mode
    if (isTokenDebuggingEnabled()) {
      console.log("[TOKEN DEBUG] Unable to extract valid user ID from token or storage");
    }

    setInitTried(true);
  }, [router])

  const { data, error, isLoading, mutate } = useSWR<any>(`/api/users/skills`, fetchWithAuth)

  if (userId == null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground">
          {initTried ? (
            <div className="text-center space-y-2">
              <div>Unable to determine user ID.</div>
              <Button variant="outline" onClick={() => router.push("/dashboard")}>Back to Dashboard</Button>
            </div>
          ) : (
            "Loading..."
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 backdrop-blur-sm bg-background/95 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-sm">
              <User className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Profile</h1>
              <p className="text-sm text-muted-foreground">Manage your skills</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => router.push("/dashboard")}>Dashboard</Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12">
        <div className="max-w-5xl mx-auto space-y-8">
          <AddSkillForm onAdded={() => mutate()} />

          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl">Skills</CardTitle>
                  <CardDescription>Your current skills and proficiency</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading && (
                <div className="space-y-2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              )}

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error.message || "Failed to load skills"}</AlertDescription>
                </Alert>
              )}

              {data && <SkillsTable items={data} onChanged={() => mutate()} />}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}