"use client"

import { useState } from "react"
import useSWR from "swr"
import { fetchWithAuth } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle } from "lucide-react"

interface Organization {
  id: number
  name: string
}

interface RolePermission {
  name: string
  permissions: Array<{ name: string }>
}

export function RolePermissionsView() {
  const [orgId, setOrgId] = useState<string>("")

  const { data: orgsData } = useSWR<Organization[]>("/api/organizations/get", fetchWithAuth)

  const { data, error, isLoading } = useSWR<{ message: string; permissions: RolePermission[] }>(
    orgId ? `/api/roles/${orgId}/permissions` : null,
    fetchWithAuth,
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>View Role Permissions</CardTitle>
        <CardDescription>See all roles and their assigned permissions for an organization</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="org-view">Organization</Label>
          <Select value={orgId} onValueChange={setOrgId}>
            <SelectTrigger id="org-view">
              <SelectValue placeholder="Select an organization" />
            </SelectTrigger>
            <SelectContent>
              {orgsData?.map((org) => (
                <SelectItem key={org.id} value={org.id.toString()}>
                  {org.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error.message || "Failed to load role permissions"}</AlertDescription>
          </Alert>
        )}

        {isLoading && (
          <div className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        )}

        {data && !isLoading && (
          <div className="space-y-4">
            {data.permissions.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No roles found for this organization</p>
            ) : (
              data.permissions.map((rolePermission, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-lg">{rolePermission.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {rolePermission.permissions.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No permissions assigned</p>
                      ) : (
                        rolePermission.permissions.map((permission, permIndex) => (
                          <Badge key={permIndex} variant="secondary">
                            {permission.name}
                          </Badge>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
