import { BusRepository } from "../repositories/BusRepository"
import { UserRepository } from "../repositories/UserRepository"
import { IBus, type CreateBusDto, type UpdateBusDto, type IBusService, type ILocation, UserRole } from "../types"
import { ConflictError, NotFoundError } from "../utils/errors"
import { logger } from "../config/logger"

export class BusService implements IBusService {
  private busRepository: BusRepository
  private userRepository: UserRepository

  constructor() {
    this.busRepository = new BusRepository()
    this.userRepository = new UserRepository()
  }

  async createBus(busData: CreateBusDto): Promise<IBus> {
    // Validate driver exists and has DRIVER role
    const driver = await this.userRepository.findByEmail(busData.driverId)
    if (!driver || driver.role !== UserRole.DRIVER) {
      throw new NotFoundError("Driver not found or not a DRIVER")
    }

    // Check for duplicate bus ID
    const existingBusById = await this.busRepository.findByBusId(busData.busId.toString())
    if (existingBusById) {
      throw new ConflictError("Bus ID already exists")
    }

    // Check for duplicate destination
    const existingBusByDestination = await this.busRepository.findByDestination(busData.destination)
    if (existingBusByDestination) {
      throw new ConflictError("A bus with the same destination already exists")
    }

    // Check if driver is already assigned to another bus
    const existingBusDriver = await this.busRepository.findByDriverId(driver._id as any)
    if (existingBusDriver) {
      throw new ConflictError("Bus with this driver already exists")
    }

    const bus = await this.busRepository.create({
      ...busData,
      destination: busData.destination.toLowerCase(),
      driverId: driver._id as any,
      location: { latitude: 0, longitude: 0 },
    })

    logger.info(`Bus created: ${bus.busId} - ${bus.destination}`)
    return bus
  }

  async getBusById(id: string): Promise<IBus | null> {
    return await this.busRepository.findById(id)
  }

  async getBusByBusId(busId: string): Promise<IBus | null> {
    return await this.busRepository.findByBusId(busId)
  }

  async updateBus(id: string, busData: UpdateBusDto): Promise<IBus | null> {
    const bus = await this.busRepository.findById(id)
    if (!bus) {
      throw new NotFoundError("Bus")
    }

    // Validate driver if provided
    if (busData.driverId) {
      const driver = await this.userRepository.findByEmail(busData.driverId)
      console.log(`Updating bus ${id} with driver ${busData.driverId}`, driver);

      if (!driver || driver.role !== UserRole.DRIVER) {
        throw new NotFoundError("Driver not found or not a DRIVER")
      }

      // Check if driver is already assigned to another bus
      if (driver._id) {
        const existingBusDriver = await this.busRepository.findByDriverId(driver._id as any)
        if (existingBusDriver) {
          throw new ConflictError("Bus with this driver already exists")
        }
      }

      busData.driverId = driver._id as any 
    }

    // Check destination uniqueness if provided
    if (busData.destination) {
      const normalizedDestination = busData.destination.toLowerCase()
      const existingBusByDestination = await this.busRepository.findByDestination(normalizedDestination)

      if (existingBusByDestination && existingBusByDestination._id.toString() !== id) {
        throw new ConflictError("A bus with the same destination already exists")
      }

      busData.destination = normalizedDestination
    }

    const updatedBus = await this.busRepository.update(id, busData)
    logger.info(`Bus updated: ${updatedBus?.busId}`)

    return updatedBus
  }

  async deleteBus(id: string): Promise<boolean> {
    const bus = await this.busRepository.findById(id)
    if (!bus) {
      throw new NotFoundError("Bus")
    }

    const deleted = await this.busRepository.delete(id)
    if (deleted) {
      logger.info(`Bus deleted: ${bus.busId}`)
    }

    return deleted
  }

  async getAllBuses(): Promise<IBus[]> {
    return await this.busRepository.findAll()
  }

  async updateBusLocation(busId: string, location: ILocation): Promise<IBus | null> {
    const updatedBus = await this.busRepository.updateLocation(busId, location)
    if (updatedBus) {
      logger.debug(`Bus location updated: ${busId} -> ${location.latitude}, ${location.longitude}`)
    }
    return updatedBus
  }

  async getBusByDriverEmail(email: string): Promise<IBus | null> {
    const driver = await this.userRepository.findByEmail(email)
    if (!driver) {
      return null
    }

    return await this.busRepository.findByDriverId(driver._id as any)
  }

  async getDashboardStats(): Promise<{ totalBuses: number; totalDrivers: number }> {
    const [totalBuses, totalDrivers] = await Promise.all([
      this.busRepository.count(),
      this.userRepository.countByRole(UserRole.DRIVER),
    ])

    return { totalBuses, totalDrivers }
  }
}
