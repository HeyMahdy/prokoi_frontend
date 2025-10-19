"use client"

import useSWR from "swr"
import { fetchWithAuth } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AlertCircle, TrendingUp, User, Mail, CheckCircle, Clock, MessageSquare, Activity, Target, BarChart3, Users } from "lucide-react"
import Link from "next/link"

interface UserPerformanceData {
  user_id: number
  user_name: string
  email: string
  organization_name: string
  assigned_issues: number
  completed_issues: number
  open_issues: number
  completion_rate: number
  total_story_points_assigned: number
  completed_story_points: number
  avg_story_points_per_issue: number
  comments_made: number
  activities_logged: number
  weekly_hours: number | null
  total_hours_spent: number | null
  days_since_joined: number
}

interface UserPerformanceCardProps {
  showDetailed?: boolean
}

export function UserPerformanceCard({ showDetailed = false }: UserPerformanceCardProps) {
  const { data: userData, error, isLoading } = useSWR<UserPerformanceData[]>(
    "/api/users/performance",
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
            User Performance Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load user performance data: {error.message}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  if (!userData || userData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            User Performance Analysis
          </CardTitle>
          <CardDescription>Performance metrics across all users</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No user performance data available
          </div>
        </CardContent>
      </Card>
    )
  }

  // Group users by user_id to get unique users with aggregated data
  const uniqueUsers = userData.reduce((acc, user) => {
    if (!acc[user.user_id]) {
      acc[user.user_id] = {
        ...user,
        organizations: [user.organization_name]
      }
    } else {
      // Aggregate data for users across multiple organizations
      acc[user.user_id].assigned_issues += user.assigned_issues
      acc[user.user_id].completed_issues += user.completed_issues
      acc[user.user_id].open_issues += user.open_issues
      acc[user.user_id].total_story_points_assigned += user.total_story_points_assigned
      acc[user.user_id].completed_story_points += user.completed_story_points
      acc[user.user_id].comments_made += user.comments_made
      acc[user.user_id].activities_logged += user.activities_logged
      acc[user.user_id].organizations.push(user.organization_name)
    }
    return acc
  }, {} as Record<number, UserPerformanceData & { organizations: string[] }>)

  const users = Object.values(uniqueUsers)

  // Calculate overall metrics
  const totalUsers = users.length
  const avgCompletionRate = users.length > 0 
    ? Math.round(users.reduce((sum, user) => sum + user.completion_rate, 0) / users.length)
    : 0
  const totalIssues = users.reduce((sum, user) => sum + user.assigned_issues, 0)
  const totalCompletedIssues = users.reduce((sum, user) => sum + user.completed_issues, 0)
  const totalStoryPoints = users.reduce((sum, user) => sum + user.total_story_points_assigned, 0)
  const totalCompletedStoryPoints = users.reduce((sum, user) => sum + user.completed_story_points, 0)

  const getPerformanceColor = (completionRate: number) => {
    if (completionRate >= 80) return 'text-green-600'
    if (completionRate >= 60) return 'text-yellow-600'
    if (completionRate >= 40) return 'text-orange-600'
    return 'text-red-600'
  }

  const getPerformanceBadge = (completionRate: number) => {
    if (completionRate >= 80) return 'bg-green-100 text-green-800'
    if (completionRate >= 60) return 'bg-yellow-100 text-yellow-800'
    if (completionRate >= 40) return 'bg-orange-100 text-orange-800'
    return 'bg-red-100 text-red-800'
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              User Performance Analysis
            </CardTitle>
            <CardDescription>Performance metrics across all team members</CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/users/performance">
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
              <Users className="h-4 w-4 text-blue-600" />
            </div>
            <div className="text-lg font-semibold">{totalUsers}</div>
            <div className="text-xs text-muted-foreground">Total Users</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-lg mx-auto mb-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
            </div>
            <div className="text-lg font-semibold">{totalCompletedIssues}</div>
            <div className="text-xs text-muted-foreground">Completed Issues</div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center w-8 h-8 bg-purple-100 rounded-lg mx-auto mb-2">
              <Target className="h-4 w-4 text-purple-600" />
            </div>
            <div className="text-lg font-semibold">{totalStoryPoints}</div>
            <div className="text-xs text-muted-foreground">Total Story Points</div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center w-8 h-8 bg-orange-100 rounded-lg mx-auto mb-2">
              <TrendingUp className="h-4 w-4 text-orange-600" />
            </div>
            <div className="text-lg font-semibold">{avgCompletionRate}%</div>
            <div className="text-xs text-muted-foreground">Avg Completion</div>
          </div>
        </div>

        {/* Overall Progress */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Overall Completion Rate</span>
            <span className="text-sm text-muted-foreground">
              {totalIssues > 0 ? Math.round((totalCompletedIssues / totalIssues) * 100) : 0}%
            </span>
          </div>
          <Progress 
            value={totalIssues > 0 ? (totalCompletedIssues / totalIssues) * 100 : 0} 
            className="h-2" 
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{totalCompletedIssues} completed</span>
            <span>{totalIssues - totalCompletedIssues} remaining</span>
            <span>{totalIssues} total issues</span>
          </div>
        </div>

        {/* User Performance List */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium">Team Performance</h4>
          {users.slice(0, showDetailed ? 20 : 5).map((user, index) => {
            const completionRate = user.assigned_issues > 0 
              ? Math.round((user.completed_issues / user.assigned_issues) * 100) 
              : 0

            return (
              <div key={`user-${user.user_id}-${index}`} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.user_name}`} />
                      <AvatarFallback>{getInitials(user.user_name)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h5 className="font-medium">{user.user_name}</h5>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <Badge className={getPerformanceBadge(completionRate)}>
                    {completionRate}% Complete
                  </Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-sm font-semibold">{user.assigned_issues}</div>
                    <div className="text-xs text-muted-foreground">Assigned</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-semibold">{user.completed_issues}</div>
                    <div className="text-xs text-muted-foreground">Completed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-semibold">{user.total_story_points_assigned}</div>
                    <div className="text-xs text-muted-foreground">Story Points</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-semibold">{user.comments_made}</div>
                    <div className="text-xs text-muted-foreground">Comments</div>
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
                    <Activity className="h-3 w-3" />
                    {user.activities_logged} activities
                  </span>
                  <span>{user.organizations.length} organization(s)</span>
                </div>

                {showDetailed && (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild className="flex-1">
                      <Link href={`/users/${user.user_id}/profile`}>
                        <User className="h-3 w-3 mr-1" />
                        View Profile
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild className="flex-1">
                      <Link href="/users/performance">
                        <BarChart3 className="h-3 w-3 mr-1" />
                        View All Stats
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {users.length > (showDetailed ? 20 : 5) && (
          <div className="text-center">
            <Button variant="outline" asChild>
              <Link href="/users/performance">
                View All {users.length} Users
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
