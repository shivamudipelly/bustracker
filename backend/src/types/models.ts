// src/types/models.ts
import { Document, Types } from "mongoose";
import { UserRole, UserStatus } from "./common";

// Sub-document interfaces
export interface ILocation {
  latitude: number;
  longitude: number;
  timestamp?: Date;
}

export interface IStop {
  name: string;
  coordinates: [number, number];
}

// User Document
export interface IUser extends Document<Types.ObjectId> {
  name: string;
  email: string;
  phone?: string;
  password: string;
  role: UserRole;
  status: UserStatus;
  isVerified: boolean;
  verificationToken?: string;
  verificationTokenExpires?: Date;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// Bus Document
export interface IBus extends Document<Types.ObjectId> {
  busId: number;
  destination: string;
  source?: string;
  driverId: Types.ObjectId; // Strict ObjectId relation
  location: ILocation;
  stops: IStop[];
  capacity: number;
  status: "active" | "inactive" | "maintenance";
  createdAt: Date;
  updatedAt: Date;
}
