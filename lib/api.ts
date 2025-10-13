// Utility functions for API calls with authentication

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"

export class ApiError extends Error {
  constructor(
    message: string | any,
    public status?: number,
  ) {
    // Ensure message is always a string and never "[object Object]"
    let errorMessage: string
    
    if (typeof message === 'string') {
      errorMessage = message
    } else if (message && typeof message === 'object') {
      // Try to extract meaningful information from object
      if (message.message) {
        errorMessage = String(message.message)
      } else if (message.error) {
        errorMessage = String(message.error)
      } else if (message.detail) {
        errorMessage = String(message.detail)
      } else {
        errorMessage = JSON.stringify(message)
      }
    } else {
      errorMessage = String(message)
    }
    
    // Final safety check
    if (errorMessage === '[object Object]') {
      errorMessage = 'An error occurred'
    }
    
    super(errorMessage)
    this.name = "ApiError"
  }
}

export async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem("access_token")

  if (!token) {
    throw new ApiError("No authentication token found", 401)
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  })

  if (!response.ok) {
    let data
    let errorMessage = `Request failed with status ${response.status}`
    
    try {
      data = await response.json()
    } catch (e) {
      // If response is not JSON, use status text
      errorMessage = response.statusText || errorMessage
      throw new ApiError(errorMessage, response.status)
    }
    
    console.log("API Error Response:", data)
    console.log("Response Status:", response.status)
    
    // Handle different error response formats more robustly
    if (data && typeof data === 'object') {
      // Check for common error message fields
      if (typeof data.detail === 'string' && data.detail.trim()) {
        errorMessage = data.detail
      } else if (typeof data.message === 'string' && data.message.trim()) {
        errorMessage = data.message  
      } else if (typeof data.error === 'string' && data.error.trim()) {
        errorMessage = data.error
      } else if (Array.isArray(data.detail)) {
        errorMessage = data.detail.map((item: any) => 
          typeof item === 'string' ? item : JSON.stringify(item)
        ).join(', ')
      } else if (typeof data.detail === 'object' && data.detail !== null) {
        // Handle nested error objects
        const nestedError = data.detail.message || data.detail.error || JSON.stringify(data.detail)
        errorMessage = typeof nestedError === 'string' ? nestedError : String(nestedError)
      } else {
        // Fallback: try to extract any meaningful string from the response
        const possibleMessages = Object.values(data).filter(
          value => typeof value === 'string' && value.trim()
        )
        if (possibleMessages.length > 0) {
          errorMessage = possibleMessages[0] as string
        }
      }
    }
    
    // Final fallback if we still have no meaningful message
    if (!errorMessage || errorMessage === `Request failed with status ${response.status}`) {
      errorMessage = `Server error (${response.status}): ${response.statusText || 'Unknown error'}`
    }
    
    console.log("Final error message:", errorMessage)
    
    throw new ApiError(errorMessage, response.status)
  }

  return response.json()
}
