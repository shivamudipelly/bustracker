import { environment } from "@/config/environment"
import { Bus } from "@/types/driver"
import { log } from "console"

const API_BASE_URL = environment.get("API_URL")

interface ApiResponse<T = any> {
  success: boolean
  data: T
  message: string
}

interface ApiError {
  message: string
  status: number
  details?: any
}

class ApiService {
  private baseURL: string

  constructor() {
    this.baseURL = API_BASE_URL
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      credentials: "include",
      ...options,
    }

    console.log(url)
    try {
      const response = await fetch(url, config)
      console.log(response);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new ApiError(errorData.message || `HTTP error! status: ${response.status}`, response.status, errorData)
      }
      console.log(response);

      const data = await response.json()
      return data
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }
      throw new ApiError(error instanceof Error ? error.message : "Network error occurred", 0)
    }
  }

  // Auth endpoints
  async login(credentials: { email: string; password: string; rememberMe?: boolean }) {
    return this.request<ApiResponse<{ user: any }>>("/users/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    })
  }

  async register(userData: { name: string; email: string; password: string; role?: string }) {
    return this.request<ApiResponse>("/users/register", {
      method: "POST",
      body: JSON.stringify(userData),
    })
  }

  async logout() {
    return this.request<ApiResponse>("/users/logout", {
      method: "POST",
    })
  }

  async getProfile() {
    return this.request<ApiResponse<{
      name: string
      email: string
      phone: string
    }>>("/users/profile")
  }

  async getCurrentUser(){
    return this.request<ApiResponse<{name: string; email: string; _id: string; role: "admin" | "driver" | "user";}>>("/users/getCurrentUser")
  }

  async updateProfile(data: { name: string; phone: string }) {
    return this.request<ApiResponse<{ user: any }>>("/users/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    })
  }


  async verifyEmail(token: string) {
    return this.request<ApiResponse>(`/users/verify-email?token=${token}`)
  }

  async forgotPassword(email: string) {
    return this.request<ApiResponse>("/users/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    })
  }

  async resetPassword(token: string, password: string) {
    return this.request<ApiResponse>(`/users/reset-password?token=${token}`, {
      method: "POST",
      body: JSON.stringify({ password }),
    })
  }

  // Bus endpoints
  async getBuses() {
    return this.request<ApiResponse<any[]>>("/buses")
  }

  async getBusById(busId: string) {
    return this.request<ApiResponse<Bus>>(`/buses/${busId}`)
  }

  async createBus(busData: any) {
    return this.request<ApiResponse>("/buses", {
      method: "POST",
      body: JSON.stringify(busData),
    })
  }

  async updateBus(busId: string, busData: any) {
    return this.request<ApiResponse>(`/buses/${busId}`, {
      method: "PUT",
      body: JSON.stringify(busData),
    })
  }

  async deleteBus(busId: string) {
    return this.request<ApiResponse>(`/buses/${busId}`, {
      method: "DELETE",
    })
  }

  async getBusByDriverEmail(email: string) {
    return this.request<ApiResponse<any>>(`/dashboard/bus-by-email?email=${email}`)
  }

  // Dashboard endpoints
  async getDashboardStats() {
    return this.request<ApiResponse<{ totalBuses: number; totalDrivers: number }>>("/dashboard/stats")
  }

  async getAllBusesForDashboard() {
    return this.request<ApiResponse<{ buses: any[] }>>("/dashboard/buses")
  }

  // Admin endpoints
  async getUsers() {
    return this.request<ApiResponse<any[]>>("/admin/users")
  }

  async createUser(userData: any) {
    return this.request<ApiResponse>("/admin/users", {
      method: "POST",
      body: JSON.stringify(userData),
    })
  }

  async updateUser(userId: string, userData: any) {
    return this.request<ApiResponse>(`/admin/users/${userId}`, {
      method: "PUT",
      body: JSON.stringify(userData),
    })
  }

  async deleteUser(userId: string) {
    return this.request<ApiResponse>(`/admin/users/${userId}`, {
      method: "DELETE",
    })
  }

  async getUserByEmail(email: string) {
    return this.request<ApiResponse<any>>(`/admin/users/${email}`)
  }

  async updatePassword(currentPassword: string, newPassword: string) {
    return this.request<ApiResponse>("/users/change-password", {
      method: "POST",
      body: JSON.stringify({ oldPassword: currentPassword, newPassword }),
    })
  }


}

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public details?: any,
  ) {
    super(message)
    this.name = "ApiError"
    // 👇 This ensures instanceof ApiError works correctly
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

export const apiService = new ApiService()
export { ApiError }
export type { ApiResponse }
