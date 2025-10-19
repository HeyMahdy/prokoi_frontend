"use client"

import useSWR from "swr"
import { fetchWithAuth } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { AlertCircle, TrendingUp, Target, Clock, CheckCircle, Zap, Calendar, BarChart3 } from "lucide-react"
import Link from "next/link"

interface SprintVelocityData {
  sprint_id: number
  sprint_name: string
  project_name: string
  start_date: string
  end_date: string
  status: string
  velocity_target: number
  issues_in_sprint: number
  total_story_points: number
  completed_issues: number
  completed_story_points: number
  avg_hours_per_point: number
  velocity_achievement_percentage: number
  sprint_duration_days: number
  sprint_status: string
}

interface SprintVelocityCardProps {
  showDetailed?: boolean
}

export function SprintVelocityCard({ showDetailed = false }: SprintVelocityCardProps) {
  const { data: sprintData, error, isLoading } = useSWR<SprintVelocityData[]>(
    "/api/sprints/velocity",
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
            <TrendingUp className="h-5 w-5" />
            Sprint Velocity Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load sprint velocity data: {error.message}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  if (!sprintData || sprintData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Sprint Velocity Analysis
          </CardTitle>
          <CardDescription>Velocity metrics across all sprints</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No sprint data available
          </div>
        </CardContent>
      </Card>
    )
  }

  // Calculate overall metrics
  const totalSprints = sprintData.length
  const avgVelocityAchievement = sprintData.length > 0 
    ? Math.round(sprintData.reduce((sum, sprint) => sum + sprint.velocity_achievement_percentage, 0) / sprintData.length)
    : 0
  const totalStoryPoints = sprintData.reduce((sum, sprint) => sum + sprint.total_story_points, 0)
  const completedStoryPoints = sprintData.reduce((sum, sprint) => sum + sprint.completed_story_points, 0)
  const activeSprints = sprintData.filter(sprint => sprint.sprint_status === 'active').length
  const avgHoursPerPoint = sprintData.length > 0 
    ? Math.round(sprintData.reduce((sum, sprint) => sum + sprint.avg_hours_per_point, 0) / sprintData.length)
    : 0

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'completed': return 'bg-blue-100 text-blue-800'
      case 'planning': return 'bg-yellow-100 text-yellow-800'
      case 'review': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getAchievementColor = (percentage: number) => {
    if (percentage >= 100) return 'text-green-600'
    if (percentage >= 80) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Sprint Velocity Analysis
            </CardTitle>
            <CardDescription>Performance metrics across all sprints</CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/sprints/velocity">
              <BarChart3 className="h-4 w-4 mr-2" />
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
              <Target className="h-4 w-4 text-blue-600" />
            </div>
            <div className="text-lg font-semibold">{totalSprints}</div>
            <div className="text-xs text-muted-foreground">Total Sprints</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-lg mx-auto mb-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
            </div>
            <div className="text-lg font-semibold">{activeSprints}</div>
            <div className="text-xs text-muted-foreground">Active Sprints</div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center w-8 h-8 bg-purple-100 rounded-lg mx-auto mb-2">
              <Zap className="h-4 w-4 text-purple-600" />
            </div>
            <div className="text-lg font-semibold">{avgVelocityAchievement}%</div>
            <div className="text-xs text-muted-foreground">Avg Achievement</div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center w-8 h-8 bg-orange-100 rounded-lg mx-auto mb-2">
              <Clock className="h-4 w-4 text-orange-600" />
            </div>
            <div className="text-lg font-semibold">{avgHoursPerPoint}</div>
            <div className="text-xs text-muted-foreground">Avg Hours/Point</div>
          </div>
        </div>

        {/* Story Points Progress */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Story Points Progress</span>
            <span className="text-sm text-muted-foreground">
              {totalStoryPoints > 0 ? Math.round((completedStoryPoints / totalStoryPoints) * 100) : 0}%
            </span>
          </div>
          <Progress 
            value={totalStoryPoints > 0 ? (completedStoryPoints / totalStoryPoints) * 100 : 0} 
            className="h-2" 
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{completedStoryPoints} completed</span>
            <span>{totalStoryPoints - completedStoryPoints} remaining</span>
            <span>{totalStoryPoints} total</span>
          </div>
        </div>

        {/* Recent Sprints */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium">Recent Sprints</h4>
          {sprintData.slice(0, showDetailed ? 10 : 3).map((sprint, index) => {
            const achievementRate = sprint.velocity_achievement_percentage
            const completionRate = sprint.total_story_points > 0 
              ? Math.round((sprint.completed_story_points / sprint.total_story_points) * 100) 
              : 0

            return (
              <div key={`sprint-${sprint.sprint_id}-${index}`} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-medium">{sprint.sprint_name}</h5>
                    <p className="text-xs text-muted-foreground">{sprint.project_name}</p>
                  </div>
                  <Badge className={getStatusColor(sprint.sprint_status)}>
                    {sprint.sprint_status}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-sm font-semibold">{sprint.velocity_target}</div>
                    <div className="text-xs text-muted-foreground">Target</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-semibold">{sprint.completed_story_points}</div>
                    <div className="text-xs text-muted-foreground">Completed</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-sm font-semibold ${getAchievementColor(achievementRate)}`}>
                      {achievementRate}%
                    </div>
                    <div className="text-xs text-muted-foreground">Achievement</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-semibold">{sprint.sprint_duration_days}</div>
                    <div className="text-xs text-muted-foreground">Days</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span>Completion Progress</span>
                    <span>{completionRate}%</span>
                  </div>
                  <Progress value={completionRate} className="h-1" />
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(sprint.start_date).toLocaleDateString()} - {new Date(sprint.end_date).toLocaleDateString()}
                  </span>
                  <span>{sprint.issues_in_sprint} issues</span>
                </div>

                {showDetailed && (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild className="flex-1">
                      <Link href={`/sprints/${sprint.sprint_id}`}>
                        <BarChart3 className="h-3 w-3 mr-1" />
                        View Sprint
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild className="flex-1">
                      <Link href={`/projects/${sprint.sprint_id}`}>
                        <Zap className="h-3 w-3 mr-1" />
                        Go to Project
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {sprintData.length > (showDetailed ? 10 : 3) && (
          <div className="text-center">
            <Button variant="outline" asChild>
              <Link href="/sprints/velocity">
                View All {sprintData.length} Sprints
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
