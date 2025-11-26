"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { fetchWithAuth } from "@/lib/api"
import { hasTokenIssue } from "@/lib/token-validation"
import { Loader2, Sparkles } from "lucide-react"

interface AIChatInput {
  input: string
}

interface AIChatResponse {
  response: string
}

interface AIIssueGeneratorProps {
  projectId: number
  onIssuesGenerated?: () => void
}

export function AIIssueGenerator({ projectId, onIssuesGenerated }: AIIssueGeneratorProps) {
  const [input, setInput] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Check for token issues before making the request
    if (hasTokenIssue()) {
      toast({
        title: "Authentication Issue",
        description: "There appears to be an issue with your authentication token. Please log out and log back in.",
        variant: "destructive",
      })
      return
    }
    
    if (!input.trim()) {
      toast({
        title: "Error",
        description: "Please enter a description for your issues",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)

    try {
      const requestBody: AIChatInput = {
        input: input.trim()
      }

      // Make API call to the chat endpoint with project_id as query parameter
      // Using fetchWithAuth to include JWT token with the correct base URL
      const API_BASE_URL = "http://127.0.0.1:8001"
      
      // Create a custom fetch function for the AI endpoint that includes the token
      const token = localStorage.getItem("access_token")
      if (!token) {
        throw new Error("No authentication token found")
      }

      const response = await fetch(`${API_BASE_URL}/chat?project_id=${projectId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        let errorMessage = `Failed to generate issues with AI: ${response.statusText}`
        try {
          const errorData = await response.json()
          if (errorData.detail) {
            errorMessage = errorData.detail
          }
        } catch (e) {
          // If we can't parse the error response, use the status text
        }
        throw new Error(errorMessage)
      }

      const data = await response.json() as AIChatResponse

      toast({
        title: "Success",
        description: "AI response received successfully",
      })

      // Reset form
      setInput("")
      
      // Call the callback to notify parent component
      onIssuesGenerated?.()
    } catch (error: any) {
      console.error("AI generation error:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to generate issues with AI. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          AI Issue Generator
        </CardTitle>
        <CardDescription>
          Describe what you want to accomplish and our AI will help generate issues for your project
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ai-input">What would you like to accomplish?</Label>
            <Textarea
              id="ai-input"
              placeholder="e.g., Implement user authentication with login, signup, and password reset functionality"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isGenerating}
              rows={4}
              className="resize-none"
            />
          </div>

          <Button type="submit" disabled={isGenerating} className="w-full">
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating Issues...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Issues with AI
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}