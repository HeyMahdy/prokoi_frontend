"use client"

import useSWR from "swr"
import { fetchWithAuth } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { AlertCircle, Loader2 } from "lucide-react"

interface Team {
  id: number
  organization_id: number
  name: string
}

interface TeamsTableProps {
  orgId: number | null
  onTeamSelect?: (teamId: number) => void
}

export function TeamsTable({ orgId, onTeamSelect }: TeamsTableProps) {
  const { data, error, isLoading } = useSWR<Team[]>(
    orgId ? `/api/organizations/${orgId}/teams` : null,
    fetchWithAuth,
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Organization Teams</CardTitle>
        <CardDescription>All teams for the selected organization</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error.message || "Failed to load teams"}</AlertDescription>
          </Alert>
        )}

        {isLoading && (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        )}

        {data && !isLoading && (
          <>
            {data.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No teams found for this organization</p>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Organization ID</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.map((team) => (
                      <TableRow key={team.id}>
                        <TableCell className="font-medium">{team.id}</TableCell>
                        <TableCell>{team.name}</TableCell>
                        <TableCell>{team.organization_id}</TableCell>
                        <TableCell>
                          {onTeamSelect && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onTeamSelect(team.id)}
                            >
                              Manage Members
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </>
        )}

        {!orgId && !isLoading && (
          <p className="text-sm text-muted-foreground text-center py-8">Please select an organization to view teams</p>
        )}
      </CardContent>
    </Card>
  )
}
