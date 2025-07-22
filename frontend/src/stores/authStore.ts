import { create } from "zustand"
import { persist } from "zustand/middleware"
import { apiService } from "@/services/api"
import { toast } from "sonner"

interface User {
  name: string
  email: string
  role: "admin" | "driver" | "user"
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null

  // Actions
  login: (credentials: User) => Promise<void>
  logout: () => Promise<void>
  getProfile: () => Promise<void>

  clearError: () => void
  setLoading: (loading: boolean) => void
  initAuth: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (credentials) => {

        set({
          user: credentials,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      },

      logout: async () => {
        set({ isLoading: true })

        try {
          await apiService.logout()
        } catch (error) {
          console.error("Logout error:", error)
        } finally {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          })
          toast.success("Logged out successfully")
        }
      },

      getProfile: async () => {
        if (!get().isAuthenticated) return

        set({ isLoading: true, error: null })

        try {
          if (get().isAuthenticated) {
            set({ user: get().user, isAuthenticated: true, isLoading: false, error: null })
          } else {
            const response = await apiService.getCurrentUser()
            
            if (response.success && response.data) {
              set({
                user: {
                  name: response.data.name,
                  email: response.data.email,
                  role: response.data.role,
                },
                isAuthenticated: true,
                isLoading: false,
              })
            } else {
              throw new Error("Failed to get profile")
            }
          }
        } catch (error) {
          console.error("Profile fetch error:", error)
          // If unauthorized, clear auth state
          if (error.status === 401) {
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: null,
            })
          } else {
            set({ error: error.message, isLoading: false })
          }
        }
      },


      clearError: () => set({ error: null }),
      setLoading: (loading) => set({ isLoading: loading }),

      // Add initAuth to initialize auth state on app load
      initAuth: async () => {
        try {
          await get().getProfile();
        } catch (e) {
          set({ user: null, isAuthenticated: false });
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
)

// At the end, export initAuth for use in App.tsx
export const { initAuth } = useAuthStore.getState();
