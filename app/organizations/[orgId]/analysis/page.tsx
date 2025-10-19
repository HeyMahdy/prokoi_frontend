"use client"

import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import useSWR from "swr"
import { fetchWithAuth } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, BarChart3, TrendingUp, Users, Bug, CheckCircle, Zap, Filter, Building2, AlertCircle } from "lucide-react"
import Link from "next/link"

interface Project {
  id: number
  name: string
  workspace_id: number
  organization_id: number
  created_at: string
  updated_at: string
}

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

export default function OrganizationAnalysisPage() {
  const params = useParams() as { orgId: string }
  const router = useRouter()
  const orgId = Number(params.orgId)
  const [selectedProjectIds, setSelectedProjectIds] = useState<number[]>([])
  const [analyses, setAnalyses] = useState<ProjectAnalysisData[]>([])
  const [loadingAnalyses, setLoadingAnalyses] = useState<Set<number>>(new Set())

  // Fetch organization projects
  const { data: projects, error: projectsError, isLoading: projectsLoading } = useSWR<Project[]>(
    orgId ? `/api/organizations/${orgId}/projects` : null,
    fetchWithAuth
  )

  // Auto-select first 5 projects when projects load
  useEffect(() => {
    if (projects && projects.length > 0 && selectedProjectIds.length === 0) {
      setSelectedProjectIds(projects.slice(0, 5).map(p => p.id))
    }
  }, [projects, selectedProjectIds.length])

  // Fetch analysis for selected projects
  const fetchProjectAnalysis = async (projectId: number) => {
    if (loadingAnalyses.has(projectId)) return

    setLoadingAnalyses(prev => new Set(prev).add(projectId))
    
    try {
      const analysis = await fetchWithAuth(`/api/projects/${projectId}/analysis/depth`)
      setAnalyses(prev => {
        const filtered = prev.filter(a => a.project_id !== projectId)
        return [...filtered, analysis]
      })
    } catch (error) {
      console.error(`Failed to fetch analysis for project ${projectId}:`, error)
    } finally {
      setLoadingAnalyses(prev => {
        const newSet = new Set(prev)
        newSet.delete(projectId)
        return newSet
      })
    }
  }

  // Fetch analyses when selected projects change
  useEffect(() => {
    selectedProjectIds.forEach(projectId => {
      if (!analyses.find(a => a.project_id === projectId)) {
        fetchProjectAnalysis(projectId)
      }
    })

    // Remove analyses for unselected projects
    setAnalyses(prev => prev.filter(a => selectedProjectIds.includes(a.project_id)))
  }, [selectedProjectIds])

  const handleProjectToggle = (projectId: number) => {
    setSelectedProjectIds(prev => 
      prev.includes(projectId) 
        ? prev.filter(id => id !== projectId)
        : [...prev, projectId]
    )
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'completed': return 'bg-blue-100 text-blue-800'
      case 'on hold': return 'bg-yellow-100 text-yellow-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Calculate overall metrics
  const overallMetrics = analyses.length > 0 ? {
    totalProjects: analyses.length,
    totalIssues: analyses.reduce((sum, analysis) => sum + analysis.total_issues, 0),
    totalCompleted: analyses.reduce((sum, analysis) => sum + analysis.completed_issues, 0),
    totalUsers: analyses.reduce((sum, analysis) => sum + analysis.total_users, 0),
    totalTeams: analyses.reduce((sum, analysis) => sum + analysis.total_teams, 0),
    totalCritical: analyses.reduce((sum, analysis) => sum + analysis.critical_issues, 0),
    totalHighPriority: analyses.reduce((sum, analysis) => sum + analysis.high_priority_issues, 0),
    totalStoryPoints: analyses.reduce((sum, analysis) => sum + analysis.total_story_points, 0),
    avgVelocity: analyses.length > 0 ? Math.round(analyses.reduce((sum, analysis) => sum + analysis.avg_team_velocity, 0) / analyses.length) : 0
  } : null

  const overallCompletionRate = overallMetrics && overallMetrics.totalIssues > 0 
    ? Math.round((overallMetrics.totalCompleted / overallMetrics.totalIssues) * 100) 
    : 0

  return (
    <div className="container mx-auto px-6 py-8 space-y-8">
      <div className="flex items-center gap-3">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="flex items-center gap-2">
          <Building2 className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Organization Analysis</h1>
            <p className="text-sm text-muted-foreground">Project performance and metrics</p>
          </div>
        </div>
      </div>

      {/* Project Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Select Projects for Analysis
          </CardTitle>
          <CardDescription>Choose which projects to include in the analysis</CardDescription>
        </CardHeader>
        <CardContent>
          {projectsLoading && (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          )}

          {projectsError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Failed to load projects: {projectsError.message}
              </AlertDescription>
            </Alert>
          )}

          {projects && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedProjectIds.includes(project.id)
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => handleProjectToggle(project.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Checkbox 
                        checked={selectedProjectIds.includes(project.id)}
                        onChange={() => handleProjectToggle(project.id)}
                      />
                      <div>
                        <h4 className="font-medium">{project.name}</h4>
                        <p className="text-xs text-muted-foreground">ID: {project.id}</p>
                      </div>
                    </div>
                    {loadingAnalyses.has(project.id) && (
                      <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {selectedProjectIds.length > 0 && (
            <div className="mt-4 text-sm text-muted-foreground">
              {selectedProjectIds.length} project(s) selected for analysis
            </div>
          )}
        </CardContent>
      </Card>

      {/* Overall Metrics */}
      {overallMetrics && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Overall Metrics
            </CardTitle>
            <CardDescription>Aggregated metrics across all selected projects</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Progress Overview */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Overall Completion Rate</span>
                <span className="text-sm text-muted-foreground">{overallCompletionRate}%</span>
              </div>
              <Progress value={overallCompletionRate} className="h-2" />
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-lg mx-auto mb-2">
                  <BarChart3 className="h-4 w-4 text-blue-600" />
                </div>
                <div className="text-lg font-semibold">{overallMetrics.totalProjects}</div>
                <div className="text-xs text-muted-foreground">Projects</div>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-lg mx-auto mb-2">
                  <Bug className="h-4 w-4 text-blue-600" />
                </div>
                <div className="text-lg font-semibold">{overallMetrics.totalIssues}</div>
                <div className="text-xs text-muted-foreground">Total Issues</div>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-lg mx-auto mb-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <div className="text-lg font-semibold">{overallMetrics.totalCompleted}</div>
                <div className="text-xs text-muted-foreground">Completed</div>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center w-8 h-8 bg-orange-100 rounded-lg mx-auto mb-2">
                  <Users className="h-4 w-4 text-orange-600" />
                </div>
                <div className="text-lg font-semibold">{overallMetrics.totalUsers}</div>
                <div className="text-xs text-muted-foreground">Total Users</div>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center w-8 h-8 bg-purple-100 rounded-lg mx-auto mb-2">
                  <Users className="h-4 w-4 text-purple-600" />
                </div>
                <div className="text-lg font-semibold">{overallMetrics.totalTeams}</div>
                <div className="text-xs text-muted-foreground">Total Teams</div>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center w-8 h-8 bg-red-100 rounded-lg mx-auto mb-2">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                </div>
                <div className="text-lg font-semibold">{overallMetrics.totalCritical + overallMetrics.totalHighPriority}</div>
                <div className="text-xs text-muted-foreground">High Priority</div>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center w-8 h-8 bg-indigo-100 rounded-lg mx-auto mb-2">
                  <Zap className="h-4 w-4 text-indigo-600" />
                </div>
                <div className="text-lg font-semibold">{overallMetrics.avgVelocity}</div>
                <div className="text-xs text-muted-foreground">Avg Velocity</div>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center w-8 h-8 bg-cyan-100 rounded-lg mx-auto mb-2">
                  <TrendingUp className="h-4 w-4 text-cyan-600" />
                </div>
                <div className="text-lg font-semibold">{overallMetrics.totalStoryPoints}</div>
                <div className="text-xs text-muted-foreground">Story Points</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Individual Project Analysis */}
      {analyses.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Individual Project Analysis</h2>
          {analyses.map((analysis) => {
            const completionRate = analysis.total_issues > 0 
              ? Math.round((analysis.completed_issues / analysis.total_issues) * 100) 
              : 0

            return (
              <Card key={analysis.project_id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        {analysis.project_name}
                      </CardTitle>
                      <CardDescription>
                        {analysis.organization_name} → {analysis.workspace_name}
                      </CardDescription>
                    </div>
                    <Badge className={getStatusColor(analysis.project_status)}>
                      {analysis.project_status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Progress */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Project Progress</span>
                      <span className="text-sm text-muted-foreground">{completionRate}%</span>
                    </div>
                    <Progress value={completionRate} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{analysis.completed_issues} completed</span>
                      <span>{analysis.in_progress_issues} in progress</span>
                      <span>{analysis.open_issues} open</span>
                    </div>
                  </div>

                  {/* Metrics Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-lg font-semibold">{analysis.total_issues}</div>
                      <div className="text-xs text-muted-foreground">Total Issues</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-lg font-semibold">{analysis.total_users}</div>
                      <div className="text-xs text-muted-foreground">Users</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <div className="text-lg font-semibold">{analysis.total_teams}</div>
                      <div className="text-xs text-muted-foreground">Teams</div>
                    </div>
                    <div className="text-center p-3 bg-orange-50 rounded-lg">
                      <div className="text-lg font-semibold">{analysis.avg_team_velocity}</div>
                      <div className="text-xs text-muted-foreground">Avg Velocity</div>
                    </div>
                  </div>

                  {/* Priority Issues */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                      <span className="text-sm font-medium">Critical Issues</span>
                      <Badge variant="destructive">{analysis.critical_issues}</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                      <span className="text-sm font-medium">High Priority</span>
                      <Badge className="bg-orange-100 text-orange-800">{analysis.high_priority_issues}</Badge>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild className="flex-1">
                      <Link href={`/projects/${analysis.project_id}/analysis`}>
                        <BarChart3 className="h-3 w-3 mr-1" />
                        Detailed Analysis
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild className="flex-1">
                      <Link href={`/projects/${analysis.project_id}`}>
                        <Zap className="h-3 w-3 mr-1" />
                        Go to Project
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {selectedProjectIds.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Projects Selected</h3>
            <p className="text-muted-foreground">Select projects above to view their analysis</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
