"use client"

import useSWR from "swr"
import { fetchWithAuth } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Loader2 } from "lucide-react"

interface Organization {
  id: number
  name: string
  created_at: string
  updated_at: string
}

export function OrganizationsTable() {
  const { data, error, isLoading } = useSWR<Organization[]>("/api/organizations/get", fetchWithAuth, {
    refreshInterval: 0,
    revalidateOnFocus: false,
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Organizations List</CardTitle>
        <CardDescription>View all organizations in your account</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Loading organizations...</span>
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error instanceof Error ? error.message : "Failed to load organizations"}
            </AlertDescription>
          </Alert>
        )}

        {data && data.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No organizations found. Create one to get started!
          </div>
        )}

        {data && data.length > 0 && (
          <div className="rounded-md border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead>Updated At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((org) => (
                  <TableRow key={org.id}>
                    <TableCell className="font-medium">{org.id}</TableCell>
                    <TableCell>{org.name}</TableCell>
                    <TableCell>{new Date(org.created_at).toLocaleString()}</TableCell>
                    <TableCell>{new Date(org.updated_at).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
