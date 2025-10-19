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
import { AlertCircle, Building2, LogOut, User, Mail, Users, Settings, Shield, Layers, FolderOpen, Bug, BarChart3 } from "lucide-react"
import { ProjectsAnalysisOverview } from "@/components/dashboard/projects-analysis-overview"
import { SprintVelocityCard } from "@/components/sprints/sprint-velocity-card"

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
      <header className="border-b border-border/50 backdrop-blur-sm bg-background/95 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-sm">
              <Building2 className="h-6 w-6 text-primary-foreground" />
            </div>
            <div className="flex items-center gap-4">
              {selectedOrg && (
                <Button variant="ghost" onClick={handleBackToDashboard} size="sm">
                  ← Back to Dashboard
                </Button>
              )}
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  {selectedOrg ? `${selectedOrg.name} Management` : "Dashboard"}
                </h1>
                {user && !selectedOrg && (
                  <p className="text-sm text-muted-foreground">
                    Welcome back, {user.name}
                  </p>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {user && (
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-foreground">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
            )}
            <Button onClick={handleLogout} variant="outline" size="sm">
              <LogOut className="h-4 w-4 mr-2" />
              Log out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12">
        <div className="max-w-6xl mx-auto space-y-8">
          {!selectedOrg && !showOrganizations && (
            <>
              <Card className="border-2 border-primary/20 shadow-lg">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl">Welcome back, {user?.name}!</CardTitle>
                      <CardDescription className="text-base">You're successfully logged in to your account</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3 p-4 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm font-medium text-muted-foreground">Full Name</p>
                      </div>
                      <p className="text-lg font-semibold text-foreground">{user?.name}</p>
                    </div>
                    <div className="space-y-3 p-4 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm font-medium text-muted-foreground">Email Address</p>
                      </div>
                      <p className="text-lg font-semibold text-foreground">{user?.email}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Projects Analysis Overview - Only show if user has selected an organization */}
              {selectedOrg && (
                <ProjectsAnalysisOverview organizationId={(selectedOrg as Organization).id} maxProjects={3} />
              )}

              {/* Sprint Velocity Analysis */}
              <SprintVelocityCard showDetailed={false} />

              <Card className="shadow-lg">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                      <Settings className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">Quick Actions</CardTitle>
                      <CardDescription>Manage your account and organizations</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Button 
                      onClick={() => router.push("/profile")} 
                      className="h-20 flex flex-col items-center justify-center gap-2 hover:scale-105 transition-transform"
                      variant="outline"
                    >
                      <User className="h-6 w-6" />
                      <span className="font-medium text-sm">Profile</span>
                    </Button>
                    <Button 
                      onClick={() => setShowOrganizations(true)} 
                      className="h-20 flex flex-col items-center justify-center gap-2 hover:scale-105 transition-transform"
                      variant="default"
                    >
                      <Building2 className="h-6 w-6" />
                      <span className="font-medium text-sm">Organizations</span>
                    </Button>
                    <Button 
                      onClick={() => router.push("/requests/send")} 
                      className="h-20 flex flex-col items-center justify-center gap-2 hover:scale-105 transition-transform"
                      variant="outline"
                    >
                      <Users className="h-6 w-6" />
                      <span className="font-medium text-sm">Requests</span>
                    </Button>
                    <Button 
                      onClick={() => router.push("/roles")} 
                      className="h-20 flex flex-col items-center justify-center gap-2 hover:scale-105 transition-transform"
                      variant="outline"
                    >
                      <Shield className="h-6 w-6" />
                      <span className="font-medium text-sm">Roles</span>
                    </Button>
                    <Button 
                      onClick={() => router.push("/teams")} 
                      className="h-20 flex flex-col items-center justify-center gap-2 hover:scale-105 transition-transform"
                      variant="outline"
                    >
                      <Users className="h-6 w-6" />
                      <span className="font-medium text-sm">Teams</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {showOrganizations && !selectedOrg && (
            <Card className="shadow-lg">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Organizations</CardTitle>
                    <CardDescription>Select an organization to manage</CardDescription>
                  </div>
                </div>
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
            <Card className="shadow-lg">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Building2 className="h-7 w-7 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">{selectedOrg.name} Management</CardTitle>
                    <CardDescription className="text-base">Manage this organization's resources and settings</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Button 
                    onClick={() => router.push(`/organizations/${selectedOrg.id}/requests/send`)} 
                    className="h-24 flex flex-col items-center justify-center gap-2 hover:scale-105 transition-transform"
                    variant="default"
                  >
                    <Users className="h-6 w-6" />
                    <span className="font-medium">Requests</span>
                  </Button>
                  <Button 
                    onClick={() => router.push(`/organizations/${selectedOrg.id}/roles`)} 
                    className="h-24 flex flex-col items-center justify-center gap-2 hover:scale-105 transition-transform"
                    variant="outline"
                  >
                    <Shield className="h-6 w-6" />
                    <span className="font-medium">Roles & Permissions</span>
                  </Button>
                  <Button 
                    onClick={() => router.push(`/organizations/${selectedOrg.id}/teams`)} 
                    className="h-24 flex flex-col items-center justify-center gap-2 hover:scale-105 transition-transform"
                    variant="outline"
                  >
                    <Users className="h-6 w-6" />
                    <span className="font-medium">Teams</span>
                  </Button>
                  <Button 
                    onClick={() => router.push(`/organizations/${selectedOrg.id}/workspaces`)} 
                    className="h-24 flex flex-col items-center justify-center gap-2 hover:scale-105 transition-transform"
                    variant="outline"
                  >
                    <FolderOpen className="h-6 w-6" />
                    <span className="font-medium">Workspaces</span>
                  </Button>
                  <Button 
                    onClick={() => router.push(`/organizations/${selectedOrg.id}/issue-types`)} 
                    className="h-24 flex flex-col items-center justify-center gap-2 hover:scale-105 transition-transform"
                    variant="outline"
                  >
                    <Bug className="h-6 w-6" />
                    <span className="font-medium">Issue Types</span>
                  </Button>
                  <Button 
                    onClick={() => router.push(`/organizations/${selectedOrg.id}/analysis`)} 
                    className="h-24 flex flex-col items-center justify-center gap-2 hover:scale-105 transition-transform"
                    variant="outline"
                  >
                    <BarChart3 className="h-6 w-6" />
                    <span className="font-medium">Analysis</span>
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