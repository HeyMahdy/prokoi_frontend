"use client"

import useSWR from "swr"
import { useParams, useRouter } from "next/navigation"
import { fetchWithAuth } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Layers } from "lucide-react"
import { SprintsTable, Sprint } from "@/components/sprints/sprints-table"
import { SprintIssuesTable, SprintIssue } from "@/components/sprints/sprint-issues-table"
import { AddIssuesToSprintForm } from "@/components/sprints/add-issues-to-sprint-form"

export default function SprintDetailPage() {
  const params = useParams() as { workspaceId: string; projectId: string; sprintId: string }
  const router = useRouter()
  const projectId = Number(params.projectId)
  const sprintId = Number(params.sprintId)

  const { data: sprint, error: sprintError, isLoading: sprintLoading, mutate: mutateSprint } = useSWR<Sprint>(
    Number.isFinite(sprintId) ? `/api/sprints/${sprintId}` : null,
    fetchWithAuth,
  )

  const { data: sprintIssues, error: issuesError, isLoading: issuesLoading, mutate: mutateIssues } = useSWR<SprintIssue[]>(
    Number.isFinite(sprintId) ? `/api/sprints/${sprintId}/issues` : null,
    fetchWithAuth,
  )

  return (
    <div className="container mx-auto px-6 py-8 space-y-8">
      <div className="flex items-center gap-3">
        <Button variant="ghost" onClick={() => router.push(`/workspaces/${params.workspaceId}/projects/${params.projectId}/sprints`)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Sprints
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Layers className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">Sprint Detail</CardTitle>
              <CardDescription>View and manage sprint backlog</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {sprintLoading && (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
            </div>
          )}
          {sprintError && (
            <Alert variant="destructive">
              <AlertDescription>{sprintError.message || "Failed to load sprint"}</AlertDescription>
            </Alert>
          )}
          {sprint && (
            <div className="text-sm text-muted-foreground">
              <div><span className="font-medium">Name:</span> {sprint.name}</div>
              <div><span className="font-medium">Status:</span> {sprint.status}</div>
              <div><span className="font-medium">Dates:</span> {new Date(sprint.start_date).toLocaleDateString()} - {new Date(sprint.end_date).toLocaleDateString()}</div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Backlog</CardTitle>
          <CardDescription>Issues in this sprint</CardDescription>
        </CardHeader>
        <CardContent>
          {issuesLoading && (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          )}
          {issuesError && (
            <Alert variant="destructive">
              <AlertDescription>{issuesError.message || "Failed to load sprint issues"}</AlertDescription>
            </Alert>
          )}
          {sprintIssues && (
            <SprintIssuesTable sprintId={sprintId} issues={sprintIssues} onChanged={() => mutateIssues()} />
          )}
        </CardContent>
      </Card>

      {Number.isFinite(projectId) && Number.isFinite(sprintId) && (
        <AddIssuesToSprintForm
          projectId={projectId}
          sprintId={sprintId}
          existingIssueIds={(sprintIssues || []).map((i) => i.id)}
          onAdded={() => mutateIssues()}
        />
      )}
    </div>
  )
}


