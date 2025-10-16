"use client"

import useSWR from "swr"
import { useState } from "react"
import { fetchWithAuth } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Plus } from "lucide-react"

interface Skill {
  id: number
  name: string
}

const PROFICIENCY_LEVELS = ["beginner", "intermediate", "advanced", "expert"]

export function AddSkillForm({ onAdded }: { onAdded?: () => void }) {
  const { data: skills } = useSWR<Skill[]>("/api/skills", fetchWithAuth)
  const { toast } = useToast()
  const [skillId, setSkillId] = useState<string>("")
  const [level, setLevel] = useState<string>(PROFICIENCY_LEVELS[0])
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!skillId) return
    setIsSubmitting(true)
    try {
      await fetchWithAuth(`/api/users/skills`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skill_id: Number(skillId), proficiency_level: level }),
      })
      toast({ title: "Success", description: "Skill added" })
      setSkillId("")
      setLevel(PROFICIENCY_LEVELS[0])
      onAdded?.()
    } catch (error: any) {
      toast({ title: "Error", description: error?.message || "Failed to add skill", variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Add Skill
        </CardTitle>
        <CardDescription>Add a skill to your profile</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="space-y-2">
            <Label>Skill</Label>
            <Select value={skillId} onValueChange={setSkillId} disabled={isSubmitting}>
              <SelectTrigger>
                <SelectValue placeholder="Select a skill" />
              </SelectTrigger>
              <SelectContent>
                {skills?.map((s) => (
                  <SelectItem key={s.id} value={String(s.id)}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Proficiency</Label>
            <Select value={level} onValueChange={setLevel} disabled={isSubmitting}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PROFICIENCY_LEVELS.map((lvl) => (
                  <SelectItem key={lvl} value={lvl}>
                    {lvl}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Button type="submit" disabled={isSubmitting || !skillId} className="w-full">
              {isSubmitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
              Add
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}


