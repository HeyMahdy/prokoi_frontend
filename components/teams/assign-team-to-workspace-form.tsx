"use client"

import useSWR from "swr"
import { useState, useMemo } from "react"
import { fetchWithAuth } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Plus } from "lucide-react"
import { mutate } from "swr"

interface Workspace { id: number; name: string }
interface TeamWorkspace { team_id: number; workspace_id: number }

export function AssignTeamToWorkspaceForm({ orgId, teamId }: { orgId: number; teamId: number }) {
  const { data: workspaces } = useSWR<Workspace[]>(`/api/organizations/${orgId}/workspaces`, fetchWithAuth)
  const { data: assigned } = useSWR<TeamWorkspace[]>(`/api/teams/${teamId}/workspaces`, fetchWithAuth)
  const { toast } = useToast()
  const [workspaceId, setWorkspaceId] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const availableWorkspaces = useMemo(() => {
    const assignedIds = new Set((assigned || []).map((a) => a.workspace_id))
    return (workspaces || []).filter((w) => !assignedIds.has(w.id))
  }, [workspaces, assigned])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!workspaceId) return
    setIsSubmitting(true)
    try {
      await fetchWithAuth(`/api/workspaces/${workspaceId}/teams`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ team_id: teamId }),
      })
      toast({ title: "Assigned", description: "Team assigned to workspace" })
      mutate(`/api/teams/${teamId}/workspaces`)
    } catch (err: any) {
      toast({ title: "Error", description: err?.message || "Failed to assign team", variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">Assign Team to Workspace</CardTitle>
        <CardDescription>Link team to an organization workspace</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="flex gap-4 items-end">
          <div className="flex-1 space-y-2">
            <Label>Workspace</Label>
            <Select value={workspaceId} onValueChange={setWorkspaceId} disabled={isSubmitting}>
              <SelectTrigger>
                <SelectValue placeholder="Select workspace" />
              </SelectTrigger>
              <SelectContent>
                {availableWorkspaces.map((w) => (
                  <SelectItem key={w.id} value={String(w.id)}>
                    {w.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" disabled={isSubmitting || !workspaceId}>
            {isSubmitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
            Assign
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}


