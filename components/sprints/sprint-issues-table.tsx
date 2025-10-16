"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { fetchWithAuth } from "@/lib/api"
import { ArrowDown, ArrowUp, Loader2, Trash2 } from "lucide-react"
import { useState } from "react"

export interface SprintIssue {
  id: number
  title: string
  priority?: string | null
}

interface SprintIssuesTableProps {
  sprintId: number
  issues: SprintIssue[]
  onChanged?: () => void
}

export function SprintIssuesTable({ sprintId, issues, onChanged }: SprintIssuesTableProps) {
  const [busy, setBusy] = useState(false)
  const [removingId, setRemovingId] = useState<number | null>(null)

  // Normalize issues to support either `id` or backend `issue_id`
  const normalized = issues.map((it) => {
    const id = (it as any).id ?? (it as any).issue_id
    const title = (it as any).title ?? (it as any).issue_title
    return { id, title, priority: (it as any).priority ?? null } as SprintIssue
  })

  const reorder = async (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= normalized.length) return
    setBusy(true)
    try {
      const newOrder = [...normalized]
      const [moved] = newOrder.splice(fromIndex, 1)
      newOrder.splice(toIndex, 0, moved)
      const orderedIds = newOrder.map((i) => i.id)
      await fetchWithAuth(`/api/sprints/${sprintId}/issues/reorder`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ issue_ids: orderedIds }),
      })
      onChanged?.()
    } finally {
      setBusy(false)
    }
  }

  const removeIssue = async (issueId: number) => {
    setRemovingId(issueId)
    try {
      await fetchWithAuth(`/api/sprints/${sprintId}/issues/${issueId}`, { method: "DELETE" })
      onChanged?.()
    } finally {
      setRemovingId(null)
    }
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Order</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {normalized.map((issue, index) => (
            <TableRow key={`${issue.id}-${index}`}>
              <TableCell className="font-medium">{issue.id}</TableCell>
              <TableCell>{issue.title}</TableCell>
              <TableCell>{issue.priority ?? "-"}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" disabled={busy || index === 0} onClick={() => reorder(index, index - 1)}>
                    {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUp className="h-4 w-4" />}
                  </Button>
                  <Button size="sm" variant="outline" disabled={busy || index === normalized.length - 1} onClick={() => reorder(index, index + 1)}>
                    {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowDown className="h-4 w-4" />}
                  </Button>
                </div>
              </TableCell>
              <TableCell>
                <Button size="sm" variant="outline" disabled={removingId === issue.id} onClick={() => removeIssue(issue.id)}>
                  {removingId === issue.id ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Trash2 className="h-4 w-4 mr-2" />}
                  Remove
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}


