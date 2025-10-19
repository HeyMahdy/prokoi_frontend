"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, TrendingUp } from "lucide-react"
import { SprintVelocityCard } from "@/components/sprints/sprint-velocity-card"

export default function SprintVelocityPage() {
  const router = useRouter()

  return (
    <div className="container mx-auto px-6 py-8 space-y-8">
      <div className="flex items-center gap-3">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Sprint Velocity Analysis</h1>
        </div>
      </div>

      <SprintVelocityCard showDetailed={true} />
    </div>
  )
}
