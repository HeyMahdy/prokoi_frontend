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

interface Project { id: number; name: string }
interface TeamProject { team_id: number; project_id: number }

export function AssignTeamToProjectForm({ orgId, teamId }: { orgId: number; teamId: number }) {
  const { data: workspaces } = useSWR<{ id: number; name: string }[]>(`/api/organizations/${orgId}/workspaces`, fetchWithAuth)
  const [workspaceId, setWorkspaceId] = useState<string>("")
  const { data: projects } = useSWR<Project[]>(
    workspaceId ? `/api/workspaces/${workspaceId}/projects` : null,
    fetchWithAuth,
  )
  const { data: assigned } = useSWR<TeamProject[]>(`/api/teams/${teamId}/projects`, fetchWithAuth)
  const { toast } = useToast()
  const [projectId, setProjectId] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const availableProjects = useMemo(() => {
    const assignedIds = new Set((assigned || []).map((a) => a.project_id))
    return (projects || []).filter((p) => !assignedIds.has(p.id))
  }, [projects, assigned])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!projectId) return
    setIsSubmitting(true)
    try {
      await fetchWithAuth(`/api/projects/${projectId}/teams`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ team_id: teamId }),
      })
      toast({ title: "Assigned", description: "Team assigned to project" })
      mutate(`/api/teams/${teamId}/projects`)
    } catch (err: any) {
      toast({ title: "Error", description: err?.message || "Failed to assign team", variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">Assign Team to Project</CardTitle>
        <CardDescription>Link team to a project in the workspace</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="space-y-2">
            <Label>Workspace</Label>
            <Select value={workspaceId} onValueChange={setWorkspaceId} disabled={isSubmitting}>
              <SelectTrigger>
                <SelectValue placeholder="Select workspace" />
              </SelectTrigger>
              <SelectContent>
                {(workspaces || []).map((w) => (
                  <SelectItem key={w.id} value={String(w.id)}>
                    {w.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Project</Label>
            <Select value={projectId} onValueChange={setProjectId} disabled={isSubmitting || !workspaceId}>
              <SelectTrigger>
                <SelectValue placeholder={workspaceId ? "Select project" : "Select a workspace first"} />
              </SelectTrigger>
              <SelectContent>
                {availableProjects.map((p) => (
                  <SelectItem key={p.id} value={String(p.id)}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" disabled={isSubmitting || !projectId}>
            {isSubmitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
            Assign
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}


