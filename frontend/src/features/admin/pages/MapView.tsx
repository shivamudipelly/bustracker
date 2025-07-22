import { useState, useEffect } from 'react';
import { MapPin, Bus, Users, Navigation, Layers, Search, Maximize, Minimize } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useBusStore } from '@/stores/busStore';
import { Map } from '@/components/Map';
import { Bus as BusType } from '@/types/driver';
import { apiService } from '@/services/api';


export const MapView = () => {
  const { buses, setBuses } = useBusStore();
  const [selectedBus, setSelectedBus] = useState<BusType | null>(null);
  const [mapStyle, setMapStyle] = useState('streets');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchBuses = async () => {
      if (!buses || buses.length === 0) {
        const data = await apiService.getBuses();
        setBuses(data.data)

      }
    };
    fetchBuses();
  }, []);

  const activeBuses = buses.filter(bus => bus.status === 'active' && bus.location);

  const filteredBuses = activeBuses.filter(bus => {
    const query = searchTerm.toLowerCase();
    return (
      bus.busId?.toString().toLowerCase().includes(query) ||
      `${bus.source} to ${bus.destination}`.toLowerCase().includes(query)
    );
  });

  const mapCenter = selectedBus?.location
    ? { lat: selectedBus.location.latitude, lng: selectedBus.location.longitude }
    : { lat: 17.385, lng: 78.4867 };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Live Map View
            </h1>
            <p className="text-gray-600 mt-2 text-lg">Real-time tracking of all active buses</p>
          </div>
          <div className="flex space-x-3">
            <Button onClick={() => setIsFullscreen(!isFullscreen)} variant="outline">
              {isFullscreen ? <Minimize className="mr-2 h-4 w-4" /> : <Maximize className="mr-2 h-4 w-4" />}
              {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            </Button>
            <Button onClick={() => selectedBus && setSelectedBus(null)}>
              <Navigation className="mr-2 h-4 w-4" />
              Center Map
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {[
            { title: 'Active Buses', value: activeBuses.length, icon: Bus, color: 'green' },
            { title: 'Total Drivers', value: new Set(activeBuses.map(b => b.driverId)).size, icon: Users, color: 'blue' },
            { title: 'Routes Covered', value: new Set(activeBuses.map(b => b.busId)).size, icon: MapPin, color: 'purple' }
          ].map((stat, index) => (
            <Card key={index} className={`bg-${stat.color}-50 border-${stat.color}-200 border-2 shadow`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{stat.title}</p>
                    <p className="text-3xl font-bold">{stat.value}</p>
                  </div>
                  <div className="p-3 bg-white rounded-xl shadow">
                    <stat.icon className={`h-6 w-6 text-${stat.color}-600`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Search className="mr-2 h-5 w-5" />
                  Search Buses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <input
                  type="text"
                  placeholder="Route number or name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </CardContent>
            </Card>

            {/* <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Layers className="mr-2 h-5 w-5" />
                  Map Style
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {['streets', 'satellite', 'light', 'dark'].map(style => (
                    <Button
                      key={style}
                      onClick={() => setMapStyle(style)}
                      variant={mapStyle === style ? 'default' : 'outline'}
                      size="sm"
                      className="capitalize"
                    >
                      {style}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card> */}

            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg">Active Buses</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 max-h-96 overflow-y-auto">
                {filteredBuses.map(bus => (
                  <div
                    key={bus._id}
                    onClick={() => setSelectedBus(bus)}
                    className={`p-3 rounded border cursor-pointer hover:shadow-md ${selectedBus?._id === bus._id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                  >
                    <p className="font-semibold text-sm">{bus.busId}</p>
                    <p className="text-xs text-gray-600">{bus.source} → {bus.destination}</p>
                    <Badge className="bg-green-500 text-white text-xs mt-1">{bus.status}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-3">
            <Card className={`overflow-hidden shadow-lg ${isFullscreen ? 'fixed inset-4 z-50' : ''}`}>
              <CardContent className="p-0">
                <Map
                  center={mapCenter}
                  height={isFullscreen ? '100%' : '600px'}
                  selectedBusId={selectedBus?._id}
                  buses={filteredBuses.map(bus => ({
                    id: bus._id,
                    routeNumber: bus.busId?.toString(),
                    destination: bus.destination,
                    location: bus.location,
                    status: bus.status
                  }))}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};