"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, User, AlertCircle, Filter, X } from "lucide-react"
import useSWR from "swr"
import { fetchWithAuth } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

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

interface Project {
  id: number
  name: string
  workspace_id: number
}

interface User {
  id: number
  name: string
  email: string
}

export default function AssignedIssuesPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [user, setUser] = useState<User | null>(null)
  const [userLoading, setUserLoading] = useState(true)
  const [projectFilter, setProjectFilter] = useState<string>("all")
  const [hasFilters, setHasFilters] = useState(false)

  useEffect(() => {
    const userData = localStorage.getItem("user_data")
    const accessToken = localStorage.getItem("access_token")
    
    if (userData && accessToken) {
      const parsedUser = JSON.parse(userData)
      
      // For now, we'll need to get the user ID from somewhere else
      // Since /api/users/me doesn't exist, let's try to get it from the login response
      // or we can modify the login to store the user ID
      
      // Temporary solution: Check if we have user ID in localStorage from login
      const userId = localStorage.getItem("user_id")
      
      if (userId) {
        setUser({
          id: parseInt(userId),
          name: parsedUser.name,
          email: parsedUser.email
        })
      } else {
        // If no user ID available, show error
        toast({
          title: "Error",
          description: "User ID not found. Please log in again to access assigned issues.",
          variant: "destructive"
        })
      }
      
      setUserLoading(false)
    } else {
      setUserLoading(false)
    }
  }, [])

  // Build query parameters
  const queryParams = new URLSearchParams()
  if (projectFilter && projectFilter !== "all") queryParams.append("project_id", projectFilter)
  
  const queryString = queryParams.toString()
  const apiUrl = user 
    ? `/api/users/${user.id}/assigned-issues${queryString ? `?${queryString}` : ""}`
    : null

  const { data: issues, error, isLoading, mutate } = useSWR<Issue[]>(
    apiUrl,
    (url) => fetchWithAuth(url)
  )

  // Fetch organizations to get projects
  const { data: organizations } = useSWR(`/api/organizations/get`, fetchWithAuth)
  
  // Fetch all projects from all workspaces
  const projectsData = organizations ? 
    Promise.all(
      organizations.map((org: any) => 
        fetchWithAuth(`/api/organizations/${org.id}/workspaces`)
          .then((workspaces: any[]) => 
            Promise.all(
              workspaces.map((workspace: any) =>
                fetchWithAuth(`/api/organizations/${org.id}/workspaces/${workspace.id}/projects`)
                  .then((projects: Project[]) => projects)
              )
            )
          )
      )
    ).then(allProjects => allProjects.flat().flat()) : null

  const { data: projects } = useSWR(
    organizations ? 'all-projects' : null,
    () => projectsData
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

  const clearFilters = () => {
    setProjectFilter("all")
    setHasFilters(false)
  }

  useEffect(() => {
    setHasFilters(projectFilter !== "all")
  }, [projectFilter])


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
            <Button variant="ghost" onClick={() => router.push("/dashboard")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-2xl font-bold">My Assigned Issues</h1>
              <p className="text-muted-foreground">
                Issues assigned to {user.name}
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              <CardTitle className="text-lg">Filters</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 items-end">
              <div className="space-y-2">
                <label className="text-sm font-medium">Project</label>
                <Select value={projectFilter} onValueChange={setProjectFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="All projects" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Projects</SelectItem>
                    {projects?.map((project) => (
                      <SelectItem key={project.id} value={project.id.toString()}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {hasFilters && (
                <Button variant="outline" onClick={clearFilters}>
                  <X className="h-4 w-4 mr-2" />
                  Clear Filters
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Issues Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Assigned Issues
            </CardTitle>
            <CardDescription>
              {isLoading 
                ? "Loading your assigned issues..." 
                : `You have ${issues?.length || 0} assigned issues`
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
                <AlertDescription>
                  {error.message || "Failed to load assigned issues"}
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
                        <TableHead>Project</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Points</TableHead>
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
                          <TableCell>
                            <Badge variant="outline">
                              {projects?.find(p => p.id === issue.project_id)?.name || `Project ${issue.project_id}`}
                            </Badge>
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
                      You don't have any issues assigned to you yet. Ask your team lead or project manager to assign you some tasks to get started!
                    </p>
                    <Button 
                      variant="outline" 
                      onClick={() => router.push("/dashboard")}
                    >
                      Back to Dashboard
                    </Button>
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
