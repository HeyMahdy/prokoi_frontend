"use client"

import { useState, useMemo } from "react"
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

  // Fetch project team members
  const { data: usersData, error: usersError, isLoading: usersLoading } = useSWR<any>(
    `/api/projects/${projectId}/team-members`,
    (url) => fetchWithAuth(url)
  )

  // Normalize team members data to extract user information and deduplicate
  const users: User[] = useMemo(() => {
    if (!usersData) {
      return []
    }
    
    let members: any[] = []
    
    // Handle direct array response (API returns array of team members)
    if (Array.isArray(usersData)) {
      members = usersData
    }
    // Handle wrapped responses
    else if (usersData.items && Array.isArray(usersData.items)) {
      members = usersData.items
    }
    else if (usersData.data && Array.isArray(usersData.data)) {
      members = usersData.data
    }
    
    console.log("Raw members data:", members)
    
    // Map to user objects and deduplicate by user_id
    const userMap = new Map()
    
    members.forEach((member: any) => {
      if (member.user_id) {
        userMap.set(member.user_id, {
          id: member.user_id,
          name: member.user_name || `User ${member.user_id}`,
          email: member.user_email || ''
        })
      }
    })
    
    const result = Array.from(userMap.values())
    console.log("Deduplicated users:", result)
    console.log("User IDs:", result.map(u => u.id))
    
    return result
  }, [usersData])

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
        headers: { "Content-Type": "application/json" },
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
          <CardDescription>Loading team members...</CardDescription>
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
          <CardDescription>Failed to load team members</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {usersError.message || "Failed to load project team members. Please try again."}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  if (!usersLoading && users.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Assign Issue</CardTitle>
          <CardDescription>No team members available for assignment</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No team members found for this project. Please ensure teams are assigned to this project first.
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
              {users?.map((user, index) => (
                <SelectItem key={`assign-user-${user.id}-${index}`} value={user.id.toString()}>
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
