import { type Request, type Response, type NextFunction, response } from "express"
import { BusService } from "../services/BusService"
import { UserService } from "../services/UserService";
import { ResponseHandler } from "../utils/response"
import { validate, updateBusSchema } from "../utils/validators";
import { createBusSchema } from "../utils/validators";


export class BusController {
  private busService: BusService
  private userService: UserService

  constructor() {
    this.busService = new BusService();
    this.userService = new UserService();
  }

  createBus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const busData = validate(createBusSchema, req.body)
      await this.busService.createBus(busData)

      ResponseHandler.success(res, null, "Bus created successfully", 201)
    } catch (error) {
      next(error)
    }
  }

  getAllBuses = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const buses = await this.busService.getAllBuses()
      ResponseHandler.success(res, buses, "Buses retrieved successfully")
    } catch (error) {
      next(error)
    }
  }

  getBusById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { busId } = req.params
      const bus = await this.busService.getBusByBusId(busId)
      console.log(`Fetching bus with ID: ${busId}`, bus)

      if (!bus) {
        ResponseHandler.error(res, "Bus not found", 404)
        return
      }

      ResponseHandler.success(res, bus, "Bus retrieved successfully")
    } catch (error) {
      next(error)
    }
  }

  updateBus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { busId } = req.params;
      const rawData = req.body;

      console.log(`Updating bus with ID: ${busId}`, rawData);
      const response = await this.busService.updateBus(busId, rawData);
      ResponseHandler.success(res, response, "Bus updated successfully");
    } catch (error) {
      console.error("Error updating bus:", error);
      next(error);
    }
  };


  deleteBus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { busId } = req.params
      await this.busService.deleteBus(busId)
      ResponseHandler.success(res, null, "Bus deleted successfully")
    } catch (error) {
      next(error)
    }
  }

  getDashboardStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const stats = await this.busService.getDashboardStats()
      ResponseHandler.success(res, stats, "Dashboard stats retrieved successfully")
    } catch (error) {
      next(error)
    }
  }

  getBusByDriverEmail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email } = req.query

      if (!email || typeof email !== "string") {
        ResponseHandler.error(res, "Email parameter is required", 400)
        return
      }

      const bus = await this.busService.getBusByDriverEmail(email)

      if (!bus) {
        ResponseHandler.error(res, "Bus not found for this driver", 404)
        return
      }

      ResponseHandler.success(res,bus,"Bus retrieved successfully")
    } catch (error) {
      next(error)
    }
  }
}
function findByEmail(driverId: any) {
  throw new Error("Function not implemented.")
}

