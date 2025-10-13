"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { CreateTeamForm } from "@/components/teams/create-team-form"
import { TeamsTable } from "@/components/teams/teams-table"
import { AddMemberForm } from "@/components/teams/add-member-form"
import { MembersTable } from "@/components/teams/members-table"

export default function TeamsPage() {
  const router = useRouter()
  const [selectedOrgId, setSelectedOrgId] = useState<number | null>(null)
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null)

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
            <h1 className="text-xl font-bold text-foreground">Teams Management</h1>
            <Button variant="ghost" onClick={() => router.push("/dashboard")}>
              Dashboard
            </Button>
            <Button variant="ghost" onClick={() => router.push("/organizations")}>
              Organizations
            </Button>
            <Button variant="ghost" onClick={() => router.push("/roles")}>
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
          <CreateTeamForm onOrgSelect={setSelectedOrgId} />
          {selectedOrgId && <TeamsTable orgId={selectedOrgId} onTeamSelect={setSelectedTeamId} />}
          {selectedTeamId && <AddMemberForm teamId={selectedTeamId} orgId={selectedOrgId} />}
          {selectedTeamId && <MembersTable teamId={selectedTeamId} />}
        </div>
      </main>
    </div>
  )
}
