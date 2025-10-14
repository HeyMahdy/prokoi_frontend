"use client"

import type React from "react"
import { useState } from "react"
import { fetchWithAuth } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface CreateWorkspaceFormProps {
  orgId: number
  onWorkspaceCreated?: () => void
}

export function CreateWorkspaceForm({ orgId, onWorkspaceCreated }: CreateWorkspaceFormProps) {
  const [name, setName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const params = new URLSearchParams({
        name: name,
      })

      const response = await fetchWithAuth(`/api/organizations/${orgId}/workspaces?${params.toString()}`, {
        method: "POST",
      })

      toast({
        title: "Success",
        description: `Workspace created successfully! Workspace ID: ${response.id}`,
      })

      setName("")
      
      // Notify parent component that a workspace was created
      if (onWorkspaceCreated) {
        onWorkspaceCreated()
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create workspace"
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
        <CardTitle>Create New Workspace</CardTitle>
        <CardDescription>Add a new workspace to this organization</CardDescription>
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
            <Label htmlFor="name">Workspace Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Enter workspace name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <Button type="submit" disabled={isLoading || !name.trim()}>
            {isLoading ? "Creating..." : "Create Workspace"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
