export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'driver' | 'viewer';
  createdAt: string;
}

export interface Bus {
  id: string;
  routeNumber: string;
  routeName: string;
  source: string;
  destination: string;
  driverId: string;       
  driverName: string;      
  status: 'active' | 'inactive' | 'maintenance';
  currentLocation: Location;
  lastUpdated: string;     
  capacity: number;
  busType: string;
  stops: Array<{
    name: string;
    coordinates: [number, number];
  }>;
}


export interface Location {
  latitude: number;
  longitude: number;
  timestamp: string;
}

export interface Route {
  id: string;
  routeNumber: string;
  routeName: string;
  source: string;
  destination: string;
  stops: RouteStop[];
  estimatedDuration: number;
  distance: number;
  fare: number;
}

export interface RouteStop {
  id: string;
  name: string;
  location: Location;
  order: number;
  estimatedArrival?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

export interface BusTracking {
  busId: string;
  location: Location;
  speed: number;
  heading: number;
  nextStop?: string;
  eta?: string;
}
