// Utility functions for API calls with authentication

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"

export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
  ) {
    super(message)
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
    const data = await response.json().catch(() => ({}))
    throw new ApiError(data.detail || `Request failed with status ${response.status}`, response.status)
  }

  return response.json()
}
