"use client"

import { useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { SendRequestForm } from "@/components/requests/send-request-form"
import { authStorage } from "@/lib/auth-storage"

export default function OrganizationSendRequestPage() {
  const router = useRouter()
  const params = useParams()
  const orgId = Number(params.orgId)

  useEffect(() => {
    const token = authStorage.getAuthToken()
    if (!token) {
      router.push("/login")
    }
  }, [router])

  const handleLogout = () => {
    authStorage.clearAll()
    router.push("/login")
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h1 className="text-xl font-bold text-foreground">Organization Requests</h1>
            <Button variant="ghost" onClick={() => router.push("/dashboard")}>
              Dashboard
            </Button>
            <Button variant="ghost" onClick={() => router.push("/organizations")}>
              Organizations
            </Button>
            <Button variant="ghost" onClick={() => router.push(`/organizations/${orgId}/roles`)}>
              Roles & Permissions
            </Button>
            <Button variant="ghost" onClick={() => router.push(`/organizations/${orgId}/teams`)}>
              Teams Management
            </Button>
          </div>
          <Button onClick={handleLogout} variant="outline">
            Log out
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <SendRequestForm />
        </div>
      </main>
    </div>
  )
}
