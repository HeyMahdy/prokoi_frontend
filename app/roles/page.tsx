"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CreateRoleForm } from "@/components/roles/create-role-form"
import { RolesTable } from "@/components/roles/roles-table"
import { PermissionsList } from "@/components/roles/permissions-list"
import { AssignPermissionForm } from "@/components/roles/assign-permission-form"
import { RolePermissionsView } from "@/components/roles/role-permissions-view"
import { authStorage } from "@/lib/auth-storage"

export default function RolesPage() {
  const router = useRouter()
  const [selectedOrgId, setSelectedOrgId] = useState<number | null>(null)

  useEffect(() => {
    const token = authStorage.getAuthToken()
    if (!token) {
      router.push("/login")
    }
  }, [router])

  const handleLogout = () => {
    authStorage.clearAll()
    router.push("/login")
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h1 className="text-xl font-bold text-foreground">Roles & Permissions</h1>
            <Button variant="ghost" onClick={() => router.push("/dashboard")}>
              Dashboard
            </Button>
            <Button variant="ghost" onClick={() => router.push("/organizations")}>
              Organizations
            </Button>
          </div>
          <Button onClick={handleLogout} variant="outline">
            Log out
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <Tabs defaultValue="roles" className="space-y-8">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="roles">Roles</TabsTrigger>
              <TabsTrigger value="permissions">Permissions</TabsTrigger>
              <TabsTrigger value="assign">Assign Permissions</TabsTrigger>
              <TabsTrigger value="view">View Role Permissions</TabsTrigger>
            </TabsList>

            <TabsContent value="roles" className="space-y-8">
              <CreateRoleForm onOrgSelect={setSelectedOrgId} />
              {selectedOrgId && <RolesTable orgId={selectedOrgId} />}
            </TabsContent>

            <TabsContent value="permissions">
              <PermissionsList />
            </TabsContent>

            <TabsContent value="assign">
              <AssignPermissionForm />
            </TabsContent>

            <TabsContent value="view">
              <RolePermissionsView />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
