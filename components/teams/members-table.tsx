"use client"

import useSWR from "swr"
import { fetchWithAuth } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle } from "lucide-react"

interface TeamMember {
  id: number
  team_id: number
  user_id: number
}

interface User {
  id: number
  name: string
  email: string
}

interface MembersTableProps {
  teamId: number | null
}

export function MembersTable({ teamId }: MembersTableProps) {
  const { data: membersData, error: membersError, isLoading: membersLoading } = useSWR<TeamMember[]>(
    teamId ? `/api/teams/${teamId}/members` : null,
    fetchWithAuth,
  )

  // Fetch users data to display user names
  const { data: usersData } = useSWR<User[]>("/api/users", fetchWithAuth)

  // Create a map for quick user lookup
  const userMap = usersData?.reduce((acc, user) => {
    acc[user.id] = user
    return acc
  }, {} as Record<number, User>)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Members</CardTitle>
        <CardDescription>All members in the selected team</CardDescription>
      </CardHeader>
      <CardContent>
        {membersError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{membersError.message || "Failed to load team members"}</AlertDescription>
          </Alert>
        )}

        {membersLoading && (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        )}

        {membersData && !membersLoading && (
          <>
            {membersData.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No members found in this team</p>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Member ID</TableHead>
                      <TableHead>User Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>User ID</TableHead>
                      <TableHead>Team ID</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {membersData.map((member) => {
                      const user = userMap?.[member.user_id]
                      return (
                        <TableRow key={member.id}>
                          <TableCell className="font-medium">{member.id}</TableCell>
                          <TableCell>{user?.name || "Loading..."}</TableCell>
                          <TableCell>{user?.email || "Loading..."}</TableCell>
                          <TableCell>{member.user_id}</TableCell>
                          <TableCell>{member.team_id}</TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </>
        )}

        {!teamId && !membersLoading && (
          <p className="text-sm text-muted-foreground text-center py-8">Please select a team to view members</p>
        )}
      </CardContent>
    </Card>
  )
}
