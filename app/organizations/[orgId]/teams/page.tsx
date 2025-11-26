"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { CreateTeamForm } from "@/components/teams/create-team-form"
import { TeamsTable } from "@/components/teams/teams-table"
import { AddMemberForm } from "@/components/teams/add-member-form"
import { MembersTable } from "@/components/teams/members-table"
import { AssignTeamToWorkspaceForm } from "@/components/teams/assign-team-to-workspace-form"
import { AssignTeamToProjectForm } from "@/components/teams/assign-team-to-project-form"
import { authStorage } from "@/lib/auth-storage"

export default function OrganizationTeamsPage() {
  const router = useRouter()
  const params = useParams()
  const orgId = Number(params.orgId)
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null)

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
            <h1 className="text-xl font-bold text-foreground">Teams Management</h1>
            <Button variant="ghost" onClick={() => router.push("/dashboard")}>
              Dashboard
            </Button>
            <Button variant="ghost" onClick={() => router.push("/organizations")}>
              Organizations
            </Button>
            <Button variant="ghost" onClick={() => router.push(`/organizations/${orgId}/roles`)}>
              Roles & Permissions
            </Button>
          </div>
          <Button onClick={handleLogout} variant="outline">
            Log out
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto space-y-8">
          <CreateTeamForm onOrgSelect={() => { }} />
          <TeamsTable orgId={orgId} onTeamSelect={setSelectedTeamId} />
          {selectedTeamId && <AddMemberForm teamId={selectedTeamId} orgId={orgId} />}
          {selectedTeamId && <MembersTable teamId={selectedTeamId} />}
          {selectedTeamId && <AssignTeamToWorkspaceForm orgId={orgId} teamId={selectedTeamId} />}
          {selectedTeamId && (
            <div className="space-y-4">
              <AssignTeamToProjectForm orgId={orgId} teamId={selectedTeamId} />
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
