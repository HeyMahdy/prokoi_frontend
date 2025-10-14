"use client"

import { useParams } from "next/navigation"
import { CreateIssueForm } from "@/components/issues/create-issue-form"
import { IssuesTable } from "@/components/issues/issues-table"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function ProjectIssuesPage() {
  const params = useParams()
  const orgId = parseInt(params.orgId as string)
  const workspaceId = parseInt(params.workspaceId as string)
  const projectId = parseInt(params.projectId as string)

  const handleSuccess = () => {
    // Refresh the issues table when a new issue is created
    if (typeof window !== "undefined" && (window as any).refreshIssues) {
      (window as any).refreshIssues()
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/workspaces/${workspaceId}/projects`} onClick={() => console.log('Navigating to:', `/workspaces/${workspaceId}/projects`)}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Projects
              </Link>
            </Button>
          </div>
          <h1 className="text-3xl font-bold">Project Issues</h1>
          <p className="text-muted-foreground mt-2">
            Manage issues and sub-issues for this project
          </p>
        </div>

        {/* Content */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Create Issue Form */}
          <div>
            <CreateIssueForm projectId={projectId} onSuccess={handleSuccess} />
          </div>

          {/* Issues Table */}
          <div>
            <IssuesTable projectId={projectId} />
          </div>
        </div>
      </div>
    </div>
  )
}
