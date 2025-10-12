"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { RequestsNav } from "@/components/requests/requests-nav"
import { SendRequestForm } from "@/components/requests/send-request-form"

export default function SendRequestPage() {
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
        <div className="max-w-2xl mx-auto">
          <SendRequestForm />
        </div>
      </main>
    </div>
  )
}
