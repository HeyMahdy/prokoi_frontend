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

interface WorkspaceTeam { id: number; name: string }
interface TeamProject { team_id: number; project_id: number }

export function AssignExistingTeamToProjectForm({ workspaceId, projectId }: { workspaceId: number; projectId: number }) {
  console.log("🔍 AssignExistingTeamToProjectForm rendered with:", { workspaceId, projectId })
  
  const apiUrl = Number.isFinite(workspaceId) ? `/api/workspaces/${workspaceId}/teams` : null
  console.log("🌐 API URL for workspace teams:", apiUrl)
  
  const { data: workspaceTeams, error: workspaceTeamsError, isLoading: workspaceTeamsLoading } = useSWR<any>(
    apiUrl,
    fetchWithAuth,
  )
  
  console.log("📊 Workspace teams SWR state:", { workspaceTeams, workspaceTeamsError, workspaceTeamsLoading })
  
  const { data: assigned } = useSWR<TeamProject[]>(
    Number.isFinite(projectId) ? `/api/projects/${projectId}/teams` : null,
    fetchWithAuth,
  )
  const { toast } = useToast()
  const [teamId, setTeamId] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const normalizedWorkspaceTeams: WorkspaceTeam[] = useMemo(() => {
    if (!workspaceTeams) {
      console.log("No workspace teams data")
      return []
    }
    
    console.log("Raw workspace teams data:", workspaceTeams)
    
    // Handle direct array response (most common case)
    if (Array.isArray(workspaceTeams)) {
      console.log("Workspace teams is direct array:", workspaceTeams)
      return workspaceTeams.map((t: any) => ({ id: t.team_id, name: t.team_name })).filter((t) => t.id && t.name)
    }
    
    // Handle wrapped responses
    if (workspaceTeams.items && Array.isArray(workspaceTeams.items)) {
      console.log("Workspace teams has items array:", workspaceTeams.items)
      return workspaceTeams.items.map((t: any) => ({ id: t.team_id, name: t.team_name })).filter((t: any) => t.id && t.name)
    }
    
    if (workspaceTeams.data && Array.isArray(workspaceTeams.data)) {
      console.log("Workspace teams has data array:", workspaceTeams.data)
      return workspaceTeams.data.map((t: any) => ({ id: t.team_id, name: t.team_name })).filter((t: any) => t.id && t.name)
    }
    
    console.log("Workspace teams data doesn't match expected format:", workspaceTeams)
    return []
  }, [workspaceTeams])

  const availableTeams = useMemo(() => {
    const assignedIds = new Set((assigned || []).map((a: any) => a.team_id ?? a.id))
    const result = normalizedWorkspaceTeams.filter((t) => !assignedIds.has(t.id))
    console.log("Available teams:", result)
    return result
  }, [normalizedWorkspaceTeams, assigned])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!teamId) return
    setIsSubmitting(true)
    try {
      const params = new URLSearchParams({ team_id: String(Number(teamId)) })
      await fetchWithAuth(`/api/projects/${projectId}/teams?${params.toString()}`, {
        method: "POST",
      })
      toast({ title: "Assigned", description: "Team assigned to project" })
      mutate(`/api/projects/${projectId}/teams`)
    } catch (err: any) {
      toast({ title: "Error", description: err?.message || "Failed to assign team", variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">Add Team to Project</CardTitle>
        <CardDescription>Select a workspace team to add</CardDescription>
        <div className="text-xs text-muted-foreground">
          DEBUG: workspaceId={workspaceId}, teams={workspaceTeams ? 'loaded' : 'loading'}, count={normalizedWorkspaceTeams.length}, available={availableTeams.length}
        </div>
      </CardHeader>
      <CardContent>
        {workspaceTeamsError && (
          <div className="text-sm text-red-500 mb-3">{workspaceTeamsError.message || "Failed to load workspace teams"}</div>
        )}
        <form onSubmit={onSubmit} className="flex gap-4 items-end">
          <div className="flex-1 space-y-2">
            <Label>Workspace Team</Label>
            <Select value={teamId} onValueChange={setTeamId} disabled={isSubmitting}>
              <SelectTrigger>
                <SelectValue placeholder="Select workspace team" />
              </SelectTrigger>
              <SelectContent>
                {workspaceTeamsLoading && <div className="px-2 py-1 text-sm text-muted-foreground">Loading teams...</div>}
                {!workspaceTeamsLoading && availableTeams.length === 0 && (
                  <SelectItem value="no-teams" disabled>
                    No available teams
                  </SelectItem>
                )}
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


