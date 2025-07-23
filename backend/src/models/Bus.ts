import mongoose, { Document, Schema, Types } from "mongoose";
import type { ILocation, IStop } from "../types";

// Bus Document Interface
export interface IBus extends Document<Types.ObjectId> {
  busId: number;
  destination: string;
  driverId: mongoose.Types.ObjectId; // Will be populated as User
  location: ILocation;
  stops: IStop[];
  createdAt: Date;
  updatedAt: Date;
  capacity: number;
  source?: string;
  status: 'active' | 'inactive' | 'maintenance';
}

const LocationSchema = new Schema<ILocation>({
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
});

const StopSchema = new Schema<IStop>({
  name: { type: String, required: true },
  coordinates: {
    type: [Number],
    required: true,
    validate: [(val: number[]) => val.length === 2, "Coordinates must have exactly 2 elements"],
  },
});

// ✅ Final Bus Schema
const BusSchema = new Schema<IBus>(
  {
    busId: { type: Number, required: true, unique: true },
    destination: { type: String, required: true },
    source: { type: String, default: 'Anurag University' },
    driverId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: ["active", "inactive", "maintenance"],
      default: "inactive",
    },
    location: { type: LocationSchema, required: true },
    stops: { type: [StopSchema], default: [] },
    capacity: { type: Number, default: 50 },
  },
  { timestamps: true },
);

// ✅ Model & Type Export
const Bus = mongoose.model<IBus>("Bus", BusSchema);
export default Bus;
