import type { Request } from "express"
import type { Types, Document } from "mongoose"
import { IUser } from "../models/User";
import { IBus } from "../models/Bus";
export { IUser, IBus };

// Enums
export enum UserRole {
  ADMIN = "admin",
  DRIVER = "driver",
  VIEWER = "viewer",
}

export type UserStatus = "active" | "inactive" | "suspended"

export enum HttpStatus {
  OK = 200,
  CREATED = 201,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  INTERNAL_SERVER_ERROR = 500,
}

// Base interfaces
export interface ILocation {
  latitude: number
  longitude: number
  timestamp?: Date
}

export interface IStop {
  name: string
  coordinates: [number, number]
}

// DTOs (Data Transfer Objects)
export interface CreateUserDto {
  name: string
  email: string
  phone?: string
  password: string
  role?: UserRole
  status?: UserStatus
}

export interface UpdateUserDto {
  name?: string
  email?: string
  phone?: string
  password?: string
  role?: UserRole
  status?: UserStatus
}

export interface LoginDto {
  email: string
  password: string
  rememberMe?: boolean
}

export interface CreateBusDto {
  busId: number;
  destination: string;
  source?: string; // optional, backend default = "Anurag University"
  driverId: string; // 🚨 This is a driver email; backend must convert it
  capacity?: number; // optional, default 50
  busType?: "standard" | "deluxe" | "mini" | "AC"; // optional
  location?: ILocation; // optional, can be generated on backend
  status?: "active" | "inactive" | "maintenance"; // optional
  stops: IStop[];
}

export interface UpdateBusDto {
  destination?: string;
  source?: string;
  driverId?: string; // 🚨 still email
  capacity?: number;
  busType?: "standard" | "deluxe" | "mini" | "AC";
  status?: "active" | "inactive" | "maintenance";
  location?: ILocation;
  stops?: IStop[];
}

export interface LocationUpdateDto {
  busId: string
  lat: number
  lng: number
}

// Request interfaces
export interface AuthenticatedRequest extends Request {
  user?: {
    _id: string
    role: UserRole
    name: string
    email: string
  }
}

// Response interfaces
export interface ApiResponse<T = any> {
  success: boolean
  message: string
  data?: T
  error?: string
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Service interfaces
export interface IUserService {
  createUser(userData: CreateUserDto): Promise<IUser>
  getUserById(id: string): Promise<IUser | null>
  getUserByEmail(email: string): Promise<IUser | null>
  updateUser(id: string, userData: UpdateUserDto): Promise<IUser | null>
  deleteUser(id: string): Promise<boolean>
  getAllUsers(): Promise<IUser[]>
  verifyUser(token: string): Promise<boolean>
}

export interface IBusService {
  createBus(busData: CreateBusDto): Promise<IBus>
  getBusById(id: string): Promise<IBus | null>
  getBusByBusId(busId: string): Promise<IBus | null>
  updateBus(id: string, busData: UpdateBusDto): Promise<IBus | null>
  deleteBus(id: string): Promise<boolean>
  getAllBuses(): Promise<IBus[]>
  updateBusLocation(busId: string, location: ILocation): Promise<IBus | null>
}

// Socket event interfaces
export interface ClientToServerEvents {
  joinBus: (payload: { busId: string }) => void
  leaveBus: (payload: { busId: string }) => void
  locationUpdate: (data: LocationUpdateDto) => void
}

export interface ServerToClientEvents {
  busLocationUpdate: (data: LocationUpdateDto) => void
}
