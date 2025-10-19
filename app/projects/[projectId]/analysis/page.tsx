"use client"

import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, BarChart3 } from "lucide-react"
import { ProjectAnalysisCard } from "@/components/projects/project-analysis-card"

export default function ProjectAnalysisPage() {
  const params = useParams() as { projectId: string }
  const router = useRouter()
  const projectId = Number(params.projectId)

  return (
    <div className="container mx-auto px-6 py-8 space-y-8">
      <div className="flex items-center gap-3">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Project Analysis</h1>
        </div>
      </div>

      <ProjectAnalysisCard projectId={projectId} showDetailed={true} />
    </div>
  )
}
