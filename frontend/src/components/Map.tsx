import type React from "react"
import { useEffect, useRef, useState } from "react"
import mapboxgl from "mapbox-gl"
import { Loader, AlertCircle } from "lucide-react"
import { environment } from "@/config/environment"
import "mapbox-gl/dist/mapbox-gl.css"

interface MapProps {
  center?: { lat: number; lng: number }
  zoom?: number
  buses?: Array<{
    id?: string
    busId?: string
    routeNumber?: string
    destination: string
    location: { latitude: number; longitude: number }
    status?: string
  }>
  selectedBusId?: string
  onBusClick?: (busId: string) => void
  height?: string
  className?: string
  showControls?: boolean
}

export const Map: React.FC<MapProps> = ({
  center = { lat: 28.6139, lng: 77.209 }, // Default to Delhi
  zoom = 12,
  buses = [],
  selectedBusId,
  onBusClick,
  height = "400px",
  className = "",
  showControls = true,
}) => {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const markersRef = useRef<Map<string, mapboxgl.Marker> | null>(new globalThis.Map())
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const accessToken = environment.get("MAPBOX_ACCESS_TOKEN")

  useEffect(() => {
    if (!accessToken) {
      setError("Mapbox access token is not configured")
      setIsLoading(false)
      return
    }

    if (map.current) return // Initialize map only once

    mapboxgl.accessToken = accessToken

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current!,
        style: "mapbox://styles/mapbox/streets-v12",
        center: [center.lng, center.lat],
        zoom: zoom,
        attributionControl: false,
      })

      if (showControls) {
        map.current.addControl(new mapboxgl.NavigationControl(), "top-right")
      }

      map.current.addControl(
        new mapboxgl.AttributionControl({
          compact: true,
        }),
      )

      map.current.on("load", () => {
        setIsLoading(false)
        setError(null)

        // Add bus markers if buses are available
        if (buses.length > 0) {
          updateBusMarkers()
        }
      })

      map.current.on("error", (e) => {
        console.error("Mapbox error:", e)
        setError("Failed to load map")
        setIsLoading(false)
      })
    } catch (err) {
      console.error("Error initializing Mapbox:", err)
      setError("Failed to initialize map")
      setIsLoading(false)
    }

    return () => {
      if (map.current) {
        map.current.remove()
        map.current = null
      }
    }
  }, [accessToken])

  useEffect(() => {
    if (map.current && !isLoading) {
      updateBusMarkers()
    }
  }, [buses, selectedBusId, isLoading])

  const createBusMarkerElement = (bus: any, isSelected: boolean) => {
    const el = document.createElement("div")
    el.className = `bus-marker ${isSelected ? "selected" : ""}`
    el.style.cssText = `
      width: ${isSelected ? "32px" : "24px"};
      height: ${isSelected ? "32px" : "24px"};
      background-color: ${getBusStatusColor(bus.status)};
      border: 3px solid white;
      border-radius: 50%;
      cursor: pointer;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: bold;
      color: white;
      position: relative;
    `

    // Add bus icon
    el.innerHTML = `
      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
        <path d="M4 16c0 .88.39 1.67 1 2.22V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V6h12v5z"/>
      </svg>
    `

    // Add pulse animation for selected bus
    if (isSelected) {
      el.style.animation = "pulse 2s infinite"
    }

    return el
  }

  const getBusStatusColor = (status?: string) => {
    switch (status) {
      case "active":
        return "#10b981" // green
      case "inactive":
        return "#ef4444" // red
      case "maintenance":
        return "#f59e0b" // yellow
      default:
        return "#3b82f6" // blue
    }
  }

  const updateBusMarkers = () => {
    if (!map.current) return

    // Clear existing markers
    markersRef.current.forEach((marker) => {
      marker.remove()
    })
    markersRef.current.clear()

    // Add new markers
    buses.forEach((bus) => {
      if (bus.location.latitude && bus.location.longitude) {
        const busId = bus.busId || bus.id || "unknown"
        const isSelected = busId === selectedBusId
        const el = createBusMarkerElement(bus, isSelected)

        const marker = new mapboxgl.Marker(el)
          .setLngLat([bus.location.longitude, bus.location.latitude])
          .addTo(map.current!)

        // Add click listener
        el.addEventListener("click", () => {
          if (onBusClick) {
            onBusClick(busId)
          }
        })

        // Add popup
        const popup = new mapboxgl.Popup({
          offset: 25,
          closeButton: false,
          closeOnClick: false,
        }).setHTML(`
          <div class="p-3 min-w-[200px]">
            <div class="flex items-center justify-between mb-2">
              <h3 class="font-semibold text-gray-900">Bus ${bus.routeNumber || busId}</h3>
              <span class="px-2 py-1 text-xs rounded-full text-white" style="background-color: ${getBusStatusColor(bus.status)}">
                ${bus.status || "active"}
              </span>
            </div>
            <p class="text-sm text-gray-600 mb-2">${bus.destination}</p>
            <div class="text-xs text-gray-500 space-y-1">
              <div>Lat: ${bus.location.latitude.toFixed(6)}</div>
              <div>Lng: ${bus.location.longitude.toFixed(6)}</div>
              <div>Updated: ${new Date().toLocaleTimeString()}</div>
            </div>
          </div>
        `)

        marker.setPopup(popup)

        // Show popup on hover
        el.addEventListener("mouseenter", () => {
          popup.addTo(map.current!)
        })

        el.addEventListener("mouseleave", () => {
          popup.remove()
        })

        markersRef.current.set(busId, marker)
      }
    })

    // Adjust map bounds to show all buses
    if (buses.length > 0) {
      const coordinates = buses
        .filter((bus) => bus.location.latitude && bus.location.longitude)
        .map((bus) => [bus.location.longitude, bus.location.latitude] as [number, number])

      if (coordinates.length > 0) {
        const bounds = coordinates.reduce(
          (bounds, coord) => bounds.extend(coord),
          new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]),
        )

        map.current!.fitBounds(bounds, {
          padding: 50,
          maxZoom: 15,
        })
      }
    }
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 rounded-lg ${className}`} style={{ height }}>
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
          <p className="text-red-600 font-medium">Map Error</p>
          <p className="text-sm text-gray-600 mt-1">{error}</p>
          {!accessToken && (
            <p className="text-xs text-gray-500 mt-2">
              Please set VITE_MAPBOX_ACCESS_TOKEN in your environment variables
            </p>
          )}
        </div>
      </div>
    )
  }



  return (
    <div className={`relative rounded-lg overflow-hidden ${className}`} style={{ height }}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
          <div className="text-center">
            <Loader className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
            <p className="text-sm text-gray-600 mt-2">Loading map...</p>
          </div>
        </div>
      )}

      {/* Fix: This container now stretches properly */}
      <div
        ref={mapContainer}
        style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}
      />

      {/* Keep your style block for animations */}
      <style>{`
        @keyframes pulse {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.8;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        
        .bus-marker:hover {
          transform: scale(1.1);
        }
        
        .bus-marker.selected {
          z-index: 1000;
        }
      `}</style>
    </div>
  );

}
