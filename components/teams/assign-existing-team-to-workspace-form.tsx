"use client"

import useSWR from "swr"
import { useMemo, useState } from "react"
import { fetchWithAuth } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Plus } from "lucide-react"
import { mutate } from "swr"

interface OrgTeam { id: number; name: string }
interface TeamWorkspace { team_id: number; workspace_id: number }

export function AssignExistingTeamToWorkspaceForm({ orgId, workspaceId }: { orgId: number; workspaceId: number }) {
  const { data: orgTeams } = useSWR<OrgTeam[]>(`/api/organizations/${orgId}/teams`, fetchWithAuth)
  const { data: assigned } = useSWR<TeamWorkspace[]>(`/api/workspaces/${workspaceId}/teams`, fetchWithAuth)
  const { toast } = useToast()
  const [teamId, setTeamId] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const availableTeams = useMemo(() => {
    const assignedIds = new Set((assigned || []).map((a: any) => a.team_id ?? a.id))
    return (orgTeams || []).filter((t) => !assignedIds.has(t.id))
  }, [orgTeams, assigned])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!teamId) return
    setIsSubmitting(true)
    try {
      const params = new URLSearchParams({ team_id: String(Number(teamId)) })
      await fetchWithAuth(`/api/workspaces/${workspaceId}/teams?${params.toString()}`, {
        method: "POST",
      })
      toast({ title: "Assigned", description: "Team assigned to workspace" })
      mutate(`/api/workspaces/${workspaceId}/teams`)
    } catch (err: any) {
      toast({ title: "Error", description: err?.message || "Failed to assign team", variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">Add Team to Workspace</CardTitle>
        <CardDescription>Pick an organization team to add</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="flex gap-4 items-end">
          <div className="flex-1 space-y-2">
            <Label>Team</Label>
            <Select value={teamId} onValueChange={setTeamId} disabled={isSubmitting}>
              <SelectTrigger>
                <SelectValue placeholder="Select team" />
              </SelectTrigger>
              <SelectContent>
                {availableTeams.map((t) => (
                  <SelectItem key={t.id} value={String(t.id)}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" disabled={isSubmitting || !teamId}>
            {isSubmitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
            Add
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}


