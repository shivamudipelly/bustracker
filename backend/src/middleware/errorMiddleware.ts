import type { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/errors";
import { ResponseHandler } from "../utils/response";
import { logger } from "../config/logger";
import { environment } from "../config/environment";

export const errorHandler = (
  err: any, // ✅ Fixed: Simplified type to satisfy linter
  req: Request,
  res: Response,
  _next: NextFunction, // ✅ Fixed: Renamed to _next to ignore "unused" warning
): void => {
  let customError =
    err instanceof AppError
      ? err
      : new AppError(err.message || "Internal Server Error", 500);

  // Handle known MongoDB & JWT error types
  if (err.name === "CastError") {
    customError = new AppError("Resource not found", 404);
  }

  if (err.name === "ValidationError") {
    const errors = err.errors ? Object.values(err.errors) : [];
    const message = errors.map((val: any) => val.message).join(", ");
    customError = new AppError(message, 400);
  }

  if (err.name === "JsonWebTokenError") {
    customError = new AppError("Invalid token", 401);
  }

  if (err.name === "TokenExpiredError") {
    customError = new AppError("Token expired", 401);
  }

  // Handle MongoDB duplicate key error
  if (err.code === 11000) {
    customError = new AppError("Duplicate field value entered", 400);
  }

  // Log the error
  logger.error({
    message: customError.message,
    status: customError.statusCode,
    stack: err.stack,
    method: req.method,
    url: req.originalUrl,
  });

  // Send structured error to frontend
  ResponseHandler.error(
    res,
    customError.message,
    customError.statusCode,
    environment.isDevelopment() ? err.stack : undefined,
  );
};

export const notFoundHandler = (req: Request, res: Response): void => {
  ResponseHandler.error(res, `Route ${req.originalUrl} not found`, 404);
};
