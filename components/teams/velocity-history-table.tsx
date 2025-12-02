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

export function VelocityHistoryTable({ items }: { items: TeamVelocityHistory | TeamVelocityHistory[] | any }) {
  // Ensure items is an array
  let itemsArray: TeamVelocityHistory[] = [];
  
  if (Array.isArray(items)) {
    itemsArray = items;
  } else if (items && typeof items === 'object') {
    // Handle single object response
    if ('team_id' in items) {
      itemsArray = [items];
    } else if (items.items) {
      itemsArray = Array.isArray(items.items) ? items.items : [items.items];
    } else if (items.data) {
      itemsArray = Array.isArray(items.data) ? items.data : [items.data];
    }
  }
  
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
          {itemsArray.map((row: TeamVelocityHistory, idx: number) => (
            <TableRow key={`${row.team_id}-${row.project_id}-${idx}`}>
              <TableCell className="font-medium">{row.team_name}</TableCell>
              <TableCell>{row.project_name}</TableCell>
              <TableCell>{row.avg_hours_per_point ?? "-"}</TableCell>
              <TableCell>{new Date(row.updated_at).toLocaleString()}</TableCell>
            </TableRow>
          ))}
          {itemsArray.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="text-sm text-muted-foreground text-center">No history</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}


