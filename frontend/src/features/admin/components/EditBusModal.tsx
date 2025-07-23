import { useState } from 'react';
import { X, Bus, MapPin, Users, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from "@/components/ui/sonner";
import { apiService, ApiError } from '@/services/api'; // 👈 Import ApiError
import type { Bus as BusType } from '@/types/driver';

interface EditBusModalProps {
  bus: BusType;
  onClose: () => void;
  onBusUpdated: () => void; // 👈 New prop to notify parent of a successful update
}

export const EditBusModal = ({ bus, onClose, onBusUpdated }: EditBusModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false); // 👈 State to handle submission status
  const [formData, setFormData] = useState({
    destination: bus.destination || '',
    source: bus.source || '',
    driverEmail: bus.driverId?.email || '',
    capacity: bus.capacity?.toString() || '',
    status: bus.status || 'active',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const updatedPayload = {
      source: formData.source,
      destination: formData.destination,
      driverId: formData.driverEmail, // Backend should handle finding driver by email
      capacity: Number(formData.capacity) || undefined,
      status: formData.status,
    };

    try {
      const response = await apiService.updateBus(bus._id, updatedPayload);

      if (response.success) {
        toast.success(response.message || "Bus updated successfully!");
        onBusUpdated(); // ✅ Notify parent component to refresh data
        onClose();      // ✅ Close the modal
      } else {
        toast.error(response.message || "Failed to update bus.");
      }
    } catch (error) {
      console.error("Update bus error:", error);
      if (error instanceof ApiError) {
        toast.error(`Error: ${error.message}`);
      } else {
        toast.error("An unexpected error occurred.");
      }
    } finally {
      setIsSubmitting(false);
    }
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
              <CardTitle className="text-2xl font-bold">Edit Bus Details</CardTitle>
            </div>
            <Button variant="outline" size="sm" onClick={onClose} disabled={isSubmitting} className="hover:bg-gray-100">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="inline h-4 w-4 mr-1" /> Source
                </label>
                <input
                  type="text"
                  name="source"
                  value={formData.source}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="inline h-4 w-4 mr-1" /> Destination
                </label>
                <input
                  type="text"
                  name="destination"
                  value={formData.destination}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Users className="inline h-4 w-4 mr-1" /> Driver Email
                </label>
                <input
                  type="email"
                  name="driverEmail"
                  value={formData.driverEmail}
                  onChange={handleChange}
                  placeholder="driver@example.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Users className="inline h-4 w-4 mr-1" /> Capacity
                </label>
                <input
                  type="number"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleChange}
                  min={1}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="inline h-4 w-4 mr-1" /> Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-6 border-t">
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting} className="hover:bg-gray-50">
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting} // 👈 Disable button while submitting
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Updating...' : 'Update Bus'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};