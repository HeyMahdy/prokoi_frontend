"use client"

import { useParams } from "next/navigation"
import { CreateCustomIssueTypeForm } from "@/components/issue-types/create-custom-issue-type-form"
import { IssueTypesTable } from "@/components/issue-types/issue-types-table"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function OrganizationIssueTypesPage() {
  const params = useParams()
  const orgId = parseInt(params.orgId as string)

  const handleSuccess = () => {
    // Refresh the issue types table when a new custom issue type is created
    if (typeof window !== "undefined" && (window as any).refreshIssueTypes) {
      (window as any).refreshIssueTypes()
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
          </div>
          <h1 className="text-3xl font-bold">Issue Types</h1>
          <p className="text-muted-foreground mt-2">
            Manage default and custom issue types for your organization
          </p>
        </div>

        {/* Content */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Create Custom Issue Type Form */}
          <div>
            <CreateCustomIssueTypeForm orgId={orgId} onSuccess={handleSuccess} />
          </div>

          {/* Issue Types Table */}
          <div>
            <IssueTypesTable orgId={orgId} />
          </div>
        </div>
      </div>
    </div>
  )
}
