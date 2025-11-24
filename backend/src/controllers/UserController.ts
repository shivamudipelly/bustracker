import { Request, Response } from "express";
import { UserService } from "@/services/UserService";
import { ResponseHandler } from "@/utils/response";
import { catchAsync } from "@/utils/catchAsync";
import { validate, createUserSchema, loginSchema } from "@/utils/validators";
import { AuthenticatedRequest, HttpStatus } from "@/types";
import { environment } from "@/config/environment";
import { UnauthorizedError } from "@/utils/errors";
import jwt from "jsonwebtoken";

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  register = catchAsync(async (req: Request, res: Response) => {
    const userData = validate(createUserSchema, req.body);
    await this.userService.createUser(userData);
    ResponseHandler.success(
      res,
      null,
      "Verification email sent. Please check your inbox.",
      HttpStatus.CREATED,
    );
  });

  login = catchAsync(async (req: Request, res: Response) => {
    const loginData = validate(loginSchema, req.body);
    const user = await this.userService.getUserByEmail(loginData.email);

    if (!user || !user.isVerified) {
      throw new UnauthorizedError("Invalid credentials or email not verified");
    }

    const isPasswordValid = await user.comparePassword(loginData.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError("Invalid credentials");
    }

    // Update login stats
    user.lastLogin = new Date();
    user.status = "active";
    await user.save();

    // Generate Token
    const tokenExpiry = loginData.rememberMe ? "7d" : "1d";
    const cookieMaxAge = loginData.rememberMe
      ? 7 * 24 * 60 * 60 * 1000
      : 24 * 60 * 60 * 1000;

    const token = jwt.sign(
      { userId: user._id },
      environment.get("JWT_SECRET"),
      { expiresIn: tokenExpiry },
    );

    // Set Cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: environment.isProduction(),
      sameSite: environment.isProduction() ? "none" : "lax",
      maxAge: cookieMaxAge,
    });

    const userResponse = {
      name: user.name,
      email: user.email,
      role: user.role,
    };

    ResponseHandler.success(res, { user: userResponse }, "Login successful");
  });

  verifyEmail = catchAsync(async (req: Request, res: Response) => {
    const token = req.query.token as string;
    if (!token) {
      ResponseHandler.error(
        res,
        "Verification token is missing",
        HttpStatus.BAD_REQUEST,
      );
      return;
    }
    await this.userService.verifyUser(token);
    ResponseHandler.success(
      res,
      null,
      "Email verified successfully. You can now log in.",
    );
  });

  forgotPassword = catchAsync(async (req: Request, res: Response) => {
    const { email } = req.body;
    await this.userService.sendPasswordResetEmail(email);
    ResponseHandler.success(
      res,
      null,
      "If a user exists with that email, a reset link has been sent.",
    );
  });

  resetPassword = catchAsync(async (req: Request, res: Response) => {
    const token = req.query.token as string;
    const { password } = req.body;

    if (!token) {
      ResponseHandler.error(
        res,
        "Reset token is missing",
        HttpStatus.BAD_REQUEST,
      );
      return;
    }
    if (!password || password.length < 6) {
      ResponseHandler.error(
        res,
        "Password must be at least 6 characters long",
        HttpStatus.BAD_REQUEST,
      );
      return;
    }

    await this.userService.resetPassword(token, password);
    ResponseHandler.success(res, null, "Password reset successfully");
  });

  getProfile = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?._id;
    if (!userId) throw new UnauthorizedError("User ID is missing");

    const user = await this.userService.getUserById(userId);
    if (!user) throw new UnauthorizedError("User not found");

    ResponseHandler.success(
      res,
      {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
      "Profile retrieved successfully",
    );
  });

  getCurrentUser = catchAsync(
    async (req: AuthenticatedRequest, res: Response) => {
      // Middleware already attaches user, so this confirms validity
      ResponseHandler.success(
        res,
        { user: req.user },
        "Success",
        HttpStatus.OK,
      );
    },
  );

  updateProfile = catchAsync(
    async (req: AuthenticatedRequest, res: Response) => {
      const userId = req.user?._id;
      const { name, phone } = req.body;

      if (!userId) throw new UnauthorizedError("Unauthorized");

      const updatedUser = await this.userService.updateUser(userId, {
        name,
        phone,
      });
      if (!updatedUser) throw new UnauthorizedError("User not found");

      ResponseHandler.success(
        res,
        { user: updatedUser },
        "Profile updated successfully",
      );
    },
  );

  profilePassword = catchAsync(
    async (req: AuthenticatedRequest, res: Response) => {
      const userId = req.user?._id;
      const { oldPassword, newPassword } = req.body;

      if (!userId) throw new UnauthorizedError("Unauthorized");
      if (!oldPassword || !newPassword) {
        ResponseHandler.error(
          res,
          "Both old and new passwords are required",
          HttpStatus.BAD_REQUEST,
        );
        return;
      }

      const user = await this.userService.getUserById(userId);
      if (!user) throw new UnauthorizedError("User not found");

      const isMatch = await user.comparePassword(oldPassword);
      if (!isMatch) {
        ResponseHandler.error(
          res,
          "Old password is incorrect",
          HttpStatus.UNAUTHORIZED,
        );
        return;
      }

      user.password = newPassword;
      await user.save();

      ResponseHandler.success(res, null, "Password updated successfully");
    },
  );

  logout = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    const email = req.user?.email;

    if (email) {
      const user = await this.userService.getUserByEmail(email);
      if (user) {
        user.status = "inactive";
        await user.save();
      }
    }

    res.clearCookie("token", {
      httpOnly: true,
      secure: environment.isProduction(),
      sameSite: "lax",
    });

    ResponseHandler.success(res, null, "Logout successful");
  });
}
