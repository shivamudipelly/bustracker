import jwt from "jsonwebtoken"
import type { Response, NextFunction } from "express"
import { UserService } from "../services/UserService"
import { type AuthenticatedRequest, UserRole } from "../types"
import { environment } from "../config/environment"
import { UnauthorizedError, ForbiddenError } from "../utils/errors"

export class AuthMiddleware {
  private userService: UserService

  constructor() {
    this.userService = new UserService()
  }

  authenticate = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const token = req.cookies?.token
      console.log("JWT Token from cookie:", token);
      
      if (!token) {
        throw new UnauthorizedError("Access denied. No token provided.")
      }

      const decoded = jwt.verify(token, environment.get("JWT_SECRET")) as {
        userId: string
      }
      console.log("Decoded JWT:", decoded);

      const user = await this.userService.getUserById(decoded.userId)

      if (!user) {
        throw new UnauthorizedError("User not found.")
      }

      req.user = {
        _id: user._id.toString(),
        role: user.role,
        name: user.name,
        email: user.email,
      }

      next()
    } catch (error) {
      next(error)
    }
  }

  requireRole = (role: UserRole) => {
    return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
      try {
        await this.authenticate(req, res, () => {
          if (req.user?.role === role) {
            return next()
          }
          throw new ForbiddenError(`Access denied. ${role} role required.`)
        })
      } catch (error) {
        next(error)
      }
    }
  }

  requireAdmin = this.requireRole(UserRole.ADMIN)
}

// Export singleton instance
export const authMiddleware = new AuthMiddleware()
