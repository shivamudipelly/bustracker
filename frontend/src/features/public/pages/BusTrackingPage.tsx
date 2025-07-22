import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { ArrowLeft, Clock, MapPin, User, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Map } from '@/components/Map';
import { Loading } from '@/components/Loading';
import { apiService as api, apiService } from '@/services/api';
import { Bus } from '@/types/driver';
import { useBusStore } from '@/stores/busStore';
import { toast } from "@/components/ui/sonner";
import { socketService } from '@/services/socket';

export const BusTrackingPage = () => {
  const { busId } = useParams<{ busId: string }>();
  const location = useLocation();
  const passedBus = location.state?.bus as Bus | undefined;

  const { buses } = useBusStore();
  const [bus, setBus] = useState<Bus | null>(passedBus ?? null);
  const [loading, setLoading] = useState(!passedBus);
  const [refreshing, setRefreshing] = useState(false);
  const locationUpdateRef = useRef<((data: { busId: string; lat: number; lng: number }) => void) | null>(null);

  console.log(bus);
  

  const loadBusData = async () => {
    if (!busId) return;
    try {
      setRefreshing(true);
      const res = await apiService.getBusById(busId);
      console.log("Bus data loaded:", res.data);
      
      if (res.success) 
        setBus(res.data);
    } catch (err) {
      console.error("Error loading bus:", err);
      toast.error('Failed to load bus data. Please try again later.');
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (bus) return; // Skip if passed via state
    const existingBus = buses.find(b => b._id === busId);
    if (existingBus) {
      setBus(existingBus);
      setLoading(false);
    } else {
      loadBusData().finally(() => setLoading(false));
    }
  }, [busId, buses]);

  useEffect(() => {
    if (!bus) return;

    // Connect and join the bus room
    socketService.connect();
    socketService.joinBusRoom(bus._id);

    // Listen for location updates
    const handleLocationUpdate = (data: { busId: string; lat: number; lng: number }) => {
      if (data.busId === bus._id) {
        setBus(prev => prev ? ({
          ...prev,
          location: {
            ...prev.location,
            latitude: data.lat,
            longitude: data.lng,
            timestamp: new Date().toISOString(),
          }
        }) : prev);
      }
    };
    locationUpdateRef.current = handleLocationUpdate;
    socketService.onBusLocationUpdate(handleLocationUpdate);

    // Cleanup on unmount
    return () => {
      socketService.leaveBusRoom(bus._id);
      socketService.offBusLocationUpdate(locationUpdateRef.current);
      socketService.disconnect();
    };
  }, [bus?._id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading message="Loading bus information..." />
      </div>
    );
  }

  if (!bus) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">Bus not found</h2>
          <Link to="/routes">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Routes
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'inactive':
        return 'bg-red-500';
      case 'maintenance':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <Link to="/routes">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Routes
            </Button>
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
  <div>
    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
      {bus.busId} - {bus.source} to {bus.destination}
    </h1>
    <p className="text-gray-600 mt-1">
      {bus.source} → {bus.destination}
    </p>
  </div>

  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
    <Badge className={`${getStatusColor(bus.status)} text-white`}>
      {bus.status?.charAt(0).toUpperCase() + bus.status.slice(1) || "Unknown"}
    </Badge>
    <Button
      variant="outline"
      size="sm"
      onClick={loadBusData}
      disabled={refreshing}
    >
      <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
      Refresh
    </Button>
  </div>
</div>

        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Live Location</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {bus.location ? (
                  <Map
                    center={{ lat: bus.location.latitude, lng: bus.location.longitude }}
                    buses={[{
                      id: bus._id,
                      routeNumber: bus.busId.toString(),
                      destination: bus.destination,
                      location: bus.location,
                      status: bus.status
                    }]}
                    height="500px"
                  />
                ) : (
                  <div className="h-96 flex items-center justify-center bg-gray-100 rounded-lg m-4">
                    <div className="text-center">
                      <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600">Location not available</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Bus Info */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Bus Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-3 text-gray-400" />
                  <div>
                    <p className="font-medium">Route</p>
                    <p className="text-sm text-gray-600">{bus.source} → {bus.destination}</p>
                  </div>
                </div>

                {bus.driverId.name && (
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-3 text-gray-400" />
                    <div>
                      <p className="font-medium">Driver</p>
                      <p className="text-sm text-gray-600">{bus.driverId.name}</p>
                      <p className="text-sm text-gray-600">{bus.driverId.email}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-3 text-gray-400" />
                  <div>
                    <p className="font-medium">Last Updated</p>
                    <p className="text-sm text-gray-600">
                      {new Date(bus.updatedAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-primary">{bus.capacity}</p>
                      <p className="text-xs text-gray-600">Capacity</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-primary">{bus.busType}</p>
                      <p className="text-xs text-gray-600">Type</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {bus.location && (
              <Card>
                <CardHeader>
                  <CardTitle>Current Position</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Latitude:</span>
                      <span className="font-mono">{bus.location.latitude.toFixed(6)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Longitude:</span>
                      <span className="font-mono">{bus.location.longitude.toFixed(6)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Updated:</span>
                      <span>{new Date(bus.location.timestamp).toLocaleTimeString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
