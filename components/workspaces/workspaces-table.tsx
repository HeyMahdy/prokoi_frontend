"use client"

import useSWR from "swr"
import { fetchWithAuth } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { AlertCircle, User } from "lucide-react"

interface Workspace {
  id: number
  name: string
  user_id: number
  organization_id: number
  created_at: string
  updated_at: string
}

interface WorkspacesTableProps {
  orgId: number
  onWorkspaceSelect?: (workspaceId: number) => void
}

export function WorkspacesTable({ orgId, onWorkspaceSelect }: WorkspacesTableProps) {
  const { data, error, isLoading } = useSWR<Workspace[]>(
    `/api/organizations/${orgId}/workspaces`,
    fetchWithAuth,
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Organization Workspaces</CardTitle>
        <CardDescription>All workspaces for this organization</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error.message || "Failed to load workspaces"}</AlertDescription>
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
              <p className="text-sm text-muted-foreground text-center py-8">No workspaces found for this organization</p>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Created At</TableHead>
                      <TableHead>Updated At</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.map((workspace) => (
                      <TableRow key={workspace.id}>
                        <TableCell className="font-medium">{workspace.name}</TableCell>
                        <TableCell>{new Date(workspace.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>{new Date(workspace.updated_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          {onWorkspaceSelect && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onWorkspaceSelect(workspace.id)}
                            >
                              Manage Projects
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
      </CardContent>
    </Card>
  )
}
