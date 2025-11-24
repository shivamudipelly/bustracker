import { BusRepository } from "@/repositories/BusRepository";
import { UserRepository } from "@/repositories/UserRepository";
import { CreateBusDto, UpdateBusDto, IBus, ILocation, UserRole } from "@/types";
import { ConflictError, NotFoundError } from "@/utils/errors";
import logger from "@/config/logger";

export class BusService {
  private busRepository: BusRepository;
  private userRepository: UserRepository;

  constructor() {
    this.busRepository = new BusRepository();
    this.userRepository = new UserRepository();
  }

  async createBus(busData: CreateBusDto): Promise<IBus> {
    const driver = await this.userRepository.findByEmail(busData.driverId);
    if (!driver || driver.role !== UserRole.DRIVER) {
      throw new NotFoundError(
        `Driver with email ${busData.driverId} not found or is not a driver`,
      );
    }

    const [existingId, existingDest, existingDriver] = await Promise.all([
      this.busRepository.findByBusId(busData.busId.toString()),
      this.busRepository.findByDestination(busData.destination),
      this.busRepository.findByDriverId(driver._id),
    ]);

    if (existingId) throw new ConflictError("Bus ID already exists");
    if (existingDest) throw new ConflictError("Destination already exists");
    if (existingDriver)
      throw new ConflictError("Driver is already assigned to another bus");

    const bus = await this.busRepository.create({
      ...busData,
      destination: busData.destination.toLowerCase(),
      driverId: driver._id,
      location: { latitude: 0, longitude: 0 },
    });

    logger.info(`Bus created: ${bus.busId} - ${bus.destination}`);
    return bus;
  }

  // ✅ UPDATED: Pagination support
  async getAllBuses(page: number = 1, limit: number = 20) {
    return await this.busRepository.findAll(page, limit);
  }

  async getBusById(id: string): Promise<IBus | null> {
    return await this.busRepository.findById(id);
  }

  async getBusByBusId(busId: string): Promise<IBus | null> {
    return await this.busRepository.findByBusId(busId);
  }

  async getBusByDriverEmail(email: string): Promise<IBus | null> {
    const driver = await this.userRepository.findByEmail(email);
    if (!driver) return null;
    return await this.busRepository.findByDriverId(driver._id);
  }

  async updateBus(id: string, busData: UpdateBusDto): Promise<IBus | null> {
    const bus = await this.busRepository.findById(id);
    if (!bus) throw new NotFoundError("Bus");

    const updatePayload: any = { ...busData };

    if (busData.driverId) {
      const driver = await this.userRepository.findByEmail(busData.driverId);
      if (!driver || driver.role !== UserRole.DRIVER) {
        throw new NotFoundError(
          `Driver with email ${busData.driverId} not found`,
        );
      }
      if (!driver._id.equals(bus.driverId)) {
        const driverBusy = await this.busRepository.findByDriverId(driver._id);
        if (driverBusy)
          throw new ConflictError(
            "New driver is already assigned to another bus",
          );
      }
      updatePayload.driverId = driver._id;
    }

    if (busData.destination) {
      updatePayload.destination = busData.destination.toLowerCase();
    }

    const updatedBus = await this.busRepository.update(id, updatePayload);
    logger.info(`Bus updated: ${updatedBus?.busId}`);
    return updatedBus;
  }

  async deleteBus(id: string): Promise<boolean> {
    const exists = await this.busRepository.findById(id);
    if (!exists) throw new NotFoundError("Bus");
    return await this.busRepository.delete(id);
  }

  async getDashboardStats() {
    const [totalBuses, totalDrivers] = await Promise.all([
      this.busRepository.count(),
      this.userRepository.countByRole(UserRole.DRIVER),
    ]);
    return { totalBuses, totalDrivers };
  }

  async updateBusLocation(
    busId: string,
    location: ILocation,
  ): Promise<IBus | null> {
    return await this.busRepository.updateLocation(busId, location);
  }
}
