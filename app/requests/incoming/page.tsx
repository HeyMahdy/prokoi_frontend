"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { RequestsNav } from "@/components/requests/requests-nav"
import { IncomingRequestsTable } from "@/components/requests/incoming-requests-table"

export default function IncomingRequestsPage() {
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("access_token")
    if (!token) {
      router.push("/login")
    }
  }, [router])

  return (
    <div className="min-h-screen bg-background">
      <RequestsNav />
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <IncomingRequestsTable />
        </div>
      </main>
    </div>
  )
}