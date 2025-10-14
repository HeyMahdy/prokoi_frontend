"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { fetchWithAuth } from "@/lib/api"
import { Loader2, Plus } from "lucide-react"
import useSWR from "swr"

interface IssueType {
  id: number
  name: string
}

interface Issue {
  id: number
  title: string
}

interface CreateIssueFormProps {
  projectId: number
  onSuccess?: () => void
}

export function CreateIssueForm({ projectId, onSuccess }: CreateIssueFormProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [storyPoints, setStoryPoints] = useState<number | "">("")
  const [status, setStatus] = useState("open")
  const [priority, setPriority] = useState("medium")
  const [issuesTypeId, setIssuesTypeId] = useState<number | "">("")
  const [parentIssueId, setParentIssueId] = useState<number | "">("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  // Fetch issue types
  const { data: issueTypes } = useSWR<IssueType[]>("/api/issue-types", fetchWithAuth)

  // Fetch existing issues for parent issue selection
  const { data: existingIssues } = useSWR<Issue[]>(`/api/projects/${projectId}/issues`, fetchWithAuth)

  const statusOptions = [
    { value: "open", label: "Open" },
    { value: "in-progress", label: "In Progress" },
    { value: "review", label: "Review" },
    { value: "testing", label: "Testing" },
    { value: "done", label: "Done" },
    { value: "closed", label: "Closed" },
  ]

  const priorityOptions = [
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
    { value: "critical", label: "Critical" },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title.trim()) {
      toast({
        title: "Error",
        description: "Please enter an issue title",
        variant: "destructive",
      })
      return
    }

    if (!issuesTypeId) {
      toast({
        title: "Error",
        description: "Please select an issue type",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const requestBody = {
        project_id: projectId,
        title: title.trim(),
        description: description.trim(),
        story_points: storyPoints ? parseInt(storyPoints.toString()) : null,
        status,
        priority,
        type_id: parseInt(issuesTypeId.toString()),
        parent_issue_id: parentIssueId && parentIssueId !== "" ? parentIssueId : null,
      }

      const response = await fetchWithAuth(`/api/projects/${projectId}/issues`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      toast({
        title: "Success",
        description: "Issue created successfully",
      })

      // Reset form
      setTitle("")
      setDescription("")
      setStoryPoints("")
      setStatus("open")
      setPriority("medium")
      setIssuesTypeId("")
      setParentIssueId("")
      
      onSuccess?.()
    } catch (error: any) {
      console.error("Issue creation error:", error)
      console.error("Request body sent:", requestBody)
      console.error("API endpoint:", `/api/projects/${projectId}/issues`)
      toast({
        title: "Error",
        description: error.message || "Failed to create issue. Check console for details.",
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
          Create New Issue
        </CardTitle>
        <CardDescription>
          Add a new issue or sub-issue to this project
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              type="text"
              placeholder="e.g., Fix login bug"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isSubmitting}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe the issue in detail..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isSubmitting}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="storyPoints">Story Points</Label>
              <Input
                id="storyPoints"
                type="number"
                min="1"
                max="100"
                placeholder="e.g., 3"
                value={storyPoints}
                onChange={(e) => setStoryPoints(e.target.value ? parseInt(e.target.value) : "")}
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="issuesType">Issue Type *</Label>
              <Select value={issuesTypeId.toString()} onValueChange={(value) => setIssuesTypeId(parseInt(value))} disabled={isSubmitting}>
                <SelectTrigger>
                  <SelectValue placeholder="Select issue type" />
                </SelectTrigger>
                <SelectContent>
                  {issueTypes?.map((type) => (
                    <SelectItem key={type.id} value={type.id.toString()}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={setStatus} disabled={isSubmitting}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={priority} onValueChange={setPriority} disabled={isSubmitting}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {priorityOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="parentIssue">Parent Issue (Optional)</Label>
            <Select 
              value={parentIssueId ? parentIssueId.toString() : "none"} 
              onValueChange={(value) => setParentIssueId(value === "none" ? "" : parseInt(value))} 
              disabled={isSubmitting}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select parent issue for sub-issue" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None (Main Issue)</SelectItem>
                {existingIssues?.map((issue) => (
                  <SelectItem key={issue.id} value={issue.id.toString()}>
                    {issue.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
                Create Issue
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
