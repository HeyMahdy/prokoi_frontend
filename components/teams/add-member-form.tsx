"use client"

import type React from "react"
import { useState, useMemo } from "react"
import useSWR from "swr"
import { fetchWithAuth } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { mutate } from "swr"

interface User {
  id: number
  name: string
  email: string
}

interface TeamMember {
  id: number
  team_id: number
  user_id: number
}

interface AddMemberFormProps {
  teamId: number | null
  orgId: number | null
}

export function AddMemberForm({ teamId, orgId }: AddMemberFormProps) {
  const [userId, setUserId] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const { toast } = useToast()

  // Fetch organization users
  const { data: orgUsersData } = useSWR<User[]>(
    orgId ? `/api/organizations/${orgId}/users` : null,
    fetchWithAuth,
  )

  // Fetch existing team members
  const { data: teamMembersData } = useSWR<TeamMember[]>(
    teamId ? `/api/teams/${teamId}/members` : null,
    fetchWithAuth,
  )

  // Filter available users (organization users who are not already team members)
  const availableUsers = useMemo(() => {
    if (!orgUsersData || !teamMembersData) return []
    
    const existingMemberIds = new Set(teamMembersData.map(member => member.user_id))
    return orgUsersData.filter(user => !existingMemberIds.has(user.id))
  }, [orgUsersData, teamMembersData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    if (!teamId) {
      setError("Please select a team first")
      setIsLoading(false)
      return
    }

    try {
      const params = new URLSearchParams({
        user_id: userId,
      })

      const response = await fetchWithAuth(`/api/teams/${teamId}/members?${params.toString()}`, {
        method: "POST",
      })

      toast({
        title: "Success",
        description: `Member added successfully! Member ID: ${response.id}`,
      })

      setUserId("")
      // Revalidate members and organization users
      mutate(`/api/teams/${teamId}/members`)
      if (orgId) mutate(`/api/organizations/${orgId}/users`)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to add member"
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Team Member</CardTitle>
        <CardDescription>Add a user to the selected team</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="user">User</Label>
            <Select value={userId} onValueChange={setUserId} disabled={isLoading || !teamId}>
              <SelectTrigger id="user">
                <SelectValue placeholder={teamId ? "Select a user" : "Please select a team first"} />
              </SelectTrigger>
              <SelectContent>
                {availableUsers.length === 0 ? (
                  <SelectItem value="no-users" disabled>
                    No available users in this organization
                  </SelectItem>
                ) : (
                  availableUsers.map((user) => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                      {user.name} ({user.email})
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" disabled={isLoading || !userId || !teamId}>
            {isLoading ? "Adding..." : "Add Member"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
