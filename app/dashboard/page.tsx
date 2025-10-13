"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<{ name: string; email: string } | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("access_token")
    if (!token) {
      router.push("/login")
      return
    }

    const userData = localStorage.getItem("user_data")
    if (userData) {
      setUser(JSON.parse(userData))
    } else {
      setUser({ name: "User", email: "user@example.com" })
    }

    setIsLoading(false)
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("access_token")
    localStorage.removeItem("user_data")
    router.push("/login")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-foreground">Dashboard</h1>
          <Button onClick={handleLogout} variant="outline">
            Log out
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Welcome, {user.name}!</CardTitle>
              <CardDescription>You're successfully logged in to your account</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Name</p>
                <p className="text-foreground">{user.name}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Email</p>
                <p className="text-foreground">{user.email}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Manage your account and organizations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button onClick={() => router.push("/organizations")} className="w-full">
                  Manage Organizations
                </Button>
                <Button onClick={() => router.push("/requests/send")} variant="outline" className="w-full">
                  Organization Requests
                </Button>
                <Button onClick={() => router.push("/roles")} variant="outline" className="w-full">
                  Roles & Permissions
                </Button>
                <Button onClick={() => router.push("/teams")} variant="outline" className="w-full">
                  Teams Management
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
