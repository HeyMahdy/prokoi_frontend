"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { fetchWithAuth } from "@/lib/api"
import { Loader2, Plus } from "lucide-react"

interface CreateSprintFormProps {
  projectId: number
  onSuccess?: () => void
}

export function CreateSprintForm({ projectId, onSuccess }: CreateSprintFormProps) {
  const { toast } = useToast()
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [goal, setGoal] = useState("")
  const [velocityTarget, setVelocityTarget] = useState<number | "">("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!name.trim()) {
      toast({ title: "Error", description: "Please enter sprint name", variant: "destructive" })
      return
    }
    if (!startDate || !endDate) {
      toast({ title: "Error", description: "Please select start and end dates", variant: "destructive" })
      return
    }

    setIsSubmitting(true)
    try {
      await fetchWithAuth(`/api/projects/${projectId}/sprints`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || undefined,
          start_date: startDate,
          end_date: endDate,
          goal: goal.trim() || undefined,
          velocity_target: velocityTarget === "" ? undefined : Number(velocityTarget),
        }),
      })
      toast({ title: "Success", description: "Sprint created successfully" })
      setName("")
      setDescription("")
      setStartDate("")
      setEndDate("")
      setGoal("")
      setVelocityTarget("")
      onSuccess?.()
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to create sprint", variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Create Sprint
        </CardTitle>
        <CardDescription>Create a new sprint for this project</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} disabled={isSubmitting} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} disabled={isSubmitting} rows={3} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date *</Label>
              <Input id="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} disabled={isSubmitting} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date *</Label>
              <Input id="endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} disabled={isSubmitting} required />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="goal">Goal</Label>
            <Input id="goal" value={goal} onChange={(e) => setGoal(e.target.value)} disabled={isSubmitting} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="velocity">Velocity Target</Label>
            <Input
              id="velocity"
              type="number"
              min="0"
              value={velocityTarget}
              onChange={(e) => setVelocityTarget(e.target.value ? Number(e.target.value) : "")}
              disabled={isSubmitting}
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
                Create Sprint
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}


