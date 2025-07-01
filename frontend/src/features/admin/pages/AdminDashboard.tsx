import { useState, useEffect } from 'react';
import { Bus, Users, MapPin, AlertTriangle, Plus, BarChart3, TrendingUp, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useBusStore } from '@/stores/busStore';
import { apiService } from '@/services/api';
import { Bus as IBus } from '@/types/driver';

export const AdminDashboard = () => {
  const { buses, setBuses } = useBusStore();
  const [loading, setLoading] = useState(true);
  const [animatedStats, setAnimatedStats] = useState({
    totalBuses: 0,
    activeBuses: 0,
    driversOnline: 0,
    maintenanceBuses: 0
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const busData = await apiService.getAllBusesForDashboard();
        console.log(busData);
        
        setBuses(busData.data as unknown as IBus[]);
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [setBuses]);

  const activeBuses = buses.filter(bus => bus.status === 'active').length;
  const inactiveBuses = buses.filter(bus => bus.status === 'inactive').length;
  const maintenanceBuses = buses.filter(bus => bus.status === 'maintenance').length;

  // Animate stats when data loads
  useEffect(() => {
    if (!loading) {
      const animateValue = (start: number, end: number, setter: (value: number) => void) => {
        const duration = 1000;
        const startTime = Date.now();

        const animate = () => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const easeOut = 1 - Math.pow(1 - progress, 3);
          const current = Math.round(start + (end - start) * easeOut);

          setter(current);

          if (progress < 1) {
            requestAnimationFrame(animate);
          }
        };

        requestAnimationFrame(animate);
      };

      animateValue(0, buses.length, (value) =>
        setAnimatedStats(prev => ({ ...prev, totalBuses: value }))
      );
      setTimeout(() => animateValue(0, activeBuses, (value) =>
        setAnimatedStats(prev => ({ ...prev, activeBuses: value }))
      ), 200);
      setTimeout(() => animateValue(0, activeBuses, (value) =>
        setAnimatedStats(prev => ({ ...prev, driversOnline: value }))
      ), 400);
      setTimeout(() => animateValue(0, maintenanceBuses, (value) =>
        setAnimatedStats(prev => ({ ...prev, maintenanceBuses: value }))
      ), 600);
    }
  }, [loading, buses.length, activeBuses, maintenanceBuses]);

  const stats = [
    {
      title: 'Total Buses',
      value: animatedStats.totalBuses,
      icon: Bus,
      color: 'text-blue-600',
      bgColor: 'bg-gradient-to-br from-blue-50 to-blue-100',
      borderColor: 'border-blue-200',
      trend: '+12%',
      trendUp: true
    },
    {
      title: 'Active Buses',
      value: animatedStats.activeBuses,
      icon: MapPin,
      color: 'text-green-600',
      bgColor: 'bg-gradient-to-br from-green-50 to-green-100',
      borderColor: 'border-green-200',
      trend: '+8%',
      trendUp: true
    },
    {
      title: 'Drivers Online',
      value: animatedStats.driversOnline,
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-gradient-to-br from-purple-50 to-purple-100',
      borderColor: 'border-purple-200',
      trend: '+5%',
      trendUp: true
    },
    {
      title: 'Maintenance',
      value: animatedStats.maintenanceBuses,
      icon: AlertTriangle,
      color: 'text-yellow-600',
      bgColor: 'bg-gradient-to-br from-yellow-50 to-yellow-100',
      borderColor: 'border-yellow-200',
      trend: '-3%',
      trendUp: false
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-300 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Admin Dashboard
              </h1>
              <p className="text-gray-600 mt-2 text-lg">Monitor and manage your bus fleet</p>
            </div>
            <div className="flex gap-3">
              <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <Plus className="mr-2 h-4 w-4" />
                Add Bus
              </Button>
              <Button variant="outline" className="border-2 hover:bg-gray-50 transition-all duration-300">
                <BarChart3 className="mr-2 h-4 w-4" />
                Reports
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card
              key={index}
              className={`${stat.bgColor} ${stat.borderColor} border-2 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 animate-scale-in`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">{stat.title}</CardTitle>
                <div className={`p-3 rounded-xl bg-white/50 shadow-sm`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="flex items-center text-sm">
                  <TrendingUp className={`h-4 w-4 mr-1 ${stat.trendUp ? 'text-green-600' : 'text-red-600 rotate-180'}`} />
                  <span className={stat.trendUp ? 'text-green-600' : 'text-red-600'}>
                    {stat.trend}
                  </span>
                  <span className="text-gray-500 ml-1">from last week</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Bus Status Overview */}
          <Card className="lg:col-span-2 shadow-lg border-0 bg-white/80 backdrop-blur-sm animate-fade-in">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-semibold">Live Bus Status</CardTitle>
                <Badge className="bg-green-100 text-green-800">Real-time</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {buses.slice(0, 6).map((bus, index) => (
                  <div
                    key={bus._id}
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg hover:from-gray-100 hover:to-gray-200 transition-all duration-300 transform hover:scale-102 animate-slide-in-right"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${bus.status === 'active' ? 'bg-green-500 animate-pulse' :
                          bus.status === 'maintenance' ? 'bg-yellow-500' : 'bg-red-500'
                        }`}></div>
                      <div>
                        <p className="font-semibold text-gray-900">{bus.busId} - {bus.source} to {bus.destination}</p>
                        <p className="text-sm text-gray-600">{bus.source} → {bus.destination}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge
                        className={`${bus.status === 'active' ? 'bg-green-500 hover:bg-green-600' :
                            bus.status === 'maintenance' ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-red-500 hover:bg-red-600'
                          } text-white transition-colors duration-200`}
                      >
                        {bus.status}
                      </Badge>
                      <Clock className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm animate-fade-in">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4">
                <a href="/admin/buses" className="block group">
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg hover:from-blue-100 hover:to-blue-200 transition-all duration-300 cursor-pointer transform hover:scale-105 hover:shadow-md">
                    <Bus className="h-8 w-8 text-blue-600 mb-3 group-hover:scale-110 transition-transform duration-200" />
                    <h3 className="font-semibold text-gray-900 mb-1">Manage Buses</h3>
                    <p className="text-sm text-gray-600">Add, edit, or remove buses from fleet</p>
                  </div>
                </a>

                <a href="/admin/users" className="block group">
                  <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg hover:from-green-100 hover:to-green-200 transition-all duration-300 cursor-pointer transform hover:scale-105 hover:shadow-md">
                    <Users className="h-8 w-8 text-green-600 mb-3 group-hover:scale-110 transition-transform duration-200" />
                    <h3 className="font-semibold text-gray-900 mb-1">Manage Users</h3>
                    <p className="text-sm text-gray-600">User roles and permissions</p>
                  </div>
                </a>

                <a href="/admin/map" className="block group">
                  <div className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg hover:from-purple-100 hover:to-purple-200 transition-all duration-300 cursor-pointer transform hover:scale-105 hover:shadow-md">
                    <MapPin className="h-8 w-8 text-purple-600 mb-3 group-hover:scale-110 transition-transform duration-200" />
                    <h3 className="font-semibold text-gray-900 mb-1">Live Map</h3>
                    <p className="text-sm text-gray-600">View all buses on interactive map</p>
                  </div>
                </a>

                <div className="p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg hover:from-yellow-100 hover:to-yellow-200 transition-all duration-300 cursor-pointer transform hover:scale-105 hover:shadow-md group">
                  <AlertTriangle className="h-8 w-8 text-yellow-600 mb-3 group-hover:scale-110 transition-transform duration-200" />
                  <h3 className="font-semibold text-gray-900 mb-1">System Alerts</h3>
                  <p className="text-sm text-gray-600">View notifications and warnings</p>
                  <Badge className="mt-2 bg-red-500">3 New</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
