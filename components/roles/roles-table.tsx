"use client"

import useSWR from "swr"
import { fetchWithAuth } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle } from "lucide-react"

interface Role {
  id: number
  name: string
  organization_id: number
}

interface RolesTableProps {
  orgId: number
}

export function RolesTable({ orgId }: RolesTableProps) {
  const { data, error, isLoading } = useSWR<{ message: string; roles: Role[] }>(
    orgId ? `/api/roles/${orgId}/roles` : null,
    fetchWithAuth,
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Roles</CardTitle>
        <CardDescription>All roles for the selected organization</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error.message || "Failed to load roles"}</AlertDescription>
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
            {data.roles.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No roles found for this organization</p>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Organization ID</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.roles.map((role) => (
                      <TableRow key={role.id}>
                        <TableCell className="font-medium">{role.id}</TableCell>
                        <TableCell>{role.name}</TableCell>
                        <TableCell>{role.organization_id}</TableCell>
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
