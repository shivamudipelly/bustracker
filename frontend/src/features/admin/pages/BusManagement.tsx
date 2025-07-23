import { useState, useEffect } from 'react';
import { Plus, Search, Filter, Edit, Trash2, MapPin, Users, Settings, Clock, Bus as BusIcon, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AddBusModal } from '../components/AddBusModal';
import { EditBusModal } from '../components/EditBusModal';
import { apiService } from '@/services/api';
import { Bus as IBus } from '@/types/driver';
import { toast } from '@/components/ui/sonner';
import { ConfirmDeleteModal } from '../components/ConfirmDeleteModal';

export const BusManagement = () => {
  const [buses, setBuses] = useState<IBus[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBus, setEditingBus] = useState<IBus | null>(null);
  const [busToDelete, setBusToDelete] = useState<IBus | null>(null); // State for the confirmation modal

  // Function to fetch bus data from the API
  const fetchBuses = async () => {
    setLoading(true);
    try {
      const response = await apiService.getAllBusesForDashboard();
      if (response.success && Array.isArray(response.data)) {
        setBuses(response.data as IBus[]);
      } else {
        toast.error('Failed to load buses. Please try again later.');
        setBuses([]);
      }
    } catch (error) {
      console.error("Error fetching buses:", error);
      toast.error('An error occurred while fetching buses.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuses();
  }, []);

  // Handler to be called when a new bus is successfully added
  const handleBusAdded = () => {
    fetchBuses();
  };

  // ✅ This function is called when the user confirms the deletion in the modal
  const handleConfirmDelete = async () => {
    if (!busToDelete) return;

    try {
      const response = await apiService.deleteBus(busToDelete._id);
      if (response.success) {
        toast.success(response.message || "Bus deleted successfully!");
        fetchBuses(); // Refresh the list
      } else {
        toast.error(response.message || "Failed to delete bus.");
      }
    } catch (error) {
      toast.error("An error occurred while deleting the bus.");
    } finally {
      setBusToDelete(null); // Close the modal
    }
  };

  const filteredBuses = buses.filter(bus => {
    const busIdStr = bus.busId ? bus.busId.toString().toLowerCase() : '';
    const driverNameStr = bus.driverId?.name ? bus.driverId.name.toLowerCase() : '';
    const searchLower = searchTerm.toLowerCase();

    const matchesSearch = busIdStr.includes(searchLower) || driverNameStr.includes(searchLower);
    const matchesStatus = filterStatus === 'all' || bus.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500 text-white';
      case 'maintenance': return 'bg-yellow-500 text-white';
      case 'inactive': return 'bg-red-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-300 rounded w-1/4"></div>
            <div className="h-96 bg-gray-300 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="animate-fade-in">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Bus Management
              </h1>
              <p className="text-gray-600 mt-2 text-lg">Manage your fleet of buses</p>
            </div>
            <Button
              onClick={() => setShowAddModal(true)}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add New Bus
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            {[
              { title: 'Total Buses', value: buses.length, icon: BusIcon, color: 'blue' },
              { title: 'Active', value: buses.filter(b => b.status === 'active').length, icon: MapPin, color: 'green' },
              { title: 'Maintenance', value: buses.filter(b => b.status === 'maintenance').length, icon: Settings, color: 'yellow' },
              { title: 'Inactive', value: buses.filter(b => b.status === 'inactive').length, icon: AlertTriangle, color: 'red' }
            ].map((stat, index) => (
              <Card key={index} className={`bg-gradient-to-br from-${stat.color}-50 to-${stat.color}-100 border-${stat.color}-200 border-2 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 animate-scale-in`} style={{ animationDelay: `${index * 100}ms` }}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                      <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                    <div className={`p-3 rounded-xl bg-white/50 shadow-sm`}>
                      <stat.icon className={`h-6 w-6 text-${stat.color}-600`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Filters */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm animate-fade-in">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search buses by ID or Driver..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bus Table */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm animate-fade-in">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Fleet Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Route</TableHead>
                    <TableHead>Driver</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Capacity</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBuses.map((bus, index) => (
                    <TableRow key={bus._id} className="hover:bg-gray-50 transition-colors duration-200 animate-slide-in-right" style={{ animationDelay: `${index * 50}ms` }}>
                      <TableCell>
                        <div>
                          <p className="font-semibold">{bus.busId}</p>
                          <p className="text-sm text-gray-500">{bus.source} → {bus.destination}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                            <Users className="h-4 w-4 text-white" />
                          </div>
                          <span>{bus.driverId?.name || 'Unassigned'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(bus.status)}>
                          {bus.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Users className="h-4 w-4 text-gray-400" />
                          <span>{bus.capacity || 'N/A'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1 text-gray-500">
                          <Clock className="h-4 w-4" />
                          <span>{new Date(bus.updatedAt).toLocaleDateString()}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingBus(bus)}
                            className="hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setBusToDelete(bus)} // ✅ Open confirmation modal
                            className="hover:bg-red-50 hover:border-red-300 text-red-600 transition-all duration-200"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      {showAddModal && (
        <AddBusModal 
          onClose={() => setShowAddModal(false)}
          onBusAdded={handleBusAdded}
        />
      )}
      {editingBus && (
        <EditBusModal 
            bus={editingBus} 
            onClose={() => setEditingBus(null)}
            onBusUpdated={fetchBuses}
        />
      )}
      {/* ✅ Render the confirmation modal when a bus is selected for deletion */}
      {busToDelete && (
        <ConfirmDeleteModal
            onClose={() => setBusToDelete(null)}
            onConfirm={handleConfirmDelete}
            itemName={`Bus #${busToDelete.busId}`}
        />
      )}
    </div>
  );
};
