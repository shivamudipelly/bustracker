import type React from "react"
import { useState, useEffect } from "react"
import { useAuthStore } from "@/stores/authStore"
import { useBusStore } from "@/stores/busStore"
import { socketService } from "@/services/socket"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Map } from "@/components/Map"
import { MapPin, Navigation, Clock, AlertCircle, Play, Square, Loader } from "lucide-react"
import { toast } from "@/components/ui/sonner"
import { Bus } from "@/types/driver"
import { apiService } from '@/services/api';

export const DriverTracker: React.FC = () => {
  const { user } = useAuthStore()

  const [bus, setBus] = useState<Bus | null>(null)
  const [isTracking, setIsTracking] = useState(false)
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [watchId, setWatchId] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [busError, setBusError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAssignedBus = async () => {
      if (!user?.email) return;
      setIsLoading(true);
      setBusError(null);

      // Try from localStorage first
      const cachedBus = localStorage.getItem(`assignedBus_${user.email}`);
      if (cachedBus) {
        try {
          const parsedBus = JSON.parse(cachedBus);
          setBus(parsedBus);
          setIsLoading(false);
          return;
        } catch {
          localStorage.removeItem(`assignedBus_${user.email}`); // clear corrupted data
        }
      }

      // Fallback to API call
      try {
        const response = await apiService.getBusByDriverEmail(user.email);
        if (response?.data) {
          setBus(response.data);
          localStorage.setItem(`assignedBus_${user.email}`, JSON.stringify(response.data));
        } else {
          setBus(null);
          setBusError("No bus assigned to your account.");
        }
      } catch (err) {
        setBusError("Failed to load assigned bus.");
        toast.error("Failed to load assigned bus.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssignedBus();
  }, [user]);


  useEffect(() => {
    return () => {
      if (isTracking) {
        socketService.disconnect()
      }
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId)
      }
    }
  }, [isTracking, watchId])

  const startTracking = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by this browser")
      return
    }

    if (!bus) {
      toast.error("No bus assigned")
      return
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    }

    const successCallback = (position: GeolocationPosition) => {
      const { latitude, longitude } = position.coords
      const newLocation = { lat: latitude, lng: longitude }

      setCurrentLocation(newLocation)
      setLocationError(null)
      console.log(bus.busId, latitude, longitude);

      socketService.updateLocation(String(bus.busId), latitude, longitude)
    }

    const errorCallback = (error: GeolocationPositionError) => {
      let errorMessage = "Failed to get location"
      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage = "Location access denied. Please enable location permissions."
          break
        case error.POSITION_UNAVAILABLE:
          errorMessage = "Location unavailable."
          break
        case error.TIMEOUT:
          errorMessage = "Location request timed out."
          break
      }
      setLocationError(errorMessage)
      toast.error(errorMessage)
    }

    // Connect to socket and join room
    socketService.connect()
    socketService.joinBusRoom(String(bus.busId), "driver")

    // Get and send initial position
    navigator.geolocation.getCurrentPosition(successCallback, errorCallback, options)

    // Start watching position
    const id = navigator.geolocation.watchPosition(successCallback, errorCallback, options)
    setWatchId(id)
    setIsTracking(true)

    toast.success("Location tracking started")
  }

  const stopTracking = () => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId)
      setWatchId(null)
    }
    socketService.disconnect()
    setIsTracking(false)

    toast.success("Location tracking stopped")
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (busError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-yellow-500 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Bus Error</h2>
            <p className="text-gray-600 text-center">{busError}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Location Tracker</h1>
          <p className="text-gray-600">Track and share your bus location in real-time</p>
        </div>
        <div className="flex items-center gap-2">
          {isTracking ? (
            <Button onClick={stopTracking} variant="destructive" className="flex items-center gap-2">
              <Square className="h-4 w-4" />
              Stop Tracking
            </Button>
          ) : (
            <Button onClick={startTracking} className="flex items-center gap-2">
              <Play className="h-4 w-4" />
              Start Tracking
            </Button>
          )}
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex justify-between pb-2">
            <CardTitle className="text-sm font-medium">Bus Information</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Bus {bus.busId}</div>
            <p className="text-xs text-muted-foreground">{bus.destination}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex justify-between pb-2">
            <CardTitle className="text-sm font-medium">Tracking Status</CardTitle>
            <Navigation className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Badge variant={isTracking ? "default" : "secondary"}>
              {isTracking ? "Active" : "Inactive"}
            </Badge>
            <p className="text-xs text-muted-foreground mt-1">
              {isTracking ? "Location is being shared" : "Location sharing is off"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex justify-between pb-2">
            <CardTitle className="text-sm font-medium">Current Location</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {currentLocation ? (
              <div>
                <div className="text-sm font-mono">
                  {currentLocation.lat}, {currentLocation.lng}
                </div>
                <p className="text-xs text-muted-foreground">Updated: {new Date().toLocaleTimeString()}</p>
              </div>
            ) : (
              <div className="text-sm text-gray-500">No location data</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Error */}
      {locationError && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="flex items-center gap-3 pt-6">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <div>
              <p className="text-red-800 font-medium">Location Error</p>
              <p className="text-red-600 text-sm">{locationError}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Live Map */}
      <Card>
        <CardHeader>
          <CardTitle>Live Location</CardTitle>
          <CardDescription>Your current location on the map</CardDescription>
        </CardHeader>
        <CardContent>
          <Map
            center={currentLocation || { lat: 17.4194688, lng: 78.6333696 }}
            zoom={15}
            buses={
              currentLocation
                ? [{
                  busId: String(bus.busId),
                  destination: bus.destination,
                  location: {
                    latitude: currentLocation.lat,
                    longitude: currentLocation.lng,
                  }
                }]
                : []
            }
            height="400px"
            className="rounded-lg"
          />
        </CardContent>
      </Card>
    </div>
  )
}
