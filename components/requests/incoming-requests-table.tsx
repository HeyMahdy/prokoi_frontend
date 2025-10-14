"use client"

import { useState } from "react"
import useSWR from "swr"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { fetchWithAuth } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Check, X, Loader2 } from "lucide-react"

interface IncomingRequest {
  id: number
  organization_id: number
  sender_id: number
  receiver_id: number
  status: string
  created_at: string
  updated_at: string
  organization_name: string
  sender_name: string
  sender_email: string
}

export function IncomingRequestsTable() {
  const { toast } = useToast()
  const [respondingTo, setRespondingTo] = useState<number | null>(null)

  const {
    data: requests,
    isLoading,
    error,
    mutate,
  } = useSWR<IncomingRequest[]>("/api/organization-requests/incoming", fetchWithAuth)

  if (error) {
    toast({
      title: "Error",
      description: "Failed to load incoming requests",
      variant: "destructive",
    })
  }

  const handleRespond = async (requestId: number, status: "accepted" | "rejected") => {
    setRespondingTo(requestId)

    try {
      const params = new URLSearchParams({
        decision: status,
      })
      
      const url = `/api/organization-requests/${requestId}/respond?${params.toString()}`
      console.log("Sending request to:", url)
      console.log("Decision parameter:", status)

      const response = await fetchWithAuth(url, {
        method: "PUT",
      })

      toast({
        title: "Success",
        description: response.message || `Request ${status} successfully`,
      })

      mutate()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : `Failed to ${status} request`,
        variant: "destructive",
      })
    } finally {
      setRespondingTo(null)
    }
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
        <CardTitle className="text-2xl">Incoming Requests</CardTitle>
        <CardDescription>Invitations you have received from organizations</CardDescription>
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
                  <TableHead>Sender Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">{request.organization_name}</TableCell>
                    <TableCell>{request.sender_email}</TableCell>
                    <TableCell>{getStatusBadge(request.status)}</TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(request.created_at)}</TableCell>
                    <TableCell className="text-right">
                      {request.status === "pending" && (
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => handleRespond(request.id, "accepted")}
                            disabled={respondingTo === request.id}
                          >
                            {respondingTo === request.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <Check className="h-4 w-4 mr-1" />
                                Accept
                              </>
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleRespond(request.id, "rejected")}
                            disabled={respondingTo === request.id}
                          >
                            {respondingTo === request.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <X className="h-4 w-4 mr-1" />
                                Reject
                              </>
                            )}
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <p>No incoming requests found</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
