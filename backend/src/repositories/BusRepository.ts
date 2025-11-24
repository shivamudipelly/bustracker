import { Types } from "mongoose";
import Bus from "@/models/Bus";
import { IBus } from "../types";
import { CreateBusDto, UpdateBusDto, ILocation } from "../types";

export class BusRepository {
  // ✅ Uses Omit to safely swap 'driverId' string for ObjectId
  async create(
    busData: Omit<CreateBusDto, "driverId"> & {
      driverId: Types.ObjectId;
      location: ILocation;
    },
  ): Promise<IBus> {
    const bus = new Bus(busData);
    return await bus.save();
  }

  async findById(id: string): Promise<IBus | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return await Bus.findById(id).populate("driverId", "name email");
  }

  async findByBusId(busId: string): Promise<IBus | null> {
    return await Bus.findOne({ busId }).populate("driverId", "name email");
  }

  async findByDestination(destination: string): Promise<IBus | null> {
    return await Bus.findOne({
      destination: destination.toLowerCase(),
    });
  }

  async findByDriverId(driverId: Types.ObjectId): Promise<IBus | null> {
    return await Bus.findOne({ driverId });
  }

  async findAll(
    page: number,
    limit: number,
  ): Promise<{ buses: IBus[]; total: number }> {
    const skip = (page - 1) * limit;
    const [buses, total] = await Promise.all([
      Bus.find()
        .populate("driverId", "name email")
        .sort({ busId: 1 })
        .skip(skip)
        .limit(limit)
        .lean<IBus[]>()
        .exec(),
      Bus.countDocuments(),
    ]);
    return { buses, total };
  }

  // ✅ FIX: Uses Omit here too so TypeScript doesn't complain about driverId being a string
  async update(
    id: string,
    busData: Omit<UpdateBusDto, "driverId"> & { driverId?: Types.ObjectId },
  ): Promise<IBus | null> {
    if (!Types.ObjectId.isValid(id)) return null;

    return await Bus.findByIdAndUpdate(
      id,
      { $set: busData },
      { new: true, runValidators: true },
    ).populate("driverId", "name email");
  }

  async updateLocation(
    busId: string,
    location: ILocation,
  ): Promise<IBus | null> {
    // ✅ FIX: Respect the incoming timestamp (from RAM cache)
    // If no timestamp provided, fallback to Date.now()
    const ts = location.timestamp || new Date();

    return await Bus.findOneAndUpdate(
      { busId },
      {
        $set: {
          location: {
            latitude: location.latitude,
            longitude: location.longitude,
            timestamp: ts,
          },
        },
      },
      { new: true },
    );
  }

  async delete(id: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) return false;
    const result = await Bus.findByIdAndDelete(id);
    return !!result;
  }

  async count(): Promise<number> {
    return await Bus.countDocuments();
  }
}
