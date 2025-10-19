"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, TrendingUp } from "lucide-react"
import { UserPerformanceCard } from "@/components/users/user-performance-card"

export default function UserPerformancePage() {
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
          <h1 className="text-2xl font-bold">User Performance Analysis</h1>
        </div>
      </div>

      <UserPerformanceCard showDetailed={true} />
    </div>
  )
}
