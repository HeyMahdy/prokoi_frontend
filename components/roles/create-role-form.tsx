"use client"

import type React from "react"
import { useState, useEffect } from "react"
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

interface Organization {
  id: number
  name: string
  created_at: string
  updated_at: string
}

interface CreateRoleFormProps {
  onOrgSelect?: (orgId: number) => void
}

export function CreateRoleForm({ onOrgSelect }: CreateRoleFormProps) {
  const [orgId, setOrgId] = useState<string>("")
  const [name, setName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const { toast } = useToast()

  const { data: orgsData } = useSWR<Organization[]>("/api/organizations/get", fetchWithAuth)

  useEffect(() => {
    if (orgId && onOrgSelect) {
      onOrgSelect(Number.parseInt(orgId))
    }
  }, [orgId, onOrgSelect])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const params = new URLSearchParams({
        org_id: orgId,
        name: name,
      })

      const response = await fetchWithAuth(`/api/roles/create?${params.toString()}`, {
        method: "POST",
      })

      toast({
        title: "Success",
        description: `Role created successfully! Role ID: ${response.roles}`,
      })

      setName("")
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create role"
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
        <CardTitle>Create New Role</CardTitle>
        <CardDescription>Add a new role to an organization</CardDescription>
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
            <Label htmlFor="org">Organization</Label>
            <Select value={orgId} onValueChange={setOrgId} disabled={isLoading}>
              <SelectTrigger id="org">
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
            <Label htmlFor="name">Role Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Enter role name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <Button type="submit" disabled={isLoading || !name.trim() || !orgId}>
            {isLoading ? "Creating..." : "Create Role"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}