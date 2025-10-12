"use client"

import useSWR from "swr"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { fetchWithAuth } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

interface OutgoingRequest {
  id: number
  organization_id: number
  sender_id: number
  receiver_id: number
  status: string
  created_at: string
  updated_at: string
  organization_name: string
  receiver_name: string
  receiver_email: string
}

export function OutgoingRequestsTable() {
  const { toast } = useToast()
  const {
    data: requests,
    isLoading,
    error,
  } = useSWR<OutgoingRequest[]>("/api/organization-requests/outgoing", fetchWithAuth)

  if (error) {
    toast({
      title: "Error",
      description: "Failed to load outgoing requests",
      variant: "destructive",
    })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      pending: "secondary",
      accepted: "default",
      rejected: "destructive",
    }

    return (
      <Badge variant={variants[status] || "default"} className="capitalize">
        {status}
      </Badge>
    )
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="text-2xl">Outgoing Requests</CardTitle>
        <CardDescription>Invitations you have sent to other users</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : requests && requests.length > 0 ? (
          <div className="rounded-md border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Organization Name</TableHead>
                  <TableHead>Receiver Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">{request.organization_name}</TableCell>
                    <TableCell>{request.receiver_email}</TableCell>
                    <TableCell>{getStatusBadge(request.status)}</TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(request.created_at)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <p>No outgoing requests found</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}