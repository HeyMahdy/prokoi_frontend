"use client"

import useSWR from "swr"
import { useParams } from "next/navigation"
import { fetchWithAuth } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Layers, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CreateSprintForm } from "@/components/sprints/create-sprint-form"
import { SprintsTable, Sprint } from "@/components/sprints/sprints-table"

export default function ProjectSprintsPage() {
  const params = useParams() as { workspaceId: string; projectId: string }
  const projectId = Number(params.projectId)
  const workspaceId = Number(params.workspaceId)

  const { data, error, isLoading, mutate } = useSWR<Sprint[]>(
    Number.isFinite(projectId) ? `/api/projects/${projectId}/sprints` : null,
    fetchWithAuth,
  )

  return (
    <div className="container mx-auto px-6 py-8 space-y-8">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Layers className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">Sprints</CardTitle>
              <CardDescription>Manage sprints for this project</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error.message || "Failed to load sprints"}</AlertDescription>
            </Alert>
          )}

          {data && data.length > 0 && (
            <SprintsTable sprints={data} onChanged={() => mutate()} workspaceId={workspaceId} projectId={projectId} />
          )}

          {data && data.length === 0 && (
            <div className="text-sm text-muted-foreground">No sprints yet. Create the first sprint below.</div>
          )}
        </CardContent>
      </Card>

      {Number.isFinite(projectId) && (
        <CreateSprintForm projectId={projectId} onSuccess={() => mutate()} />
      )}
    </div>
  )
}


