import mongoose, { Schema } from "mongoose";
import { IBus, ILocation, IStop } from "../types";

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
    validate: [
      (val: number[]) => val.length === 2,
      "Coordinates must have exactly 2 elements",
    ],
  },
});

const BusSchema = new Schema<IBus>(
  {
    busId: { type: Number, required: true, unique: true },
    destination: { type: String, required: true },
    source: { type: String, default: "Anurag University" },
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

// ✅ DB OPTIMIZATION: Index for fast duplicate checks
BusSchema.index({ destination: 1 });

// ✅ DB OPTIMIZATION: Index for looking up a driver's bus (Dashboard)
BusSchema.index({ driverId: 1 });

const Bus = mongoose.model<IBus>("Bus", BusSchema);
export default Bus;
