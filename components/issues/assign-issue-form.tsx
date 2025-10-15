"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, User, UserX } from "lucide-react"
import { fetchWithAuth } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import useSWR from "swr"

interface User {
  id: number
  name: string
  email: string
}

interface AssignIssueFormProps {
  issueId: number
  projectId: number
  onSuccess: () => void
  currentAssignment?: {
    assigned_to: number
    assigned_user: {
      id: number
      name: string
      email: string
    }
  } | null
}

export default function AssignIssueForm({ 
  issueId, 
  projectId, 
  onSuccess, 
  currentAssignment 
}: AssignIssueFormProps) {
  const [selectedUserId, setSelectedUserId] = useState<string>(
    currentAssignment?.assigned_to.toString() || ""
  )
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  // Fetch project users (assuming we have an endpoint for this)
  const { data: users, error: usersError, isLoading: usersLoading } = useSWR<User[]>(
    `/api/projects/${projectId}/users`,
    (url) => fetchWithAuth(url)
  )

  const handleAssign = async () => {
    if (!selectedUserId) {
      setError("Please select a user to assign")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      await fetchWithAuth(`/api/issues/${issueId}/assign`, {
        method: "POST",
        body: JSON.stringify({
          assigned_to: parseInt(selectedUserId)
        })
      })

      toast({
        title: "Success",
        description: "Issue assigned successfully"
      })

      onSuccess()
    } catch (err: any) {
      setError(err.message || "Failed to assign issue")
      toast({
        title: "Error",
        description: err.message || "Failed to assign issue",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleUnassign = async () => {
    setIsLoading(true)
    setError(null)

    try {
      await fetchWithAuth(`/api/issues/${issueId}/unassign`, {
        method: "POST"
      })

      toast({
        title: "Success",
        description: "Issue unassigned successfully"
      })

      setSelectedUserId("")
      onSuccess()
    } catch (err: any) {
      setError(err.message || "Failed to unassign issue")
      toast({
        title: "Error",
        description: err.message || "Failed to unassign issue",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (usersLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Assign Issue</CardTitle>
          <CardDescription>Loading users...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="h-10 bg-muted animate-pulse rounded" />
            <div className="h-10 bg-muted animate-pulse rounded" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (usersError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Assign Issue</CardTitle>
          <CardDescription>Failed to load users</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {usersError.message || "Failed to load users"}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Assign Issue
        </CardTitle>
        <CardDescription>
          {currentAssignment 
            ? `Currently assigned to ${currentAssignment.assigned_user.name}` 
            : "Select a user to assign this issue to"
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <label className="text-sm font-medium">Assign to user</label>
          <Select value={selectedUserId} onValueChange={setSelectedUserId}>
            <SelectTrigger>
              <SelectValue placeholder="Select a user..." />
            </SelectTrigger>
            <SelectContent>
              {users?.map((user) => (
                <SelectItem key={user.id} value={user.id.toString()}>
                  <div className="flex flex-col">
                    <span className="font-medium">{user.name}</span>
                    <span className="text-xs text-muted-foreground">{user.email}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={handleAssign} 
            disabled={isLoading || !selectedUserId}
            className="flex-1"
          >
            <User className="h-4 w-4 mr-2" />
            {currentAssignment ? "Reassign" : "Assign"}
          </Button>
          
          {currentAssignment && (
            <Button 
              onClick={handleUnassign} 
              disabled={isLoading}
              variant="outline"
            >
              <UserX className="h-4 w-4 mr-2" />
              Unassign
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
