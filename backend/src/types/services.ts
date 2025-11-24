import { IUser, IBus, ILocation } from "./models";
import {
  CreateUserDto,
  UpdateUserDto,
  CreateBusDto,
  UpdateBusDto,
} from "./requests";

export interface IUserService {
  createUser(userData: CreateUserDto): Promise<IUser>;
  getUserById(id: string): Promise<IUser | null>;
  getUserByEmail(email: string): Promise<IUser | null>;
  updateUser(id: string, userData: UpdateUserDto): Promise<IUser | null>;
  deleteUser(id: string): Promise<boolean>;

  // ✅ FIX: Updated return type to support Pagination
  getAllUsers(
    page: number,
    limit: number,
  ): Promise<{ users: IUser[]; total: number }>;

  verifyUser(token: string): Promise<boolean>;
}

export interface IBusService {
  createBus(busData: CreateBusDto): Promise<IBus>;
  getBusById(id: string): Promise<IBus | null>;
  getBusByBusId(busId: string): Promise<IBus | null>;

  // ✅ FIX: Added missing method definition
  getBusByDriverEmail(email: string): Promise<IBus | null>;

  updateBus(id: string, busData: UpdateBusDto): Promise<IBus | null>;
  deleteBus(id: string): Promise<boolean>;

  // ✅ FIX: Updated return type to support Pagination
  getAllBuses(
    page: number,
    limit: number,
  ): Promise<{ buses: IBus[]; total: number }>;

  updateBusLocation(busId: string, location: ILocation): Promise<IBus | null>;
}
