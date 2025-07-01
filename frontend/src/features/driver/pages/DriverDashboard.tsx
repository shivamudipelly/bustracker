import { useState, useEffect } from 'react';
import { Bus, MapPin, Clock, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/stores/authStore';
import { apiService } from '@/services/api';
import { useBusStore } from '@/stores/busStore';
import { toast } from '@/components/ui/sonner';
import { Bus as IBus } from '@/types/driver';

export const DriverDashboard = () => {
  const { user, getProfile } = useAuthStore();
  const { getBusByDriverEmail, buses } = useBusStore();
  const [assignedBus, setAssignedBus] = useState<IBus>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  console.log(user, assignedBus);
  
  useEffect(() => {
    const fetchAssignedBus = async () => {
      if (!user?.email) return;
      setIsLoading(true);
      setError(null);
      try {
        const bus = await apiService.getBusByDriverEmail(user.email)
        console.log(bus);
        
        if (bus) {
          setAssignedBus(bus.data);
        } else {
          setAssignedBus(null);
          setError('No bus assigned to your account.');
        }
      } catch (err) {
        setError('Failed to load assigned bus.');
        setAssignedBus(null);
        toast.error('Failed to load assigned bus.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchAssignedBus();
  }, [user]);

  console.log(user);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="text-lg text-gray-500">Loading...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Driver Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back, {user?.name}!</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Status</CardTitle>
              <Bus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">Active</div>
              <p className="text-xs text-muted-foreground">Currently on duty</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Route</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {assignedBus?.busId || 'N/A'}
              </div>
              <p className="text-xs text-muted-foreground">Assigned route</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Shift Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8h 30m</div>
              <p className="text-xs text-muted-foreground">Today's shift</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Passengers</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">124</div>
              <p className="text-xs text-muted-foreground">Today's count</p>
            </CardContent>
          </Card>
        </div>

        {error && (
          <Card>
            <CardContent className="text-center py-12">
              <Bus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Bus Assigned</h3>
              <p className="text-gray-600">
                {error}
              </p>
            </CardContent>
          </Card>
        )}
        {!error && assignedBus && (
          <Card>
            <CardHeader>
              <CardTitle>Assigned Bus Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg mb-2">
                      {assignedBus.busId || assignedBus.busId} - {assignedBus.source || assignedBus.destination}
                    </h3>
                    <p className="text-gray-600">
                      {assignedBus.source} → {assignedBus.destination}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Status:</span>
                    <Badge className={assignedBus.status === 'active' ? 'bg-green-500' : 'bg-red-500'}>
                      {assignedBus.status}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Capacity:</span>
                      <p className="font-medium">{assignedBus.capacity} passengers</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Bus Type:</span>
                      <p className="font-medium">{assignedBus.busType}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-3">Quick Actions</h4>
                  <div className="space-y-2">
                    <a href="/driver/tracker" className="block w-full text-left bg-primary text-white px-4 py-2 rounded hover:bg-primary/90 transition-colors">
                      Start Location Tracking
                    </a>
                    <button className="block w-full text-left bg-gray-200 px-4 py-2 rounded hover:bg-gray-300 transition-colors">
                      Report Issue
                    </button>
                    <button className="block w-full text-left bg-gray-200 px-4 py-2 rounded hover:bg-gray-300 transition-colors">
                      End Shift
                    </button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
