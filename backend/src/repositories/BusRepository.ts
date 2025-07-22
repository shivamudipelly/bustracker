import { Types } from "mongoose"
import Bus, { IBus } from "../models/Bus"
import type { CreateBusDto, UpdateBusDto, ILocation } from "../types"

export class BusRepository {
  async create(busData: CreateBusDto & { driverId: Types.ObjectId; location: ILocation }): Promise<IBus> {
    const bus = new Bus(busData)
    return await bus.save()
  }

  async findById(id: string): Promise<IBus | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null
    }
    return await Bus.findById(id).populate("driverId", "name email")
  }

  async findByBusId(busId: string): Promise<IBus | null> {
    return await Bus.findOne({ busId }).populate("driverId", "name email")
  }

  async findByDestination(destination: string): Promise<IBus | null> {
    return await Bus.findOne({
      destination: destination.toLowerCase(),
    }).populate("driverId", "name email")
  }

  async findByDriverId(driverId: Types.ObjectId): Promise<IBus | null> {
    return await Bus.findOne({ driverId }).populate("driverId", "name email")
  }

  async findAll(): Promise<IBus[]> {
    return await Bus.find().populate("driverId", "name email")
  }

  async update(id: string, busData: UpdateBusDto): Promise<IBus | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null
    }

    return await Bus.findByIdAndUpdate(id, { $set: busData }, { new: true, runValidators: true }).populate(
      "driverId",
      "name email",
    )
  }

  async updateLocation(busId: string, location: ILocation): Promise<IBus | null> {
    return await Bus.findOneAndUpdate(
      { busId },
      {
        $set: {
          location: {
            ...location,
            timestamp: new Date(),
          },
        },
      },
      { new: true },
    ).populate("driverId", "name email")
  }

  async delete(id: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) {
      return false
    }

    const result = await Bus.findByIdAndDelete(id)
    return !!result
  }

  async count(): Promise<number> {
    return await Bus.countDocuments()
  }
}
