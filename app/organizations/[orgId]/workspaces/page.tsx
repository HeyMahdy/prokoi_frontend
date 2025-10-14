"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { mutate } from "swr"
import { Button } from "@/components/ui/button"
import { CreateWorkspaceForm } from "@/components/workspaces/create-workspace-form"
import { WorkspacesTable } from "@/components/workspaces/workspaces-table"

export default function OrganizationWorkspacesPage() {
  const router = useRouter()
  const params = useParams()
  const orgId = Number(params.orgId)
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<number | null>(null)

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

  const handleWorkspaceCreated = () => {
    // Revalidate the workspaces list when a new workspace is created
    mutate(`/api/organizations/${orgId}/workspaces`)
  }

  const handleWorkspaceSelect = (workspaceId: number) => {
    router.push(`/workspaces/${workspaceId}/projects`)
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h1 className="text-xl font-bold text-foreground">Workspaces Management</h1>
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
        <div className="max-w-6xl mx-auto space-y-8">
          <CreateWorkspaceForm orgId={orgId} onWorkspaceCreated={handleWorkspaceCreated} />
          <WorkspacesTable orgId={orgId} onWorkspaceSelect={handleWorkspaceSelect} />
        </div>
      </main>
    </div>
  )
}
