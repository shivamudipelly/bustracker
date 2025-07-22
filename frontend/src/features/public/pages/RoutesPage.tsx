import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BusCard } from '../components/BusCard';
import { Loading } from '@/components/Loading';
import { useBusStore } from '@/stores/busStore';
import { apiService as api } from '@/services/api';
import { Bus } from '@/types/driver';
import { toast } from "@/components/ui/sonner";


export interface Location {
  latitude: number;
  longitude: number;
  timestamp: string;
}

export interface Stop {
  name: string;
  coordinates: [number, number];
}

export interface Driver {
  _id: string;
  name: string;
  email: string;
}

export interface BackendBus {
  _id: string; // MongoDB ID
  busId: number;
  destination: string;
  source: string;
  driverId: Driver; // now this is full object, not just a string
  status: 'active' | 'inactive' | 'maintenance';
  location: Location;
  stops: Stop[];
  capacity: number;
  busType: 'standard' | 'deluxe' | 'mini' | 'AC';
  createdAt: string;
  updatedAt: string;
}




export const RoutesPage = () => {
  const { buses, setBuses } = useBusStore();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [filteredBuses, setFilteredBuses] = useState<Bus[]>([]);

  useEffect(() => {
    const loadBuses = async () => {
      try {
        const busData = await api.getBuses();
        console.log(busData);
        const formatTime = (isoString: string): string => {
          const date = new Date(isoString);
          return date.toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
          });
        };



        const transformed = busData.data.map((bus: BackendBus): Bus => ({
          _id: bus._id,
          busId: bus.busId,
          source: 'Anurag University',
          destination: bus.destination,
          status: bus.status || 'inactive',
          location: bus.location,
          stops: bus.stops || [],
          capacity: bus.capacity,
          busType: bus.busType,
          updatedAt: bus.updatedAt ? formatTime(bus.updatedAt) : 'N/A',
          driverId: { ...bus.driverId },
          createdAt: bus.createdAt ? formatTime(bus.createdAt) : 'N/A'
        }));

        setBuses(transformed);
      } catch (error) {
        console.error('Failed to load buses:', error);
        toast.error('Failed to load buses. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadBuses();
  }, [setBuses]);



  useEffect(() => {
    let filtered = buses;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(bus =>
        bus.busId.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
        (bus.source + bus.destination).toLowerCase().includes(searchTerm.toLowerCase()) ||
        bus.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bus.destination.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(bus => bus.status === statusFilter);
    }

    setFilteredBuses(filtered);
  }, [buses, searchTerm, statusFilter]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading message="Loading bus routes..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Bus Routes</h1>
          <p className="text-gray-600 mb-6">
            Track all available buses in real-time. Click on any active bus to view its live location.
          </p>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search routes, destinations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Buses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Results count */}
          <p className="text-sm text-gray-500 mb-6">
            Showing {filteredBuses.length} of {buses.length} buses
          </p>
        </div>

        {/* Bus Grid */}
        {filteredBuses.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No buses found matching your criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBuses.map((bus) => (
              <BusCard key={bus._id} bus={bus} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
