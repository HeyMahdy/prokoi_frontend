"use client"

import useSWR from "swr"
import { fetchWithAuth } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle } from "lucide-react"

interface Permission {
  id: number
  name: string
}

export function PermissionsList() {
  const { data, error, isLoading } = useSWR<{ message: string; permissions: Permission[] }>(
    "/api/roles/permissions",
    fetchWithAuth,
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Available Permissions</CardTitle>
        <CardDescription>All permissions that can be assigned to roles</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error.message || "Failed to load permissions"}</AlertDescription>
          </Alert>
        )}

        {isLoading && (
          <div className="space-y-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        )}

        {data && !isLoading && (
          <div className="flex flex-wrap gap-2">
            {data.permissions.map((permission) => (
              <Badge key={permission.id} variant="secondary" className="text-sm">
                {permission.name}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
