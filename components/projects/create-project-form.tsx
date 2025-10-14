"use client"

import type React from "react"
import { useState } from "react"
import { fetchWithAuth } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface CreateProjectFormProps {
  workspaceId: number
  onProjectCreated?: () => void
}

export function CreateProjectForm({ workspaceId, onProjectCreated }: CreateProjectFormProps) {
  const [name, setName] = useState("")
  const [status, setStatus] = useState("active")
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
        status: status,
      })

      const response = await fetchWithAuth(`/api/workspaces/${workspaceId}/projects?${params.toString()}`, {
        method: "POST",
      })

      toast({
        title: "Success",
        description: `Project "${response.name}" created successfully!`,
      })

      setName("")
      setStatus("active")
      
      // Notify parent component that a project was created
      if (onProjectCreated) {
        onProjectCreated()
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create project"
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
        <CardTitle>Create New Project</CardTitle>
        <CardDescription>Add a new project to this workspace</CardDescription>
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
            <Label htmlFor="name">Project Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Enter project name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={setStatus} disabled={isLoading}>
              <SelectTrigger id="status">
                <SelectValue placeholder="Select project status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="On Hold">On Hold</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" disabled={isLoading || !name.trim()}>
            {isLoading ? "Creating..." : "Create Project"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
