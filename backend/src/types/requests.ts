import { Request } from "express";
import { UserRole, UserStatus } from "./common";
import { ILocation, IStop } from "./models";

// Authenticated Request
export interface AuthenticatedRequest extends Request {
  user?: {
    _id: string;
    role: UserRole;
    name: string;
    email: string;
  };
}

// --- User DTOs ---
export interface CreateUserDto {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role?: UserRole;
  status?: UserStatus;
}

export interface UpdateUserDto {
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
  role?: UserRole;
  status?: UserStatus;
}

export interface LoginDto {
  email: string;
  password: string;
  rememberMe?: boolean;
}

// --- Bus DTOs ---
export interface CreateBusDto {
  busId: number;
  destination: string;
  source?: string;
  driverId: string; // Input is Email
  capacity?: number;
  busType?: "standard" | "deluxe" | "mini" | "AC";
  location?: ILocation;
  status?: "active" | "inactive" | "maintenance";
  stops?: IStop[];
}

export interface UpdateBusDto {
  destination?: string;
  source?: string;
  driverId?: string; // Input is Email
  capacity?: number;
  busType?: "standard" | "deluxe" | "mini" | "AC";
  status?: "active" | "inactive" | "maintenance";
  location?: ILocation;
  stops?: IStop[];
}

export interface LocationUpdateDto {
  busId: string;
  lat: number;
  lng: number;
}

// --- ✅ Socket Events (Updated) ---
export interface ClientToServerEvents {
  joinBus: (payload: { busId: string }) => void;
  leaveBus: (payload: { busId: string }) => void;
  locationUpdate: (data: LocationUpdateDto) => void;
  endTrip: (payload: { busId: string }) => void; // ✅ New Event
}

export interface ServerToClientEvents {
  busLocationUpdate: (data: LocationUpdateDto) => void;
}
