"use client"

import type React from "react"
import { useState } from "react"
import { mutate } from "swr"
import { fetchWithAuth } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2 } from "lucide-react"

export function CreateOrganizationForm() {
  const [name, setName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess(false)

    try {
      const params = new URLSearchParams({
        name: name,
      })

      const response = await fetchWithAuth(`/api/organizations/create?${params.toString()}`, {
        method: "POST",
      })

      console.log("Organization creation response:", response)

      // Revalidate the organizations list
      mutate("/api/organizations/get")
      
      // Dispatch a custom event to notify other components
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('organizationCreated', { detail: response }))
      }

      // Show success message and reset form
      setSuccess(true)
      setName("")

      // Hide success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      console.error("Organization creation error:", err)
      
      // Handle different error types more gracefully
      let errorMsg = "Failed to create organization"
      
      if (err instanceof Error) {
        errorMsg = err.message
      } else if (typeof err === 'string') {
        errorMsg = err
      } else if (err && typeof err === 'object') {
        // Handle cases where error might be an object
        const errObj = err as any
        errorMsg = errObj.message || errObj.error || errObj.detail || errorMsg
      }
      
      // Ensure the error message is user-friendly
      if (errorMsg.includes('[object Object]')) {
        errorMsg = "An error occurred while creating the organization. Please try again."
      }
      
      setError(errorMsg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Organization</CardTitle>
        <CardDescription>Add a new organization to your account</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-green-500 bg-green-50 text-green-900 dark:bg-green-950 dark:text-green-100">
              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertDescription>Organization created successfully!</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Organization Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Enter organization name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <Button type="submit" disabled={isLoading || !name.trim()}>
            {isLoading ? "Creating..." : "Create Organization"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}