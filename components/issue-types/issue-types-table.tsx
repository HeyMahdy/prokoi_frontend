"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Info } from "lucide-react"
import useSWR from "swr"
import { fetchWithAuth } from "@/lib/api"

interface IssueType {
  id: number
  name: string
}

interface IssueTypesTableProps {
  orgId?: number
}

export function IssueTypesTable({ orgId }: IssueTypesTableProps) {
  // Fetch default issue types (always available)
  const {
    data: defaultIssueTypes,
    isLoading: defaultLoading,
    error: defaultError,
    mutate: mutateDefault,
  } = useSWR<IssueType[]>("/api/issue-types", fetchWithAuth)

  // Note: No GET endpoint for custom issue types exists in the API
  // Custom issue types are only created via POST /api/organizations/{org_id}/issue-types
  const customIssueTypes: IssueType[] = []
  const customLoading = false
  const customError = null

  const isLoading = defaultLoading
  const hasError = defaultError
  
  // Check if we have any data
  const hasDefaultTypes = defaultIssueTypes && defaultIssueTypes.length > 0
  const hasCustomTypes = customIssueTypes && customIssueTypes.length > 0
  const hasAnyData = hasDefaultTypes || hasCustomTypes

  const getIssueTypeBadge = (name: string) => {
    const badgeVariants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      "Story": "default",
      "Task": "secondary", 
      "Bug": "destructive",
    }
    
    return (
      <Badge variant={badgeVariants[name] || "outline"}>
        {name}
      </Badge>
    )
  }

  const refreshData = () => {
    mutateDefault()
    // Note: Custom issue types are not fetched, so no need to refresh them
  }

  // Expose refresh function for parent components
  if (typeof window !== "undefined") {
    (window as any).refreshIssueTypes = refreshData
  }

  // Only show error if we have an error AND no data at all
  if (hasError && !hasAnyData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Issue Types</CardTitle>
          <CardDescription>
            {orgId ? "Default and custom issue types for this organization" : "Default issue types"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertDescription>
              Failed to load issue types. Please try again.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Issue Types</CardTitle>
        <CardDescription>
          Default issue types available for creating issues
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Show warning if there are errors but we have some data */}
        {hasError && hasAnyData && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>
              Some issue types could not be loaded. Showing available data.
            </AlertDescription>
          </Alert>
        )}
        
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-6 w-[80px]" />
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Issue Types Section */}
            {defaultIssueTypes && defaultIssueTypes.length > 0 && (
              <div className="mb-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {defaultIssueTypes.map((issueType) => (
                      <TableRow key={issueType.id}>
                        <TableCell className="font-medium">{issueType.name}</TableCell>
                        <TableCell>
                          {getIssueTypeBadge(issueType.name)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}


            {/* Empty State */}
            {!hasAnyData && !isLoading && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  No default issue types available. Contact your administrator to set up issue types.
                </AlertDescription>
              </Alert>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
