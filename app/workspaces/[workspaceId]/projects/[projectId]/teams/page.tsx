"use client"

import useSWR from "swr"
import { useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import { fetchWithAuth } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertCircle, Users, ArrowLeft } from "lucide-react"
import { AssignExistingTeamToProjectForm } from "@/components/teams/assign-existing-team-to-project-form"

interface Team { id: number; name: string }

export default function ProjectTeamsPage() {
  const params = useParams() as { workspaceId: string; projectId: string }
  const router = useRouter()
  const projectId = Number(params.projectId)

  const { data, error, isLoading } = useSWR<any>(
    Number.isFinite(projectId) ? `/api/projects/${projectId}/teams` : null,
    fetchWithAuth,
  )

  // Normalize the teams data
  const normalizedTeams: Team[] = useMemo(() => {
    if (!data) return []
    
    // Handle direct array response
    if (Array.isArray(data)) {
      return data.map((t: any) => ({ 
        id: t.team_id || t.id, 
        name: t.team_name || t.name || `Team ${t.team_id || t.id}` 
      })).filter((t) => t.id)
    }
    
    // Handle wrapped responses
    if (data.items && Array.isArray(data.items)) {
      return data.items.map((t: any) => ({ 
        id: t.team_id || t.id, 
        name: t.team_name || t.name || `Team ${t.team_id || t.id}` 
      })).filter((t: any) => t.id)
    }
    
    if (data.data && Array.isArray(data.data)) {
      return data.data.map((t: any) => ({ 
        id: t.team_id || t.id, 
        name: t.team_name || t.name || `Team ${t.team_id || t.id}` 
      })).filter((t: any) => t.id)
    }
    
    return []
  }, [data])

  // No project details fetch required; we rely on workspaceId from the URL

  return (
    <div className="container mx-auto px-6 py-8 space-y-8">
      <div className="flex items-center gap-3">
        <Button variant="ghost" onClick={() => router.push(`/workspaces/${params.workspaceId}/projects`)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Projects
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">Project Teams</CardTitle>
              <CardDescription>Teams assigned to this project</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <AssignExistingTeamToProjectForm workspaceId={Number(params.workspaceId)} projectId={projectId} />
          </div>
          {isLoading && (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          )}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error.message || "Failed to load teams"}</AlertDescription>
            </Alert>
          )}
          {normalizedTeams && (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {normalizedTeams.map((team) => (
                    <TableRow key={team.id}>
                      <TableCell className="font-medium">{team.id}</TableCell>
                      <TableCell>{team.name}</TableCell>
                    </TableRow>
                  ))}
                  {normalizedTeams.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={2} className="text-sm text-muted-foreground text-center">No teams assigned</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}


