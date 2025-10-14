"use client"

import type React from "react"

import { useState } from "react"
import useSWR from "swr"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { fetchWithAuth } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

interface Organization {
  id: number
  name: string
}

export function SendRequestForm() {
  const [selectedOrgId, setSelectedOrgId] = useState<string>("")
  const [receiverEmail, setReceiverEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const { data: organizations, isLoading } = useSWR<Organization[]>("/api/organizations/get", fetchWithAuth)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedOrgId || !receiverEmail) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const params = new URLSearchParams({
        receiver_email: receiverEmail,
      })

      const response = await fetchWithAuth(`/api/organizations/${selectedOrgId}/requests?${params.toString()}`, {
        method: "POST",
      })

      toast({
        title: "Success",
        description: response.message || "Request sent successfully",
      })

      setReceiverEmail("")
      setSelectedOrgId("")
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send request",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="text-2xl">Send Organization Invitation</CardTitle>
        <CardDescription>Invite a user to join your organization</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="organization">Organization</Label>
            <Select value={selectedOrgId} onValueChange={setSelectedOrgId} disabled={isLoading}>
              <SelectTrigger id="organization">
                <SelectValue placeholder="Select an organization" />
              </SelectTrigger>
              <SelectContent>
                {organizations?.map((org) => (
                  <SelectItem key={org.id} value={org.id.toString()}>
                    {org.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Receiver Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="user@example.com"
              value={receiverEmail}
              onChange={(e) => setReceiverEmail(e.target.value)}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              "Send Invitation"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
