"use client"

import useSWR from "swr"
import { fetchWithAuth } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle, Bug, User, Layers } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { mutate } from "swr"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface Project {
  id: number
  name: string
  workspace_id: number
  created_by: number
  status: string
  created_at: string
  updated_at: string
  creator_name: string
  creator_email: string
  workspace_name: string
  organization_id: number
}

interface ProjectsTableProps {
  workspaceId: number
  onMyIssues?: (projectId: number) => void
  onAssignIssues?: (projectId: number) => void
}

export function ProjectsTable({ workspaceId, onMyIssues, onAssignIssues }: ProjectsTableProps) {
  const { data, error, isLoading } = useSWR<Project[]>(
    `/api/workspaces/${workspaceId}/projects`,
    fetchWithAuth,
  )
  const { toast } = useToast()

  const handleStatusUpdate = async (projectId: number, newStatus: string) => {
    try {
      // Manually construct the query parameter to preserve spaces
      const encodedStatus = encodeURIComponent(newStatus)
      
      await fetchWithAuth(`/api/projects/${projectId}/decision?decision=${encodedStatus}`, {
        method: "PUT",
      })

      toast({
        title: "Success",
        description: "Project status updated successfully!",
      })

      // Revalidate the projects list to show updated data
      mutate(`/api/workspaces/${workspaceId}/projects`)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update project status"
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'default'
      case 'Completed':
        return 'secondary'
      case 'On Hold':
        return 'destructive'
      case 'Inactive':
        return 'outline'
      default:
        return 'outline'
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'Completed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      case 'On Hold':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
      case 'Inactive':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Workspace Projects</CardTitle>
        <CardDescription>All projects in this workspace</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error.message || "Failed to load projects"}</AlertDescription>
          </Alert>
        )}

        {isLoading && (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        )}

        {data && !isLoading && (
          <>
            {data.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No projects found in this workspace</p>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Project Name</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Creator</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Last Updated</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.map((project) => (
                      <TableRow key={project.id}>
                        <TableCell className="font-medium">{project.name}</TableCell>
                        <TableCell>
                          <Select
                            value={project.status}
                            onValueChange={(newStatus) => handleStatusUpdate(project.id, newStatus)}
                          >
                            <SelectTrigger className="w-[140px]">
                              <SelectValue>
                                <Badge 
                                  variant={getStatusBadgeVariant(project.status)}
                                  className={getStatusBadgeColor(project.status)}
                                >
                                  {project.status}
                                </Badge>
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="active">
                                <Badge variant={getStatusBadgeVariant("active")} className={getStatusBadgeColor("active")}>
                                  Active
                                </Badge>
                              </SelectItem>
                              <SelectItem value="Inactive">
                                <Badge variant={getStatusBadgeVariant("Inactive")} className={getStatusBadgeColor("Inactive")}>
                                  Inactive
                                </Badge>
                              </SelectItem>
                              <SelectItem value="Completed">
                                <Badge variant={getStatusBadgeVariant("Completed")} className={getStatusBadgeColor("Completed")}>
                                  Completed
                                </Badge>
                              </SelectItem>
                              <SelectItem value="On Hold">
                                <Badge variant={getStatusBadgeVariant("On Hold")} className={getStatusBadgeColor("On Hold")}>
                                  On Hold
                                </Badge>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{project.creator_name}</div>
                            <div className="text-sm text-muted-foreground">{project.creator_email}</div>
                          </div>
                        </TableCell>
                        <TableCell>{new Date(project.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>{new Date(project.updated_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/organizations/${project.organization_id}/workspaces/${project.workspace_id}/projects/${project.id}/issues`}>
                                <Bug className="h-4 w-4 mr-2" />
                                Issues
                              </Link>
                            </Button>
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/workspaces/${project.workspace_id}/projects/${project.id}/sprints`}>
                                <Layers className="h-4 w-4 mr-2" />
                                Sprints
                              </Link>
                            </Button>
                            {onMyIssues && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => onMyIssues(project.id)}
                              >
                                <User className="h-4 w-4 mr-2" />
                                My Issues
                              </Button>
                            )}
                            {onAssignIssues && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => onAssignIssues(project.id)}
                              >
                                <User className="h-4 w-4 mr-2" />
                                Assign Issues
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
