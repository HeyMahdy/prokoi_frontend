"use client"

import type React from "react"
import { useState } from "react"
import useSWR from "swr"
import { fetchWithAuth } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Organization {
  id: number
  name: string
}

interface Role {
  id: number
  name: string
  organization_id: number
}

interface Permission {
  id: number
  name: string
}

export function AssignPermissionForm() {
  const [orgId, setOrgId] = useState<string>("")
  const [roleId, setRoleId] = useState<string>("")
  const [permissionName, setPermissionName] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const { toast } = useToast()

  const { data: orgsData } = useSWR<Organization[]>("/api/organizations/get", fetchWithAuth)

  const { data: rolesData } = useSWR<{ message: string; roles: Role[] }>(
    orgId ? `/api/roles/${orgId}/roles` : null,
    fetchWithAuth,
  )

  const { data: permissionsData } = useSWR<{ message: string; permissions: Permission[] }>(
    "/api/roles/permissions",
    fetchWithAuth,
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await fetchWithAuth(`/api/roles/${roleId}/permissions/${permissionName}`, {
        method: "GET",
      })

      toast({
        title: "Success",
        description: `Permission "${permissionName}" assigned to role successfully!`,
      })

      setRoleId("")
      setPermissionName("")
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to assign permission"
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
        <CardTitle>Assign Permission to Role</CardTitle>
        <CardDescription>Select a role and permission to assign</CardDescription>
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
            <Label htmlFor="org-select">Organization</Label>
            <Select value={orgId} onValueChange={setOrgId} disabled={isLoading}>
              <SelectTrigger id="org-select">
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

          <div className="space-y-2">
            <Label htmlFor="role-select">Role</Label>
            <Select value={roleId} onValueChange={setRoleId} disabled={isLoading || !orgId}>
              <SelectTrigger id="role-select">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {rolesData?.roles.map((role) => (
                  <SelectItem key={role.id} value={role.id.toString()}>
                    {role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="permission-select">Permission</Label>
            <Select value={permissionName} onValueChange={setPermissionName} disabled={isLoading}>
              <SelectTrigger id="permission-select">
                <SelectValue placeholder="Select a permission" />
              </SelectTrigger>
              <SelectContent>
                {permissionsData?.permissions.map((permission) => (
                  <SelectItem key={permission.id} value={permission.name}>
                    {permission.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" disabled={isLoading || !roleId || !permissionName}>
            {isLoading ? "Assigning..." : "Assign Permission"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
