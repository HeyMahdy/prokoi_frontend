"use client"

import useSWR from "swr"
import { fetchWithAuth } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { AlertCircle, Users, Users2, Bug, CheckCircle, Clock, Zap, TrendingUp, MessageSquare, Paperclip, Activity, Target, BarChart3 } from "lucide-react"
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

interface ProjectAnalysisCardProps {
  projectId: number
  showDetailed?: boolean
}

export function ProjectAnalysisCard({ projectId, showDetailed = false }: ProjectAnalysisCardProps) {
  const { data: analysis, error, isLoading } = useSWR<ProjectAnalysisData>(
    `/api/projects/${projectId}/analysis/depth`,
    fetchWithAuth
  )

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Project Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load project analysis: {error.message}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  if (!analysis) return null

  const completionRate = analysis.total_issues > 0 
    ? Math.round((analysis.completed_issues / analysis.total_issues) * 100) 
    : 0

  const progressRate = analysis.total_issues > 0 
    ? Math.round(((analysis.completed_issues + analysis.in_progress_issues) / analysis.total_issues) * 100) 
    : 0

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
        {/* Progress Overview */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Overall Progress</span>
            <span className="text-sm text-muted-foreground">{progressRate}%</span>
          </div>
          <Progress value={progressRate} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{analysis.completed_issues} completed</span>
            <span>{analysis.in_progress_issues} in progress</span>
            <span>{analysis.open_issues} open</span>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-lg mx-auto mb-2">
              <Bug className="h-4 w-4 text-blue-600" />
            </div>
            <div className="text-lg font-semibold">{analysis.total_issues}</div>
            <div className="text-xs text-muted-foreground">Total Issues</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-lg mx-auto mb-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
            </div>
            <div className="text-lg font-semibold">{analysis.completed_issues}</div>
            <div className="text-xs text-muted-foreground">Completed</div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center w-8 h-8 bg-orange-100 rounded-lg mx-auto mb-2">
              <Users className="h-4 w-4 text-orange-600" />
            </div>
            <div className="text-lg font-semibold">{analysis.total_users}</div>
            <div className="text-xs text-muted-foreground">Users</div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center w-8 h-8 bg-purple-100 rounded-lg mx-auto mb-2">
              <Users2 className="h-4 w-4 text-purple-600" />
            </div>
            <div className="text-lg font-semibold">{analysis.total_teams}</div>
            <div className="text-xs text-muted-foreground">Teams</div>
          </div>
        </div>

        {/* Priority Issues */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Priority Issues
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
              <span className="text-sm font-medium">Critical</span>
              <Badge variant="destructive">{analysis.critical_issues}</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
              <span className="text-sm font-medium">High Priority</span>
              <Badge className="bg-orange-100 text-orange-800">{analysis.high_priority_issues}</Badge>
            </div>
          </div>
        </div>

        {/* Sprints & Velocity */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Sprint Metrics
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-lg font-semibold">{analysis.total_sprints}</div>
              <div className="text-xs text-muted-foreground">Total Sprints</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-lg font-semibold">{analysis.avg_team_velocity}</div>
              <div className="text-xs text-muted-foreground">Avg Velocity</div>
            </div>
          </div>
        </div>

        {/* Activity & Engagement */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Activity & Engagement
          </h4>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-2 bg-gray-50 rounded-lg">
              <div className="text-sm font-semibold">{analysis.total_comments}</div>
              <div className="text-xs text-muted-foreground">Comments</div>
            </div>
            <div className="text-center p-2 bg-gray-50 rounded-lg">
              <div className="text-sm font-semibold">{analysis.total_attachments}</div>
              <div className="text-xs text-muted-foreground">Attachments</div>
            </div>
            <div className="text-center p-2 bg-gray-50 rounded-lg">
              <div className="text-sm font-semibold">{analysis.total_hours_logged}</div>
              <div className="text-xs text-muted-foreground">Hours Logged</div>
            </div>
          </div>
        </div>

        {showDetailed && (
          <>
            {/* Story Points */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Target className="h-4 w-4" />
                Story Points
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-lg font-semibold">{analysis.total_story_points}</div>
                  <div className="text-xs text-muted-foreground">Total Story Points</div>
                </div>
                <div className="text-center p-3 bg-indigo-50 rounded-lg">
                  <div className="text-lg font-semibold">{analysis.avg_story_points}</div>
                  <div className="text-xs text-muted-foreground">Avg per Issue</div>
                </div>
              </div>
            </div>

            {/* Team Details */}
            {analysis.project_teams.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium">Project Teams</h4>
                <div className="space-y-2">
                  {analysis.project_teams.slice(0, 3).map((team: any, index: number) => (
                    <div key={team.id || `team-${index}`} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                      <span className="text-sm">{team.name}</span>
                      <Badge variant="outline">{team.member_count || 0} members</Badge>
                    </div>
                  ))}
                  {analysis.project_teams.length > 3 && (
                    <div className="text-xs text-muted-foreground text-center">
                      +{analysis.project_teams.length - 3} more teams
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {/* Action Button */}
        <div className="pt-4 border-t">
          <Button asChild className="w-full">
            <Link href={`/projects/${projectId}/analysis`}>
              <TrendingUp className="h-4 w-4 mr-2" />
              View Detailed Analysis
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
