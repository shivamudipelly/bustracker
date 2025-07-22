import { Link } from 'react-router-dom';
import { MapPin, Clock, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bus } from '@/types/driver';

interface BusCardProps {
  bus: Bus;
}

export const BusCard = ({ bus }: BusCardProps) => {
  
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

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'inactive':
        return 'Inactive';
      case 'maintenance':
        return 'Maintenance';
      default:
        return 'Unknown';
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            {bus.busId} - {bus.source} to {bus.destination}
          </CardTitle>
          <Badge className={`${getStatusColor(bus.status)} text-white`}>
            {getStatusText(bus.status)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="h-4 w-4 mr-2" />
            <span>{bus.source} → {bus.destination}</span>
          </div>
          
          {bus.driverId.name && (
            <div className="flex items-center text-sm text-gray-600">
              <User className="h-4 w-4 mr-2" />
              <span>Driver: {bus.driverId.name}</span>
            </div>
          )}
          
          <div className="flex items-center text-sm text-gray-600">
            <Clock className="h-4 w-4 mr-2" />
            <span>Last updated: {bus.updatedAt}</span>
          </div>
          
          <div className="pt-3">
            <Link to={`/track/${bus._id}`} state={bus}>
              <Button className="w-full" disabled={bus.status !== 'active'}>
                {bus.status === 'active' ? 'Track Live' : 'Not Available'}
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
