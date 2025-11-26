"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { RequestsNav } from "@/components/requests/requests-nav"
import { OutgoingRequestsTable } from "@/components/requests/outgoing-requests-table"
import { authStorage } from "@/lib/auth-storage"

export default function OutgoingRequestsPage() {
  const router = useRouter()

  useEffect(() => {
    const token = authStorage.getAuthToken()
    if (!token) {
      router.push("/login")
    }
  }, [router])

  return (
    <div className="min-h-screen bg-background">
      <RequestsNav />
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <OutgoingRequestsTable />
        </div>
      </main>
    </div>
  )
}
