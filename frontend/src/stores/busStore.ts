import { create } from "zustand"
import { apiService } from "@/services/api"
import { socketService } from "@/services/socket"
import { toast } from "sonner"
import { Bus } from "@/types/driver"

// interface Bus {
//   _id: string;
//   busId: string;
//   destination: string;
//   driverId: {
//     _id: string;
//     name: string;
//     email: string;
//     role: "DRIVER" | "ADMIN" | "USER";
//   };
//   location: {
//     latitude: number;
//     longitude: number;
//     timestamp: string;
//   };
//   stops: Array<{
//     name: string;
//     coordinates: [number, number];
//   }>;
//   status: 'active' | 'inactive' | 'maintenance';
//   updatedAt: string;
//   capacity: number;
//   busType: string;
// }


interface BusState {
  buses: Bus[]
  selectedBus: Bus | null
  isLoading: boolean
  error: string | null
  dashboardStats: {
    totalBuses: number
    totalDrivers: number
  } | null

  // Actions
  fetchBuses: () => Promise<void>
  fetchBusById: (busId: string) => Promise<void>
  createBus: (busData: Bus) => Promise<boolean>
  updateBus: (busId: string, busData: Bus) => Promise<boolean>
  deleteBus: (busId: string) => Promise<boolean>
  fetchDashboardStats: () => Promise<void>
  getBusByDriverEmail: (email: string) => Promise<Bus | null>

  setBuses: (buses: Bus[]) => void

  // Real-time updates
  subscribeToLocationUpdates: (busId: string) => void
  unsubscribeFromLocationUpdates: (busId: string) => void
  updateBusLocation: (busId: string, lat: number, lng: number) => void

  // Utility
  clearError: () => void
  setLoading: (loading: boolean) => void
  setSelectedBus: (bus: Bus | null) => void
}

export const useBusStore = create<BusState>((set, get) => ({
  buses: [],
  selectedBus: null,
  isLoading: false,
  error: null,
  dashboardStats: null,

  fetchBuses: async () => {
    set({ isLoading: true, error: null })

    try {
      const response = await apiService.getBuses();
      console.log(response);
      
      if (response.success && response.data) {
        set({ buses: response.data, isLoading: false })
      } else {
        throw new Error(response.message || "Failed to fetch buses")
      }
    } catch (error: any) {
      const errorMessage = error.message || "Failed to fetch buses"
      set({ error: errorMessage, isLoading: false })
      toast.error(errorMessage)
    }
  },

  fetchBusById: async (busId) => {
    set({ isLoading: true, error: null })

    try {
      const response = await apiService.getBusById(busId)
      console.log("Fetched bus data:", response);
      
      if (response.success && response.data) {
        set({ selectedBus: response.data, isLoading: false })
      } else {
        throw new Error(response.message || "Bus not found")
      }
    } catch (error: any) {
      const errorMessage = error.message || "Failed to fetch bus"
      set({ error: errorMessage, isLoading: false })
      toast.error(errorMessage)
    }
  },

  createBus: async (busData) => {
    set({ isLoading: true, error: null })

    try {
      const response = await apiService.createBus(busData)

      if (response.success) {
        set({ isLoading: false })
        toast.success(response.message || "Bus created successfully!")

        // Refresh buses list
        get().fetchBuses()
        return true
      }

      throw new Error(response.message || "Failed to create bus")
    } catch (error: any) {
      const errorMessage = error.message || "Failed to create bus"
      set({ error: errorMessage, isLoading: false })
      toast.error(errorMessage)
      return false
    }
  },

  updateBus: async (busId, busData) => {
    set({ isLoading: true, error: null })

    try {
      const response = await apiService.updateBus(busId, busData)

      if (response.success) {
        set({ isLoading: false })
        toast.success(response.message || "Bus updated successfully!")

        // Refresh buses list
        get().fetchBuses()
        return true
      }

      throw new Error(response.message || "Failed to update bus")
    } catch (error: any) {
      const errorMessage = error.message || "Failed to update bus"
      set({ error: errorMessage, isLoading: false })
      toast.error(errorMessage)
      return false
    }
  },

  deleteBus: async (busId) => {
    set({ isLoading: true, error: null })

    try {
      const response = await apiService.deleteBus(busId)

      if (response.success) {
        set({ isLoading: false })
        toast.success(response.message || "Bus deleted successfully!")

        // Refresh buses list
        get().fetchBuses()
        return true
      }

      throw new Error(response.message || "Failed to delete bus")
    } catch (error: any) {
      const errorMessage = error.message || "Failed to delete bus"
      set({ error: errorMessage, isLoading: false })
      toast.error(errorMessage)
      return false
    }
  },


  fetchDashboardStats: async () => {
    try {
      const response = await apiService.getDashboardStats()

      if (response.success && response.data) {
        set({ dashboardStats: response.data })
      }
    } catch (error: any) {
      console.error("Failed to fetch dashboard stats:", error)
    }
  },

  getBusByDriverEmail: async (email) => {
    try {
      const response = await apiService.getBusByDriverEmail(email)

      if (response.success && response.data) {
        return response.data
      }

      return null
    } catch (error: any) {
      console.error("Failed to fetch bus by driver email:", error)
      return null
    }
  },

  subscribeToLocationUpdates: (busId) => {
    const socket = socketService.connect()
    socketService.joinBusRoom(busId)

    const handleLocationUpdate = (data: { busId: string; lat: number; lng: number }) => {
      if (data.busId === busId) {
        set((state) => ({
          buses: state.buses.map((bus) =>
            bus._id === data.busId
              ? {
                ...bus,
                location: {
                  latitude: data.lat,
                  longitude: data.lng,
                  timestamp: new Date().toISOString(),
                },
              }
              : bus,
          ),
          selectedBus:
            state.selectedBus._id === data.busId
              ? {
                ...state.selectedBus,
                location: {
                  latitude: data.lat,
                  longitude: data.lng,
                  timestamp: new Date().toISOString(),
                },
              }
              : state.selectedBus,
        }))
      }
    }

    socketService.onBusLocationUpdate(handleLocationUpdate)
  },

  unsubscribeFromLocationUpdates: (busId) => {
    socketService.leaveBusRoom(busId)
    socketService.offBusLocationUpdate()
  },

  updateBusLocation: (busId, lat, lng) => {
    socketService.updateLocation(busId, lat, lng)
  },
  setBuses: (buses) => set({ buses }),


  clearError: () => set({ error: null }),
  setLoading: (loading) => set({ isLoading: loading }),
  setSelectedBus: (bus) => set({ selectedBus: bus }),
}))
