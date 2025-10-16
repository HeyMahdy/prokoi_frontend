"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { fetchWithAuth } from "@/lib/api"
import { useState } from "react"
import { Loader2, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface UserSkill {
  skill_id: number
  skill_name: string
  proficiency_level: string
}

const PROFICIENCY_LEVELS = ["beginner", "intermediate", "advanced", "expert"]

export function SkillsTable({ items, onChanged }: { items: any; onChanged?: () => void }) {
  const [busyId, setBusyId] = useState<number | null>(null)
  const { toast } = useToast()

  const updateLevel = async (skillId: number, level: string) => {
    setBusyId(skillId)
    try {
      await fetchWithAuth(`/api/users/skills/${skillId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proficiency_level: level }),
      })
      toast({ title: "Updated", description: "Proficiency updated" })
      onChanged?.()
    } catch (error: any) {
      toast({ title: "Error", description: error?.message || "Failed to update skill", variant: "destructive" })
    } finally {
      setBusyId(null)
    }
  }

  const remove = async (skillId: number) => {
    setBusyId(skillId)
    try {
      await fetchWithAuth(`/api/users/skills/${skillId}`, { method: "DELETE" })
      toast({ title: "Removed", description: "Skill removed" })
      onChanged?.()
    } catch (error: any) {
      toast({ title: "Error", description: error?.message || "Failed to remove skill", variant: "destructive" })
    } finally {
      setBusyId(null)
    }
  }

  const rows: any[] = (() => {
    if (Array.isArray(items)) return items
    if (items && Array.isArray((items as any).items)) return (items as any).items
    if (items && Array.isArray((items as any).skills)) return (items as any).skills
    if (items && Array.isArray((items as any).results)) return (items as any).results
    if (items && Array.isArray((items as any).data)) return (items as any).data
    return []
  })()

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Skill</TableHead>
            <TableHead>Level</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => {
            const id = (row as any).skill_id ?? (row as any).id ?? (row as any).skill?.id
            const name = (row as any).skill_name ?? (row as any).name ?? (row as any).skill?.name
            const level = (row as any).proficiency_level ?? (row as any).level ?? (row as any).proficiency?.level
            return (
            <TableRow key={id}>
              <TableCell className="font-medium">{name}</TableCell>
              <TableCell>
                <Select value={level} onValueChange={(v) => updateLevel(id, v)} disabled={busyId === id}>
                  <SelectTrigger className="w-[180px]">
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
              </TableCell>
              <TableCell>
                <Button size="sm" variant="outline" onClick={() => remove(id)} disabled={busyId === id}>
                  {busyId === id ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Trash2 className="h-4 w-4 mr-2" />}
                  Remove
                </Button>
              </TableCell>
            </TableRow>
          )})}
          {rows.length === 0 && (
            <TableRow>
              <TableCell colSpan={3} className="text-sm text-muted-foreground text-center">
                No skills yet.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}


