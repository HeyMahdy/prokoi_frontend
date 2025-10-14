"use client"

import { IssueTypesTable } from "@/components/issue-types/issue-types-table"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function IssueTypesPage() {
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
            View all available default issue types
          </p>
        </div>

        {/* Content */}
        <div className="max-w-4xl">
          <IssueTypesTable />
        </div>
      </div>
    </div>
  )
}
