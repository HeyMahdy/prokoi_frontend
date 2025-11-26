"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import useSWR from "swr"
import { fetchWithAuth } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, AlertCircle, Filter } from "lucide-react"
import { isTokenDebuggingEnabled } from "@/lib/token-debug"
import { getValidatedUserId } from "@/lib/token-validation"

interface User {
  id: number
  name: string
  email: string
}

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
      
      // Use the new validated user ID extraction
      const validatedUserId = getValidatedUserId();
      if (validatedUserId) {
        setUser({
          id: validatedUserId,
          name: parsedUser.name,
          email: parsedUser.email
        })
        setUserLoading(false)
        return
      }
      
      // If no user ID available, show error
      toast({
        title: "Error",
        description: "User ID not found. Please log in again to access assigned issues.",
        variant: "destructive"
      })
      
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
    ? `/api/users/assigned-issues${queryString ? `?${queryString}` : ""}`
    : null

  const { data: issues, error, isLoading, mutate } = useSWR<Issue[]>(
    apiUrl,
    (url: string) => fetchWithAuth(url)
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
              Unable to load user information. Please log in again.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.push("/dashboard")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>

        <div>
          <h1 className="text-3xl font-bold">Assigned Issues</h1>
          <p className="text-muted-foreground">Issues assigned to you across all projects</p>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Filter className="h-5 w-5" />
                <CardTitle>Filters</CardTitle>
              </div>
              {hasFilters && (
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  Clear Filters
                </Button>
              )}
            </div>
            <CardDescription>Filter issues by project</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Project</label>
                <Select value={projectFilter} onValueChange={setProjectFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All projects" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All projects</SelectItem>
                    {projects?.map((project: Project) => (
                      <SelectItem key={project.id} value={project.id.toString()}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Issues Table */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle>Assigned Issues</CardTitle>
            <CardDescription>Issues currently assigned to you</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading && (
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
            )}

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {error.message || "Failed to load assigned issues"}
                </AlertDescription>
              </Alert>
            )}

            {issues && issues.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No assigned issues found
              </div>
            )}

            {issues && issues.length > 0 && (
              <div className="rounded-md border">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">ID</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Title</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Project</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Priority</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Created</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {issues.map((issue) => {
                      // Find the project name for this issue
                      const project = projects?.find((p: Project) => p.id === issue.project_id)
                      
                      return (
                        <tr key={issue.id} className="border-b">
                          <td className="p-4 align-middle font-mono text-sm">{issue.id}</td>
                          <td className="p-4 align-middle">
                            <div>
                              <div className="font-medium">{issue.title}</div>
                              {issue.description && (
                                <div className="text-sm text-muted-foreground truncate max-w-[300px]">
                                  {issue.description}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="p-4 align-middle">
                            {project ? project.name : "Unknown Project"}
                          </td>
                          <td className="p-4 align-middle">{getStatusBadge(issue.status)}</td>
                          <td className="p-4 align-middle">{getPriorityBadge(issue.priority)}</td>
                          <td className="p-4 align-middle text-muted-foreground">
                            {formatDate(issue.created_at)}
                          </td>
                          <td className="p-4 align-middle">
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
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}