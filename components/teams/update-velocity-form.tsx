"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { fetchWithAuth } from "@/lib/api"
import { Loader2, Gauge } from "lucide-react"

export function UpdateVelocityForm({ projectId, teamId, onUpdated }: { projectId: number; teamId: number; onUpdated?: () => void }) {
  const { toast } = useToast()
  const [value, setValue] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await fetchWithAuth(`/api/projects/${projectId}/teams/${teamId}/velocity`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avg_hours_per_point: value === "" ? null : Number(value) }),
      })
      toast({ title: "Saved", description: "Team velocity updated" })
      onUpdated?.()
    } catch (err: any) {
      toast({ title: "Error", description: err?.message || "Failed to update velocity", variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gauge className="h-5 w-5" />
          Update Team Velocity
        </CardTitle>
        <CardDescription>Set average hours per story point</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="velocity">Avg hours per point</Label>
            <Input
              id="velocity"
              type="number"
              step="0.1"
              min="0"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="e.g., 2.5"
              disabled={isSubmitting}
            />
          </div>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
            Save
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}


