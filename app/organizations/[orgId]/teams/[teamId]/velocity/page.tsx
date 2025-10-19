"use client"

import useSWR from "swr"
import { useParams, useRouter } from "next/navigation"
import { fetchWithAuth } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { UpdateVelocityForm } from "@/components/teams/update-velocity-form"
import { VelocityHistoryTable, TeamVelocityHistory } from "@/components/teams/velocity-history-table"
import { AlertCircle, Gauge, ArrowLeft } from "lucide-react"

export default function TeamVelocityPage() {
  const params = useParams() as { orgId: string; teamId: string }
  const router = useRouter()
  const teamId = Number(params.teamId)

  const { data, error, isLoading, mutate } = useSWR<TeamVelocityHistory[]>(
    Number.isFinite(teamId) ? `/api/teams/${teamId}/velocity` : null,
    fetchWithAuth,
  )

  return (
    <div className="container mx-auto px-6 py-8 space-y-8">
      <div className="flex items-center gap-3">
        <Button variant="ghost" onClick={() => router.push(`/organizations/${params.orgId}/teams`)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Teams
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Gauge className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">Team Velocity</CardTitle>
              <CardDescription>Manage team velocity and view history</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          )}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error.message || "Failed to load velocity"}</AlertDescription>
            </Alert>
          )}
          <UpdateVelocityForm teamId={teamId} onUpdated={() => mutate()} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>History</CardTitle>
          <CardDescription>Recent velocity changes</CardDescription>
        </CardHeader>
        <CardContent>
          {data && <VelocityHistoryTable items={data} />}
        </CardContent>
      </Card>
    </div>
  )
}


