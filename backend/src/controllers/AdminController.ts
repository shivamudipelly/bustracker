import { Request, Response } from "express";
import { UserService } from "@/services/UserService";
import { ResponseHandler } from "@/utils/response";
import { catchAsync } from "@/utils/catchAsync";
import {
  validate,
  createUserSchema,
  updateUserSchema,
} from "@/utils/validators";
import { HttpStatus } from "@/types";

export class AdminController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  // ✅ FIX: Implements Pagination for Users
  getAllUsers = catchAsync(async (req: Request, res: Response) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;

    const { users, total } = await this.userService.getAllUsers(page, limit);

    const sanitizedUsers = users.map((user) => ({
      id: user._id,
      name: user.name,
      email: user.email,
      isVerified: user.isVerified,
      role: user.role,
      phone: user.phone || "N/A",
      status: user.status,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin || null,
    }));

    ResponseHandler.paginated(
      res,
      sanitizedUsers,
      page,
      limit,
      total,
      "Users retrieved successfully",
    );
  });

  addUser = catchAsync(async (req: Request, res: Response) => {
    const userData = validate(createUserSchema, req.body);
    const user = await this.userService.createUser({ ...userData });

    if (user.verificationToken) {
      await this.userService.verifyUser(user.verificationToken);
    }

    const responseUser = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
    };

    ResponseHandler.success(
      res,
      responseUser,
      "User added successfully",
      HttpStatus.CREATED,
    );
  });

  getUserByEmail = catchAsync(async (req: Request, res: Response) => {
    const { email } = req.params;
    const user = await this.userService.getUserByEmail(email);

    if (!user) {
      ResponseHandler.error(res, "User not found", HttpStatus.NOT_FOUND);
      return;
    }

    ResponseHandler.success(res, user, "User retrieved successfully");
  });

  updateUser = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userData = validate(updateUserSchema, req.body);

    await this.userService.updateUser(id, userData);
    ResponseHandler.success(res, null, "User updated successfully");
  });

  deleteUser = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    await this.userService.deleteUser(id);
    ResponseHandler.success(res, null, "User deleted successfully");
  });
}
