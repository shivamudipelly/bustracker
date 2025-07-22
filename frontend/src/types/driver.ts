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

export interface Bus {
  _id: string; // MongoDB ID
  busId: number;
  destination: string;
  source: string;
  driverId: Driver; // Full driver object
  status: 'active' | 'inactive' | 'maintenance';
  location: Location;
  stops: Stop[];
  capacity: number;
  busType: 'standard' | 'deluxe' | 'mini' | 'AC';
  createdAt: string;
  updatedAt: string;
}
