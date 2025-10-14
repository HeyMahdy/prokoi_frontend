"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { mutate } from "swr"
import { Button } from "@/components/ui/button"
import { CreateProjectForm } from "@/components/projects/create-project-form"
import { ProjectsTable } from "@/components/projects/projects-table"

export default function WorkspaceProjectsPage() {
  const router = useRouter()
  const params = useParams()
  const workspaceId = Number(params.workspaceId)

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

  const handleProjectCreated = () => {
    // Revalidate the projects list when a new project is created
    mutate(`/api/workspaces/${workspaceId}/projects`)
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h1 className="text-xl font-bold text-foreground">Projects Management</h1>
            <Button variant="ghost" onClick={() => router.push("/dashboard")}>
              Dashboard
            </Button>
            <Button variant="ghost" onClick={() => router.push("/organizations")}>
              Organizations
            </Button>
          </div>
          <Button onClick={handleLogout} variant="outline">
            Log out
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto space-y-8">
          <CreateProjectForm workspaceId={workspaceId} onProjectCreated={handleProjectCreated} />
          <ProjectsTable workspaceId={workspaceId} />
        </div>
      </main>
    </div>
  )
}
