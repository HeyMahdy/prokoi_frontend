"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { fetchWithAuth } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Play, CheckCircle2, XCircle } from "lucide-react"
import { useState } from "react"

export interface Sprint {
  id: number
  name: string
  description?: string | null
  status: "planning" | "active" | "completed" | "cancelled"
  start_date: string
  end_date: string
  goal?: string | null
  velocity_target?: number | null
  created_at?: string
}

export function SprintsTable({ sprints, onChanged, workspaceId, projectId }: { sprints: Sprint[]; onChanged?: () => void; workspaceId?: number; projectId?: number }) {
  const [busyId, setBusyId] = useState<number | null>(null)
  const { toast } = useToast()

  const callAction = async (sprintId: number, action: "start" | "complete" | "cancel") => {
    setBusyId(sprintId)
    try {
      await fetchWithAuth(`/api/sprints/${sprintId}/${action}`, { method: "POST" })
      toast({ title: "Success", description: `Sprint ${action}ed successfully` })
      onChanged?.()
    } catch (error: any) {
      const message = error?.message || `Failed to ${action} sprint`
      toast({ title: "Error", description: message, variant: "destructive" })
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Start</TableHead>
            <TableHead>End</TableHead>
            <TableHead>Velocity</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sprints.map((sprint) => (
            <TableRow key={sprint.id}>
              <TableCell className="font-medium">{sprint.id}</TableCell>
              <TableCell>{sprint.name}</TableCell>
              <TableCell>
                <Badge variant={sprint.status === "active" ? "default" : sprint.status === "completed" ? "secondary" : "outline"}>
                  {sprint.status}
                </Badge>
              </TableCell>
              <TableCell>{new Date(sprint.start_date).toLocaleDateString()}</TableCell>
              <TableCell>{new Date(sprint.end_date).toLocaleDateString()}</TableCell>
              <TableCell>{sprint.velocity_target ?? "-"}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <a
                    className="inline-flex items-center justify-center h-9 rounded-md border border-input bg-background px-3 text-sm"
                    href={`/workspaces/${workspaceId ?? (sprint as any).workspace_id ?? "_"}/projects/${projectId ?? (sprint as any).project_id ?? "_"}/sprints/${sprint.id}`}
                  >
                    View
                  </a>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={busyId === sprint.id || sprint.status !== "planning"}
                    onClick={() => callAction(sprint.id, "start")}
                  >
                    {busyId === sprint.id ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Play className="h-4 w-4 mr-2" />}
                    Start
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={busyId === sprint.id || sprint.status !== "active"}
                    onClick={() => callAction(sprint.id, "complete")}
                  >
                    {busyId === sprint.id ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
                    Complete
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={busyId === sprint.id || sprint.status === "completed"}
                    onClick={() => callAction(sprint.id, "cancel")}
                  >
                    {busyId === sprint.id ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <XCircle className="h-4 w-4 mr-2" />}
                    Cancel
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}


