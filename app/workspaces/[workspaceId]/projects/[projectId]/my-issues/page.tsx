"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, User, AlertCircle } from "lucide-react"
import useSWR from "swr"
import { fetchWithAuth } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { authStorage } from "@/lib/auth-storage"

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

interface User {
  id: number
  name: string
  email: string
}

export default function MyIssuesPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const workspaceId = parseInt(params.workspaceId as string)
  const projectId = parseInt(params.projectId as string)

  const [user, setUser] = useState<User | null>(null)
  const [userLoading, setUserLoading] = useState(true)

  useEffect(() => {
    const userData = authStorage.getUserData()
    const accessToken = authStorage.getAuthToken()

    if (userData && accessToken) {

      // Try to get user ID from storage or use a fallback approach
      const userId = authStorage.getUserId()

      if (userId) {
        setUser({
          id: parseInt(userId),
          name: userData.name,
          email: userData.email
        })
      } else {
        // Fallback: redirect to login if no user ID
        toast({
          title: "Error",
          description: "User ID not found. Please log in again.",
          variant: "destructive"
        })
        router.push("/login")
        return
      }

      setUserLoading(false)
    } else {
      setUserLoading(false)
    }
  }, [])

  // Fetch assigned issues for current user in this project
  const { data: assignedIssues, error, isLoading, mutate } = useSWR<Issue[]>(
    user && projectId ? `/api/users/assigned-issues?project_id=${projectId}` : null,
    fetchWithAuth
  )

  const handleStatusUpdate = async (issueId: number, newStatus: string) => {
    try {
      await fetchWithAuth(`/api/issues/${issueId}/status`, {
        method: "PUT",
        body: JSON.stringify({
          status: newStatus
        })
      })

      toast({
        title: "Success",
        description: "Issue status updated successfully"
      })

      mutate() // Refresh the data
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to update issue status",
        variant: "destructive"
      })
    }
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

  const statusOptions = [
    { value: "open", label: "Open" },
    { value: "in-progress", label: "In Progress" },
    { value: "review", label: "Review" },
    { value: "testing", label: "Testing" },
    { value: "done", label: "Done" },
    { value: "closed", label: "Closed" },
  ]

  if (userLoading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.push("/dashboard")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Unable to load user information. Please log in again to access your assigned issues.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    )
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
              <h1 className="text-2xl font-bold">My Assigned Issues</h1>
              <p className="text-muted-foreground">
                Issues assigned to {user.name} in this project
              </p>
            </div>
          </div>
        </div>

        {/* Issues Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              My Assigned Issues
            </CardTitle>
            <CardDescription>
              {isLoading
                ? "Loading your assigned issues..."
                : `You have ${assignedIssues?.length || 0} assigned issues in this project`
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
                  {error.message || "Failed to load assigned issues"}
                </AlertDescription>
              </Alert>
            ) : (
              <>
                {assignedIssues && assignedIssues.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Points</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {assignedIssues.map((issue) => (
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
                          <TableCell className="text-muted-foreground">
                            {formatDate(issue.created_at)}
                          </TableCell>
                          <TableCell>
                            <Select
                              value={issue.status}
                              onValueChange={(newStatus) => handleStatusUpdate(issue.id, newStatus)}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {statusOptions.map((status) => (
                                  <SelectItem key={status.value} value={status.value}>
                                    {status.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                      <User className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">No Assigned Issues</h3>
                    <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                      You don't have any issues assigned to you in this project yet. Ask your team lead or project manager to assign you some tasks to get started!
                    </p>
                    <div className="flex gap-2 justify-center">
                      <Button
                        variant="outline"
                        onClick={() => router.push(`/workspaces/${workspaceId}/projects`)}
                      >
                        Back to Projects
                      </Button>
                      <Button
                        onClick={() => router.push(`/workspaces/${workspaceId}/projects/${projectId}/assign-issues`)}
                      >
                        Assign Issues
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
