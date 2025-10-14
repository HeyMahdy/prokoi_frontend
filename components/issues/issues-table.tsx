"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Info, Filter, X } from "lucide-react"
import useSWR from "swr"
import { fetchWithAuth } from "@/lib/api"

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
}

interface IssueType {
  id: number
  name: string
}

interface IssuesTableProps {
  projectId: number
}

export function IssuesTable({ projectId }: IssuesTableProps) {
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [priorityFilter, setPriorityFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [hasFilters, setHasFilters] = useState(false)

  // Build query parameters
  const queryParams = new URLSearchParams()
  if (statusFilter && statusFilter !== "all") queryParams.append("status", statusFilter)
  if (priorityFilter && priorityFilter !== "all") queryParams.append("priority", priorityFilter)
  if (typeFilter && typeFilter !== "all") queryParams.append("type_id", typeFilter)
  
  const queryString = queryParams.toString()
  const apiUrl = `/api/projects/${projectId}/issues${queryString ? `?${queryString}` : ""}`

  const {
    data: issues,
    isLoading,
    error,
    mutate,
  } = useSWR<Issue[]>(apiUrl, fetchWithAuth)

  // Fetch issue types for filter
  const { data: issueTypes } = useSWR<IssueType[]>("/api/issue-types", fetchWithAuth)

  const statusOptions = [
    { value: "open", label: "Open" },
    { value: "in-progress", label: "In Progress" },
    { value: "review", label: "Review" },
    { value: "testing", label: "Testing" },
    { value: "done", label: "Done" },
    { value: "closed", label: "Closed" },
  ]

  const priorityOptions = [
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
    { value: "critical", label: "Critical" },
  ]

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      "open": "default",
      "in-progress": "secondary",
      "review": "outline",
      "testing": "outline",
      "done": "default",
      "closed": "secondary",
    }
    
    return (
      <Badge variant={variants[status] || "outline"}>
        {status.replace("-", " ").replace(/\b\w/g, l => l.toUpperCase())}
      </Badge>
    )
  }

  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      "low": "secondary",
      "medium": "default",
      "high": "destructive",
      "critical": "destructive",
    }
    
    const colors: Record<string, string> = {
      "low": "bg-gray-100 text-gray-800",
      "medium": "bg-blue-100 text-blue-800",
      "high": "bg-orange-100 text-orange-800",
      "critical": "bg-red-100 text-red-800",
    }
    
    return (
      <Badge variant="outline" className={colors[priority] || "bg-gray-100 text-gray-800"}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </Badge>
    )
  }

  const clearFilters = () => {
    setStatusFilter("all")
    setPriorityFilter("all")
    setTypeFilter("all")
    setHasFilters(false)
  }

  // Check if filters are applied
  const filtersApplied = (statusFilter && statusFilter !== "all") || 
                        (priorityFilter && priorityFilter !== "all") || 
                        (typeFilter && typeFilter !== "all")

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const refreshData = () => {
    mutate()
  }

  // Expose refresh function for parent components
  if (typeof window !== "undefined") {
    (window as any).refreshIssues = refreshData
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Project Issues</CardTitle>
          <CardDescription>Issues and sub-issues for this project</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertDescription>
              Failed to load issues. Please try again.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Project Issues</CardTitle>
            <CardDescription>Issues and sub-issues for this project</CardDescription>
          </div>
          {filtersApplied && (
            <Button variant="outline" size="sm" onClick={clearFilters}>
              <X className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="mb-6 p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="h-4 w-4" />
            <span className="text-sm font-medium">Filters</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Priority</label>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All priorities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All priorities</SelectItem>
                  {priorityOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Issue Type</label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  {issueTypes?.map((type) => (
                    <SelectItem key={type.id} value={type.id.toString()}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Issues Table */}
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
        ) : (
          <>
            {issues && issues.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Points</TableHead>
                    <TableHead>Parent</TableHead>
                    <TableHead>Created</TableHead>
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
                          {(() => {
                            const issueType = issueTypes?.find(t => t.id === issue.type_id);
                            console.log(`Issue ${issue.id}: type_id=${issue.type_id}, issueTypes=`, issueTypes, 'found=', issueType);
                            return issueType?.name || "Unknown";
                          })()}
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
                      <TableCell>
                        {issue.parent_issue_id ? (
                          <Badge variant="outline">Sub-issue</Badge>
                        ) : (
                          <Badge variant="default">Main</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(issue.created_at)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  No issues found for this project. Create your first issue to get started.
                </AlertDescription>
              </Alert>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
