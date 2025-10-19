"use client"

import useSWR from "swr"
import { fetchWithAuth } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { AlertCircle, BarChart3, TrendingUp, Users, Bug, CheckCircle, Zap } from "lucide-react"
import Link from "next/link"

interface ProjectAnalysisData {
  project_id: number
  project_name: string
  project_status: string
  workspace_name: string
  organization_name: string
  total_users: number
  total_teams: number
  project_users: any[]
  project_teams: any[]
  total_issues: number
  open_issues: number
  in_progress_issues: number
  completed_issues: number
  high_priority_issues: number
  critical_issues: number
  total_sprints: number
  active_sprints: number
  total_hours_logged: number
  avg_hours_per_log: number
  avg_team_velocity: number
  total_comments: number
  total_attachments: number
  recent_activity: number
  total_story_points: number
  avg_story_points: number
}

interface ProjectsAnalysisOverviewProps {
  organizationId: number
  maxProjects?: number
}

export function ProjectsAnalysisOverview({ organizationId, maxProjects = 3 }: ProjectsAnalysisOverviewProps) {
  // First fetch projects for this organization
  const { data: projects, error: projectsError, isLoading: projectsLoading } = useSWR<any[]>(
    organizationId ? `/api/organizations/${organizationId}/projects` : null,
    fetchWithAuth
  )

  // Get project IDs for analysis
  const projectIds = projects ? projects.slice(0, maxProjects).map(p => p.id) : []

  // Fetch individual project analyses
  const analyses = projectIds.map(projectId => {
    const { data, error, isLoading } = useSWR<ProjectAnalysisData>(
      projectId ? `/api/projects/${projectId}/analysis/depth` : null,
      fetchWithAuth
    )
    return { data, error, isLoading, projectId }
  })

  const isLoading = projectsLoading || analyses.some(a => a.isLoading)
  const hasError = projectsError || analyses.some(a => a.error)
  const validAnalyses = analyses.filter(a => a.data && !a.error).map(a => a.data!)

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Projects Analysis Overview
          </CardTitle>
          <CardDescription>Performance metrics across your projects</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: maxProjects }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </CardContent>
      </Card>
    )
  }

  if (hasError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Projects Analysis Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load projects analysis
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  if (!validAnalyses || validAnalyses.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Projects Analysis Overview
          </CardTitle>
          <CardDescription>Performance metrics across your projects</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No projects found for analysis
          </div>
        </CardContent>
      </Card>
    )
  }

  const displayAnalyses = validAnalyses.slice(0, maxProjects)

  // Calculate overall metrics
  const totalIssues = validAnalyses.reduce((sum, analysis) => sum + analysis.total_issues, 0)
  const totalCompleted = validAnalyses.reduce((sum, analysis) => sum + analysis.completed_issues, 0)
  const totalUsers = validAnalyses.reduce((sum, analysis) => sum + analysis.total_users, 0)
  const totalTeams = validAnalyses.reduce((sum, analysis) => sum + analysis.total_teams, 0)
  const totalCritical = validAnalyses.reduce((sum, analysis) => sum + analysis.critical_issues, 0)
  const totalHighPriority = validAnalyses.reduce((sum, analysis) => sum + analysis.high_priority_issues, 0)

  const overallCompletionRate = totalIssues > 0 ? Math.round((totalCompleted / totalIssues) * 100) : 0

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'completed': return 'bg-blue-100 text-blue-800'
      case 'on hold': return 'bg-yellow-100 text-yellow-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Projects Analysis Overview
            </CardTitle>
            <CardDescription>Performance metrics across your projects</CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/projects/analysis">
              <TrendingUp className="h-4 w-4 mr-2" />
              View All
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-lg mx-auto mb-2">
              <Bug className="h-4 w-4 text-blue-600" />
            </div>
            <div className="text-lg font-semibold">{totalIssues}</div>
            <div className="text-xs text-muted-foreground">Total Issues</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-lg mx-auto mb-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
            </div>
            <div className="text-lg font-semibold">{totalCompleted}</div>
            <div className="text-xs text-muted-foreground">Completed</div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center w-8 h-8 bg-orange-100 rounded-lg mx-auto mb-2">
              <Users className="h-4 w-4 text-orange-600" />
            </div>
            <div className="text-lg font-semibold">{totalUsers}</div>
            <div className="text-xs text-muted-foreground">Total Users</div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center w-8 h-8 bg-red-100 rounded-lg mx-auto mb-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
            </div>
            <div className="text-lg font-semibold">{totalCritical + totalHighPriority}</div>
            <div className="text-xs text-muted-foreground">High Priority</div>
          </div>
        </div>

        {/* Overall Progress */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Overall Completion Rate</span>
            <span className="text-sm text-muted-foreground">{overallCompletionRate}%</span>
          </div>
          <Progress value={overallCompletionRate} className="h-2" />
        </div>

        {/* Project Cards */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium">Recent Projects</h4>
          {displayAnalyses.map((analysis) => {
            const completionRate = analysis.total_issues > 0 
              ? Math.round((analysis.completed_issues / analysis.total_issues) * 100) 
              : 0

            return (
              <div key={analysis.project_id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-medium">{analysis.project_name}</h5>
                    <p className="text-xs text-muted-foreground">
                      {analysis.organization_name} → {analysis.workspace_name}
                    </p>
                  </div>
                  <Badge className={getStatusColor(analysis.project_status)}>
                    {analysis.project_status}
                  </Badge>
                </div>

                <div className="grid grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-sm font-semibold">{analysis.total_issues}</div>
                    <div className="text-xs text-muted-foreground">Issues</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-semibold">{analysis.total_users}</div>
                    <div className="text-xs text-muted-foreground">Users</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-semibold">{analysis.total_teams}</div>
                    <div className="text-xs text-muted-foreground">Teams</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-semibold">{completionRate}%</div>
                    <div className="text-xs text-muted-foreground">Complete</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span>Progress</span>
                    <span>{completionRate}%</span>
                  </div>
                  <Progress value={completionRate} className="h-1" />
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild className="flex-1">
                    <Link href={`/projects/${analysis.project_id}/analysis`}>
                      <BarChart3 className="h-3 w-3 mr-1" />
                      View Analysis
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild className="flex-1">
                    <Link href={`/projects/${analysis.project_id}`}>
                      <Zap className="h-3 w-3 mr-1" />
                      Go to Project
                    </Link>
                  </Button>
                </div>
              </div>
            )
          })}
        </div>

        {analyses.length > maxProjects && (
          <div className="text-center">
            <Button variant="outline" asChild>
              <Link href="/projects/analysis">
                View All {analyses.length} Projects
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
