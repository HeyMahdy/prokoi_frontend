"use client"

import { useEffect, useMemo, useState } from "react"
import useSWR from "swr"
import { fetchWithAuth } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Plus } from "lucide-react"

interface IssueOption {
  id: number
  title: string
}

interface AddIssuesToSprintFormProps {
  projectId: number
  sprintId: number
  existingIssueIds?: number[]
  onAdded?: () => void
}

export function AddIssuesToSprintForm({ projectId, sprintId, existingIssueIds = [], onAdded }: AddIssuesToSprintFormProps) {
  const { data: projectIssues } = useSWR<IssueOption[]>(`/api/projects/${projectId}/issues`, fetchWithAuth)
  const { toast } = useToast()
  const [selectedIssueId, setSelectedIssueId] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const candidateIssues = useMemo(() => {
    return (projectIssues || []).filter((issue) => !existingIssueIds.includes(issue.id))
  }, [projectIssues, existingIssueIds])

  useEffect(() => {
    if (candidateIssues.length > 0 && !selectedIssueId) {
      setSelectedIssueId(String(candidateIssues[0].id))
    }
  }, [candidateIssues, selectedIssueId])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedIssueId) return
    setIsSubmitting(true)
    try {
      await fetchWithAuth(`/api/sprints/${sprintId}/issues`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ issue_ids: [Number(selectedIssueId)] }),
      })
      toast({ title: "Success", description: "Issue added to sprint" })
      onAdded?.()
    } catch (error: any) {
      toast({ title: "Error", description: error?.message || "Failed to add issue", variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Add Issue to Sprint
        </CardTitle>
        <CardDescription>Select a project issue to add to this sprint</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleAdd} className="flex gap-4 items-end">
          <div className="flex-1 space-y-2">
            <Label>Issue</Label>
            <Select value={selectedIssueId} onValueChange={setSelectedIssueId} disabled={isSubmitting || candidateIssues.length === 0}>
              <SelectTrigger>
                <SelectValue placeholder={candidateIssues.length === 0 ? "No available issues" : "Select issue"} />
              </SelectTrigger>
              <SelectContent>
                {candidateIssues.map((issue) => (
                  <SelectItem key={issue.id} value={String(issue.id)}>
                    {issue.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" disabled={isSubmitting || !selectedIssueId}>
            {isSubmitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
            Add
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}


