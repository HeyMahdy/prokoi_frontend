"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, User, AlertCircle, UserCheck } from "lucide-react"
import useSWR from "swr"
import { fetchWithAuth } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import AssignIssueForm from "@/components/issues/assign-issue-form"

interface Issue {
  id: number
  project_id: number
  type_id: number
  title: string
  description: string
  story_points: number | null
  status: string
  priority: string
  created_by: number
  parent_issue_id: number | null
  created_at: string
  updated_at: string
  assigned_to?: number | null
  assigned_user?: {
    id: number
    name: string
    email: string
  } | null
}

export default function AssignIssuesPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const workspaceId = parseInt(params.workspaceId as string)
  const projectId = parseInt(params.projectId as string)
  
  const [selectedIssueId, setSelectedIssueId] = useState<number | null>(null)

  // Fetch all issues from this project
  const { data: issues, error, isLoading, mutate } = useSWR<Issue[]>(
    projectId ? `/api/projects/${projectId}/issues` : null,
    fetchWithAuth
  )

  const handleAssignmentSuccess = () => {
    mutate() // Refresh the issues data
    setSelectedIssueId(null) // Close the form
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      open: { variant: "secondary" as const, label: "Open" },
      "in-progress": { variant: "default" as const, label: "In Progress" },
      review: { variant: "outline" as const, label: "Review" },
      testing: { variant: "secondary" as const, label: "Testing" },
      done: { variant: "default" as const, label: "Done" },
      closed: { variant: "outline" as const, label: "Closed" },
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || { variant: "outline" as const, label: status }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      low: { variant: "secondary" as const, label: "Low" },
      medium: { variant: "outline" as const, label: "Medium" },
      high: { variant: "destructive" as const, label: "High" },
      urgent: { variant: "destructive" as const, label: "Urgent" },
    }
    
    const config = priorityConfig[priority as keyof typeof priorityConfig] || { variant: "outline" as const, label: priority }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    })
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.push(`/workspaces/${workspaceId}/projects`)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Projects
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Assign Issues</h1>
              <p className="text-muted-foreground">
                Assign issues to team members in this project
              </p>
            </div>
          </div>
        </div>

        {/* Assign Issue Form */}
        {selectedIssueId && (
          <AssignIssueForm
            issueId={selectedIssueId}
            projectId={projectId}
            onSuccess={handleAssignmentSuccess}
            currentAssignment={issues?.find(issue => issue.id === selectedIssueId)?.assigned_user ? {
              assigned_to: issues?.find(issue => issue.id === selectedIssueId)?.assigned_to!,
              assigned_user: issues?.find(issue => issue.id === selectedIssueId)?.assigned_user!
            } : null}
          />
        )}

        {/* Issues Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5" />
              Project Issues
            </CardTitle>
            <CardDescription>
              {isLoading 
                ? "Loading project issues..." 
                : `There are ${issues?.length || 0} issues in this project`
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-4 w-[60px]" />
                    <Skeleton className="h-4 flex-1" />
                    <Skeleton className="h-6 w-[80px]" />
                    <Skeleton className="h-6 w-[80px]" />
                    <Skeleton className="h-4 w-[100px]" />
                  </div>
                ))}
              </div>
            ) : error ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {error.message || "Failed to load project issues"}
                </AlertDescription>
              </Alert>
            ) : (
              <>
                {issues && issues.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Points</TableHead>
                        <TableHead>Assigned To</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {issues.map((issue) => (
                        <TableRow key={issue.id}>
                          <TableCell className="font-mono text-sm">{issue.id}</TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{issue.title}</div>
                              {issue.description && (
                                <div className="text-sm text-muted-foreground truncate max-w-[300px]">
                                  {issue.description}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(issue.status)}</TableCell>
                          <TableCell>{getPriorityBadge(issue.priority)}</TableCell>
                          <TableCell>
                            {issue.story_points ? (
                              <Badge variant="secondary">{issue.story_points}</Badge>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {issue.assigned_user ? (
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <div>
                                  <div className="font-medium text-sm">{issue.assigned_user.name}</div>
                                  <div className="text-xs text-muted-foreground">{issue.assigned_user.email}</div>
                                </div>
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-sm">Unassigned</span>
                            )}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {formatDate(issue.created_at)}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedIssueId(issue.id)}
                            >
                              <User className="h-4 w-4 mr-2" />
                              {issue.assigned_user ? "Reassign" : "Assign"}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                      <UserCheck className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">No Issues Found</h3>
                    <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                      There are no issues in this project yet. Create some issues first before assigning them to team members.
                    </p>
                    <div className="flex gap-2 justify-center">
                      <Button 
                        variant="outline" 
                        onClick={() => router.push(`/workspaces/${workspaceId}/projects`)}
                      >
                        Back to Projects
                      </Button>
                      <Button 
                        onClick={() => router.push(`/organizations/${issues?.[0]?.project_id || 'unknown'}/workspaces/${workspaceId}/projects/${projectId}/issues`)}
                      >
                        Create Issues
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
