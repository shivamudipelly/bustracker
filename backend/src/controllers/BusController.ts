import { Request, Response } from "express";
import { BusService } from "@/services/BusService";
import { ResponseHandler } from "@/utils/response";
import { catchAsync } from "@/utils/catchAsync";
import { validate, createBusSchema, updateBusSchema } from "@/utils/validators";
import { HttpStatus } from "@/types";

export class BusController {
  private busService: BusService;

  constructor() {
    this.busService = new BusService();
  }

  createBus = catchAsync(async (req: Request, res: Response) => {
    const busData = validate(createBusSchema, req.body);
    const bus = await this.busService.createBus(busData);
    ResponseHandler.success(
      res,
      bus,
      "Bus created successfully",
      HttpStatus.CREATED,
    );
  });

  // ✅ UPDATED: Reads ?page=1&limit=10 from URL
  getAllBuses = catchAsync(async (req: Request, res: Response) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;

    const { buses, total } = await this.busService.getAllBuses(page, limit);

    // Use the proper paginated response format
    ResponseHandler.paginated(
      res,
      buses,
      page,
      limit,
      total,
      "Buses retrieved successfully",
    );
  });

  getBusById = catchAsync(async (req: Request, res: Response) => {
    const { busId } = req.params;
    const bus = await this.busService.getBusByBusId(busId);

    if (!bus) {
      ResponseHandler.error(res, "Bus not found", HttpStatus.NOT_FOUND);
      return;
    }
    ResponseHandler.success(res, bus, "Bus retrieved successfully");
  });

  updateBus = catchAsync(async (req: Request, res: Response) => {
    const { busId } = req.params;
    const data = validate(updateBusSchema, req.body);

    const updatedBus = await this.busService.updateBus(busId, data);
    ResponseHandler.success(res, updatedBus, "Bus updated successfully");
  });

  deleteBus = catchAsync(async (req: Request, res: Response) => {
    const { busId } = req.params;
    await this.busService.deleteBus(busId);
    ResponseHandler.success(res, null, "Bus deleted successfully");
  });

  getDashboardStats = catchAsync(async (req: Request, res: Response) => {
    const stats = await this.busService.getDashboardStats();
    ResponseHandler.success(
      res,
      stats,
      "Dashboard stats retrieved successfully",
    );
  });

  getBusByDriverEmail = catchAsync(async (req: Request, res: Response) => {
    const { email } = req.query;
    if (!email || typeof email !== "string") {
      ResponseHandler.error(
        res,
        "Email parameter is required",
        HttpStatus.BAD_REQUEST,
      );
      return;
    }

    const bus = await this.busService.getBusByDriverEmail(email);
    if (!bus) {
      ResponseHandler.error(
        res,
        "Bus not found for this driver",
        HttpStatus.NOT_FOUND,
      );
      return;
    }
    ResponseHandler.success(res, bus, "Bus retrieved successfully");
  });
}
