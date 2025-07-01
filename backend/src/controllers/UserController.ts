import type { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"
import { UserService } from "../services/UserService"
import { type AuthenticatedRequest, HttpStatus } from "../types"
import { ResponseHandler } from "../utils/response"
import { validate, createUserSchema, loginSchema } from "../utils/validators"
import { environment } from "../config/environment"
import { UnauthorizedError } from "../utils/errors"
import logger from "../config/logger"

export class UserController {
  private userService: UserService

  constructor() {
    this.userService = new UserService()
  }

  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userData = validate(createUserSchema, req.body)

      await this.userService.createUser(userData)

      ResponseHandler.success(res, null, "Verification email sent. Please check your inbox.", HttpStatus.CREATED)
    } catch (error) {
      next(error)
    }
  }

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const loginData = validate(loginSchema, req.body)
      const user = await this.userService.getUserByEmail(loginData.email)

      if (!user || !user.isVerified) {
        throw new UnauthorizedError("Invalid credentials or email not verified")
      }

      const isPasswordValid = await user.comparePassword(loginData.password)
      if (!isPasswordValid) {
        throw new UnauthorizedError("Invalid credentials")
      }

      user.lastLogin = new Date();
      user.status = "active";
      await user.save();

      const tokenExpiry = loginData.rememberMe ? "7d" : "1d"
      const cookieExpiry = loginData.rememberMe ? 7 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000

      const token = jwt.sign({ userId: user._id }, environment.get("JWT_SECRET"), { expiresIn: tokenExpiry })

      res.cookie("token", token, {
        httpOnly: true,
        secure: environment.isProduction(),
        sameSite: environment.isProduction() ? "none" : "lax",
        maxAge: cookieExpiry,
      });


      const userResponse = {
        name: user.name,
        email: user.email,
        role: user.role,
      }

      ResponseHandler.success(res, { user: userResponse }, "Login successful")
    } catch (error) {
      next(error)
    }
  }

  verifyEmail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const token = req.query.token as string
      if (!token) {
        ResponseHandler.error(res, "Verification token is missing", HttpStatus.BAD_REQUEST)
        return
      }

      await this.userService.verifyUser(token)
      ResponseHandler.success(res, null, "Email verified successfully. You can now log in.")
    } catch (error) {
      next(error)
    }
  }

  forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email } = req.body
      await this.userService.sendPasswordResetEmail(email)

      ResponseHandler.success(res, null, "If a user exists with that email, a reset link has been sent.")
    } catch (error) {
      next(error)
    }
  }

  resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const token = req.query.token as string
      const { password } = req.body

      if (!token) {
        ResponseHandler.error(res, "Reset token is missing", HttpStatus.BAD_REQUEST)
        return
      }

      if (!password || password.length < 6) {
        ResponseHandler.error(res, "Password must be at least 6 characters long", HttpStatus.BAD_REQUEST)
        return
      }

      await this.userService.resetPassword(token, password)
      ResponseHandler.success(res, null, "Password reset successfully")
    } catch (error) {
      next(error)
    }
  }

  getProfile = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?._id;
      if (!userId) {
        ResponseHandler.error(res, "User ID is missing", HttpStatus.BAD_REQUEST);
        return;
      }
      const user = await this.userService.getUserById(userId);
      console.log(user);


      ResponseHandler.success(res, { _id: user?._id, name: user?.name, email: user?.email, phone: user?.phone }, "Profile retrieved successfully")
    } catch (error) {
      next(error)
    }
  };

  getCurrentUser = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    ResponseHandler.success(res, null, "Success", HttpStatus.OK)

  }



  updateProfile = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?._id;
      const { name, phone } = req.body;

      if (!userId) {
        ResponseHandler.error(res, "Unauthorized", HttpStatus.UNAUTHORIZED);
        return;
      }


      const updatedUser = await this.userService.updateUser(userId, { name, phone });

      if (!updatedUser) {
        ResponseHandler.error(res, "User not found", HttpStatus.NOT_FOUND);
        return;
      }

      ResponseHandler.success(res, { user: updatedUser }, "Profile updated successfully");
    } catch (error) {
      next(error);
    }
  };



  profilePassword = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?._id;
      const { oldPassword, newPassword } = req.body;

      if (!oldPassword || !newPassword) {
        ResponseHandler.error(res, "Both old and new passwords are required", HttpStatus.BAD_REQUEST);
        return;
      }
      if (userId) {
        const user = await this.userService.getUserById(userId);
        if (!user) {
          ResponseHandler.error(res, "User not found", HttpStatus.NOT_FOUND);
          return;
        }

        const isMatch = await user.comparePassword(oldPassword);
        if (!isMatch) {
          ResponseHandler.error(res, "Old password is incorrect", HttpStatus.UNAUTHORIZED);
          return;
        }

        user.password = newPassword;
        await user.save();

        ResponseHandler.success(res, null, "Password updated successfully");
      }
    } catch (error) {
      next(error);
    }
  };


  logout = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const email = req.user?.email;
      if (!email) {
        ResponseHandler.error(res, "User not authenticated", HttpStatus.UNAUTHORIZED);
        return;
      }

      // 1. Get the user
      const user = await this.userService.getUserByEmail(email);
      if (!user) {
        ResponseHandler.error(res, "User not found", HttpStatus.NOT_FOUND)
        return;
      }

      // 2. Update status to inactive
      user.status = "inactive";
      await user.save();

      // 3. Clear cookie
      res.clearCookie("token", {
        httpOnly: true,
        secure: environment.isProduction(),
        sameSite: "lax",
      });

      // 4. Send success response
      ResponseHandler.success(res, null, "Logout successful and user set to inactive");
    } catch (error) {
      ResponseHandler.error(res, "Logout failed", HttpStatus.INTERNAL_SERVER_ERROR);
    }
  };

}
