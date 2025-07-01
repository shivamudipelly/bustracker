import type { Request, Response, NextFunction } from "express"
import { UserService } from "../services/UserService"
import { ResponseHandler } from "../utils/response"
import { validate, createUserSchema, updateUserSchema } from "../utils/validators"

export class AdminController {
  private userService: UserService

  constructor() {
    this.userService = new UserService()
  }

  getAllUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const users = await this.userService.getAllUsers()
      const sanitizedUsers = users.map((user) => ({
        id: user._id,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified,
        role: user.role,
        phone: user.phone ? user.phone : "N/A",
        status: user.status,
        createdAt: user.createdAt.toISOString(),
        lastLogin: user.lastLogin ? user.lastLogin.toISOString() : "N/A",
      }))

      ResponseHandler.success(res, sanitizedUsers, "Users retrieved successfully")
    } catch (error) {
      next(error)
    }
  }

  addUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userData = validate(createUserSchema, req.body)
      const user = await this.userService.createUser({ ...userData })
      console.log(user);
      
      // If admin is adding user, verify immediately
      if (user.verificationToken) {
        await this.userService.verifyUser(user.verificationToken)
      }

      // Prepare response without sensitive data
      const responseUser = {
        id: user._id?.toString?.() || user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin || "Never",
      }

      ResponseHandler.success(res, responseUser, "User added successfully", 201)
    } catch (error) {
      next(error)
    }
  }


  getUserByEmail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email } = req.params
      const user = await this.userService.getUserByEmail(email)
  
      if (!user) {
        ResponseHandler.error(res, "User not found", 404)
        return
      }

      const sanitizedUser = {_id: user._id, email: user.email}

      ResponseHandler.success(res, sanitizedUser, "User retrieved successfully")
    } catch (error) {
      next(error)
    }
  }

  updateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params
      const userData = validate(updateUserSchema, req.body)

      await this.userService.updateUser(id, userData)
      ResponseHandler.success(res, null, "User updated successfully")
    } catch (error) {
      next(error)
    }
  }

  deleteUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params
      await this.userService.deleteUser(id)
      ResponseHandler.success(res, null, "User deleted successfully")
    } catch (error) {
      next(error)
    }
  }
}
