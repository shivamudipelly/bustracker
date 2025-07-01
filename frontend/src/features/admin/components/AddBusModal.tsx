import { useState } from 'react';
import { X, Bus, MapPin, Users, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useBusStore } from '@/stores/busStore';
import { toast } from "@/components/ui/sonner";

interface AddBusModalProps {
  onClose: () => void;
}

export const AddBusModal = ({ onClose }: AddBusModalProps) => {
  const { addBus } = useBusStore();
  const [formData, setFormData] = useState({
    routeNumber: '',
    routeName: '',
    source: '',
    destination: '',
    driver: '',
    capacity: '',
    schedule: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newBus = {
      id: Date.now().toString(),
      routeNumber: formData.routeNumber,
      routeName: formData.routeName,
      source: formData.source,
      destination: formData.destination,
      driver: formData.driver,
      capacity: parseInt(formData.capacity),
      schedule: formData.schedule,
      status: 'active' as const,
      lat: 0,
      lng: 0,
      lastUpdated: new Date().toISOString()
    };

    addBus(newBus);
    toast.success('Bus added successfully!');
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
      <Card className="w-full max-w-2xl mx-4 shadow-2xl border-0 animate-scale-in">
        <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-500 rounded-lg">
                <Bus className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold">Add New Bus</CardTitle>
            </div>
            <Button variant="outline" size="sm" onClick={onClose} className="hover:bg-gray-100">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Bus className="inline h-4 w-4 mr-1" />
                  Route Number
                </label>
                <input
                  type="text"
                  name="routeNumber"
                  value={formData.routeNumber}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  placeholder="e.g., B101"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Route Name
                </label>
                <input
                  type="text"
                  name="routeName"
                  value={formData.routeName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  placeholder="e.g., Central Line"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="inline h-4 w-4 mr-1" />
                  Source
                </label>
                <input
                  type="text"
                  name="source"
                  value={formData.source}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  placeholder="Starting point"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Destination
                </label>
                <input
                  type="text"
                  name="destination"
                  value={formData.destination}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  placeholder="End point"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Users className="inline h-4 w-4 mr-1" />
                  Driver
                </label>
                <input
                  type="text"
                  name="driver"
                  value={formData.driver}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  placeholder="Driver name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Capacity
                </label>
                <input
                  type="number"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  placeholder="50"
                  min="1"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="inline h-4 w-4 mr-1" />
                  Schedule
                </label>
                <select
                  name="schedule"
                  value={formData.schedule}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  required
                >
                  <option value="">Select schedule</option>
                  <option value="morning">Morning Shift</option>
                  <option value="afternoon">Afternoon Shift</option>
                  <option value="evening">Evening Shift</option>
                  <option value="fullday">Full Day</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-6 border-t">
              <Button type="button" variant="outline" onClick={onClose} className="hover:bg-gray-50">
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Add Bus
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
