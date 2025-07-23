import { useState } from 'react';
import { X, Bus, MapPin, Users, Clock, Hash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from "@/components/ui/sonner";
import { apiService, ApiError } from '@/services/api';

interface AddBusModalProps {
  onClose: () => void;
  onBusAdded: () => void; // Callback to refresh the parent component's data
}

export const AddBusModal = ({ onClose, onBusAdded }: AddBusModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    busId: '',
    source: '',
    destination: '',
    driverEmail: '', // Changed from driver name to driver email
    capacity: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  /**
   * Handles the form submission to create a new bus.
   * It constructs a payload that matches the backend's CreateBusDto.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.busId || !formData.destination || !formData.driverEmail || !formData.capacity) {
        toast.error("Please fill all required fields.");
        return;
    }

    setIsSubmitting(true);

    // This payload is structured to match the backend DTO and service logic.
    // 'driverId' in the DTO is the driver's email address.
    const busPayload = {
      busId: Number(formData.busId),
      destination: formData.destination,
      driverId: formData.driverEmail, // Sending email as driverId, as expected by the service
      source: formData.source,
      capacity: parseInt(formData.capacity, 10),
    };

    try {
      const response = await apiService.createBus(busPayload);
      
      if (response.success) {
        toast.success(response.message || 'Bus added successfully!');
        onBusAdded(); // Notify parent to refresh the bus list
        onClose();    // Close the modal
      } else {
        // This case handles APIs that return { success: false } without throwing an error
        toast.error(response.message || 'Failed to add bus.');
      }
    } catch (error) {
      console.error("Failed to add bus:", error);
      if (error instanceof ApiError) {
        // The backend throws specific errors (e.g., ConflictError) which are caught here.
        toast.error(`Error: ${error.message}`);
      } else {
        toast.error('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
      <Card className="w-full max-w-2xl mx-4 shadow-2xl border-0 animate-scale-in">
        <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-gray-50">
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
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Hash className="inline h-4 w-4 mr-1" />
                Bus / Route Number
              </label>
              <input
                type="number"
                name="busId"
                value={formData.busId}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                placeholder="e.g., 101"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="inline h-4 w-4 mr-1 text-red-500" />
                  Source
                </label>
                <input
                  type="text"
                  name="source"
                  value={formData.source}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  placeholder="Starting point (e.g., Anurag University)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="inline h-4 w-4 mr-1 text-green-500" />
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Users className="inline h-4 w-4 mr-1" />
                  Driver's Email
                </label>
                <input
                  type="email"
                  name="driverEmail"
                  value={formData.driverEmail}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  placeholder="driver@example.com"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  placeholder="e.g., 50"
                  min="1"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-6 border-t">
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting} className="hover:bg-gray-50">
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Adding Bus...' : 'Add Bus'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};