"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import useSWR from "swr"
import { fetchWithAuth } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

interface Organization {
  id: number
  name: string
  created_at: string
  updated_at: string
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<{ name: string; email: string } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showOrganizations, setShowOrganizations] = useState(false)
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null)

  useEffect(() => {
    const token = localStorage.getItem("access_token")
    if (!token) {
      router.push("/login")
      return
    }

    const userData = localStorage.getItem("user_data")
    if (userData) {
      setUser(JSON.parse(userData))
    } else {
      setUser({ name: "User", email: "user@example.com" })
    }

    setIsLoading(false)
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("access_token")
    localStorage.removeItem("user_data")
    router.push("/login")
  }

  // Fetch organizations when showing organizations list
  const { data: organizationsData, error: organizationsError, isLoading: organizationsLoading } = useSWR<Organization[]>(
    showOrganizations ? "/api/organizations/get" : null,
    fetchWithAuth,
  )

  const handleEnterOrganization = (org: Organization) => {
    setSelectedOrg(org)
    localStorage.setItem("selected_org", JSON.stringify(org))
  }

  const handleBackToDashboard = () => {
    setShowOrganizations(false)
    setSelectedOrg(null)
    localStorage.removeItem("selected_org")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {selectedOrg && (
              <Button variant="ghost" onClick={handleBackToDashboard}>
                ← Back to Dashboard
              </Button>
            )}
            <h1 className="text-xl font-bold text-foreground">
              {selectedOrg ? `${selectedOrg.name} Management` : "Dashboard"}
            </h1>
          </div>
          <Button onClick={handleLogout} variant="outline">
            Log out
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-6">
          {!selectedOrg && !showOrganizations && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Welcome, {user?.name}!</CardTitle>
                  <CardDescription>You're successfully logged in to your account</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Name</p>
                    <p className="text-foreground">{user?.name}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Email</p>
                    <p className="text-foreground">{user?.email}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Manage your account and organizations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Button onClick={() => setShowOrganizations(true)} className="w-full">
                      Manage Organizations
                    </Button>
                    <Button onClick={() => router.push("/requests/send")} variant="outline" className="w-full">
                      Organization Requests
                    </Button>
                    <Button onClick={() => router.push("/roles")} variant="outline" className="w-full">
                      Roles & Permissions
                    </Button>
                    <Button onClick={() => router.push("/teams")} variant="outline" className="w-full">
                      Teams Management
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {showOrganizations && !selectedOrg && (
            <Card>
              <CardHeader>
                <CardTitle>Organizations</CardTitle>
                <CardDescription>Select an organization to manage</CardDescription>
              </CardHeader>
              <CardContent>
                {organizationsLoading && (
                  <div className="space-y-2">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                )}

                {organizationsError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{organizationsError.message || "Failed to load organizations"}</AlertDescription>
                  </Alert>
                )}

                {organizationsData && !organizationsLoading && (
                  <>
                    {organizationsData.length === 0 ? (
                      <div className="text-center py-8 space-y-4">
                        <p className="text-sm text-muted-foreground">No organizations found</p>
                        <Button onClick={() => router.push("/organizations")}>
                          Create Your First Organization
                        </Button>
                      </div>
                    ) : (
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>ID</TableHead>
                              <TableHead>Name</TableHead>
                              <TableHead>Created At</TableHead>
                              <TableHead>Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {organizationsData.map((org) => (
                              <TableRow key={org.id}>
                                <TableCell className="font-medium">{org.id}</TableCell>
                                <TableCell>{org.name}</TableCell>
                                <TableCell>{new Date(org.created_at).toLocaleString()}</TableCell>
                                <TableCell>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleEnterOrganization(org)}
                                  >
                                    Enter
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                    
                    {/* Add Create Organization button even when there are existing organizations */}
                    <div className="mt-4 text-center">
                      <Button variant="outline" onClick={() => router.push("/organizations")}>
                        Create New Organization
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {selectedOrg && (
            <Card>
              <CardHeader>
                <CardTitle>{selectedOrg.name} Management</CardTitle>
                <CardDescription>Manage this organization's resources and settings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button onClick={() => router.push(`/organizations/${selectedOrg.id}/requests/send`)} className="w-full">
                    Organization Requests
                  </Button>
                  <Button onClick={() => router.push(`/organizations/${selectedOrg.id}/roles`)} variant="outline" className="w-full">
                    Roles & Permissions
                  </Button>
                  <Button onClick={() => router.push(`/organizations/${selectedOrg.id}/teams`)} variant="outline" className="w-full">
                    Teams Management
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}