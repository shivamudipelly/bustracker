import { useState } from 'react';
import { X, Bus, MapPin, Users, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from "@/components/ui/sonner";
import { apiService } from '@/services/api';
import type { Bus as BusType, Driver } from '@/types/driver';
import { useBusStore } from '@/stores/busStore';
import { set } from 'date-fns';

interface EditBusModalProps {
  bus: BusType;
  onClose: () => void;
}

export const EditBusModal = ({ bus, onClose }: EditBusModalProps) => {
  const [formData, setFormData] = useState({
    destination: bus.destination || '',
    source: bus.source || '',
    driverEmail: bus.driverId?.email || '',
    capacity: bus.capacity?.toString() || '',
    status: bus.status || 'active',
  });
  const { setBuses} = useBusStore();
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const busId = bus._id;
      const { source, destination, driverEmail, capacity, status } = formData;

      const updatedPayload = {
        source,
        destination,
        driverId: driverEmail,
        capacity: Number(capacity) || 50,
        status,
      };

      // Step 3: API call
      const response = await apiService.updateBus(busId, updatedPayload);

      if (response.success) {
        toast.success("Bus updated successfully!");
        setBuses(
          useBusStore.getState().buses.map(b =>
            b._id === busId
              ? response.data
              : b
          )
        );
        onClose();
      } else {
        toast.error(response.message || "Failed to update bus.");
      }
    } catch (error: any) {
      console.error("Update bus error:", error);
      toast.error(error.message || "An unexpected error occurred.");
    }
  };


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
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
              <CardTitle className="text-2xl font-bold">Edit Bus</CardTitle>
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
                  Source
                </label>
                <input
                  type="text"
                  name="source"
                  value={formData.source}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Driver Email
                </label>
                <input
                  type="email"
                  name="driverEmail"
                  value={formData.driverEmail}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
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
                  min={1}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-6 border-t">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white shadow">
                Update Bus
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
