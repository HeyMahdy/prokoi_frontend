"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export interface TeamVelocityHistory {
  team_id: number
  team_name: string
  project_id: number
  project_name: string
  avg_hours_per_point?: number | null
  created_at: string
  updated_at: string
}

export function VelocityHistoryTable({ items }: { items: TeamVelocityHistory[] }) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Team</TableHead>
            <TableHead>Project</TableHead>
            <TableHead>Avg Hours/Point</TableHead>
            <TableHead>Updated</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((row, idx) => (
            <TableRow key={`${row.team_id}-${row.project_id}-${idx}`}>
              <TableCell className="font-medium">{row.team_name}</TableCell>
              <TableCell>{row.project_name}</TableCell>
              <TableCell>{row.avg_hours_per_point ?? "-"}</TableCell>
              <TableCell>{new Date(row.updated_at).toLocaleString()}</TableCell>
            </TableRow>
          ))}
          {items.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="text-sm text-muted-foreground text-center">No history</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}


