"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { OrganizationsTable } from "@/components/organizations/organizations-table"
import { CreateOrganizationForm } from "@/components/organizations/create-organization-form"

export default function OrganizationsPage() {
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("access_token")
    if (!token) {
      router.push("/login")
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("access_token")
    localStorage.removeItem("user_data")
    router.push("/login")
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h1 className="text-xl font-bold text-foreground">Organizations</h1>
            <Button variant="ghost" onClick={() => router.push("/dashboard")}>
              Dashboard
            </Button>
          </div>
          <Button onClick={handleLogout} variant="outline">
            Log out
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto space-y-8">
          <CreateOrganizationForm />
          <OrganizationsTable />
        </div>
      </main>
    </div>
  )
}
