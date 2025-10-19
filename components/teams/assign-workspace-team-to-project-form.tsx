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

interface WorkspaceTeam { id: number; name: string }
interface Project { id: number; name: string }
interface TeamProject { team_id: number; project_id: number }

export function AssignWorkspaceTeamToProjectForm({ workspaceId }: { workspaceId: number }) {
  console.log("🔍 AssignWorkspaceTeamToProjectForm rendered with workspaceId:", workspaceId)
  
  const { toast } = useToast()
  const [teamId, setTeamId] = useState<string>("")
  const [projectId, setProjectId] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const apiUrl = Number.isFinite(workspaceId) ? `/api/workspaces/${workspaceId}/teams` : null
  console.log("🌐 API URL for teams:", apiUrl)
  
  const { data: teams, error: teamsError, isLoading: teamsLoading } = useSWR<any>(
    apiUrl,
    fetchWithAuth,
  )
  
  console.log("📊 SWR teams state:", { teams, teamsError, teamsLoading })
  const { data: projects, error: projectsError, isLoading: projectsLoading } = useSWR<any>(
    Number.isFinite(workspaceId) ? `/api/workspaces/${workspaceId}/projects` : null,
    fetchWithAuth,
  )
  const { data: assignedForSelected } = useSWR<TeamProject[]>(
    teamId ? `/api/teams/${teamId}/projects` : null,
    fetchWithAuth,
  )

  const normalizedTeams: WorkspaceTeam[] = useMemo(() => {
    if (!teams) {
      console.log("Teams data: null/undefined")
      return []
    }
    
    // Handle direct array response (most common case)
    if (Array.isArray(teams)) {
      const result = teams.map((t: any) => ({ id: t.id, name: t.name })).filter((t) => t.id && t.name)
      console.log("Teams data:", teams, "Normalized:", result)
      return result
    }
    
    // Handle wrapped responses
    if (teams.items && Array.isArray(teams.items)) {
      const result = teams.items.map((t: any) => ({ id: t.id, name: t.name })).filter((t: any) => t.id && t.name)
      console.log("Teams data (items):", teams, "Normalized:", result)
      return result
    }
    
    if (teams.data && Array.isArray(teams.data)) {
      const result = teams.data.map((t: any) => ({ id: t.id, name: t.name })).filter((t: any) => t.id && t.name)
      console.log("Teams data (data):", teams, "Normalized:", result)
      return result
    }
    
    console.log("Teams data (unexpected format):", teams)
    return []
  }, [teams])

  const normalizedProjects: Project[] = useMemo(() => {
    if (!projects) return []
    
    // Handle direct array response (most common case)
    if (Array.isArray(projects)) {
      return projects.map((p: any) => ({ id: p.id, name: p.name })).filter((p) => p.id && p.name)
    }
    
    // Handle wrapped responses
    if (projects.items && Array.isArray(projects.items)) {
      return projects.items.map((p: any) => ({ id: p.id, name: p.name })).filter((p: any) => p.id && p.name)
    }
    
    if (projects.data && Array.isArray(projects.data)) {
      return projects.data.map((p: any) => ({ id: p.id, name: p.name })).filter((p: any) => p.id && p.name)
    }
    
    return []
  }, [projects])

  const availableProjects = useMemo(() => {
    const assignedIds = new Set((assignedForSelected || []).map((a) => (a as any).project_id ?? (a as any).id))
    return normalizedProjects.filter((p) => !assignedIds.has(p.id))
  }, [normalizedProjects, assignedForSelected])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!teamId || !projectId) return
    setIsSubmitting(true)
    try {
      const params = new URLSearchParams({ team_id: String(Number(teamId)) })
      await fetchWithAuth(`/api/projects/${projectId}/teams?${params.toString()}`, { method: "POST" })
      toast({ title: "Assigned", description: "Team assigned to project" })
    } catch (err: any) {
      toast({ title: "Error", description: err?.message || "Failed to assign team", variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  console.log("🎯 Component about to render. Teams count:", normalizedTeams.length)
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">Assign Workspace Team to Project</CardTitle>
        <CardDescription>Choose a team and a project within this workspace</CardDescription>
        <div className="text-xs text-muted-foreground">
          DEBUG: workspaceId={workspaceId}, teams={teams ? 'loaded' : 'loading'}, count={normalizedTeams.length}
        </div>
      </CardHeader>
      <CardContent>
        {teamsError && (
          <div className="text-sm text-red-500 mb-3">{teamsError.message || "Failed to load workspace teams"}</div>
        )}
        {projectsError && (
          <div className="text-sm text-red-500 mb-3">{projectsError.message || "Failed to load projects"}</div>
        )}
        <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="space-y-2">
            <Label>Workspace Team</Label>
            <Select value={teamId} onValueChange={setTeamId} disabled={isSubmitting}>
              <SelectTrigger>
                <SelectValue placeholder="Select team" />
              </SelectTrigger>
              <SelectContent>
                {teamsLoading && <div className="px-2 py-1 text-sm text-muted-foreground">Loading teams...</div>}
                {!teamsLoading && normalizedTeams.length === 0 && (
                  <SelectItem value="no-teams" disabled>
                    No teams in this workspace
                  </SelectItem>
                )}
                {normalizedTeams.map((t) => (
                  <SelectItem key={t.id} value={String(t.id)}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Project</Label>
            <Select value={projectId} onValueChange={setProjectId} disabled={isSubmitting || !teamId}>
              <SelectTrigger>
                <SelectValue placeholder={teamId ? "Select project" : "Select a team first"} />
              </SelectTrigger>
              <SelectContent>
                {projectsLoading && <div className="px-2 py-1 text-sm text-muted-foreground">Loading projects...</div>}
                {!projectsLoading && availableProjects.length === 0 && teamId && (
                  <SelectItem value="no-projects" disabled>
                    No available projects
                  </SelectItem>
                )}
                {availableProjects.map((p) => (
                  <SelectItem key={p.id} value={String(p.id)}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" disabled={isSubmitting || !teamId || !projectId}>
            {isSubmitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
            Assign
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}


