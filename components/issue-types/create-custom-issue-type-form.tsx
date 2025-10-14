"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { fetchWithAuth } from "@/lib/api"
import { Loader2, Plus } from "lucide-react"

interface CreateCustomIssueTypeFormProps {
  orgId: number
  onSuccess?: () => void
}

export function CreateCustomIssueTypeForm({ orgId, onSuccess }: CreateCustomIssueTypeFormProps) {
  const [name, setName] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name.trim()) {
      toast({
        title: "Error",
        description: "Please enter an issue type name",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetchWithAuth(`/api/organizations/${orgId}/issue-types`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
        }),
      })

      toast({
        title: "Success",
        description: "Custom issue type created successfully",
      })

      setName("")
      onSuccess?.()
    } catch (error: any) {
      console.error("Issue type creation error:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to create custom issue type",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Create Custom Issue Type
        </CardTitle>
        <CardDescription>
          Add a new custom issue type for your organization
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Issue Type Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="e.g., Feature Request, Enhancement"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSubmitting}
              required
            />
          </div>
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Create Issue Type
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
