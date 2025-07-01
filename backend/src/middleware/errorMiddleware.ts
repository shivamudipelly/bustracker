import type { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/errors";
import { ResponseHandler } from "../utils/response";
import { logger } from "../config/logger";
import { environment } from "../config/environment";

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let customError = err instanceof AppError ? err : new AppError(err.message, 500);

  // Handle known MongoDB & JWT error types
  switch (err.name) {
    case "CastError":
      customError = new AppError("Resource not found", 404);
      break;

    case "ValidationError":
      const message = Object.values((err as any).errors)
        .map((val: any) => val.message)
        .join(", ");
      customError = new AppError(message, 400);
      break;

    case "JsonWebTokenError":
      customError = new AppError("Invalid token", 401);
      break;

    case "TokenExpiredError":
      customError = new AppError("Token expired", 401);
      break;
  }

  // Handle MongoDB duplicate key error
  if ((err as any).code === 11000) {
    customError = new AppError("Duplicate field value entered", 400);
  }

  // Log the error (structured)
  logger.error({
    message: customError.message,
    status: customError.statusCode,
    stack: err.stack,
    method: req.method,
    url: req.originalUrl,
    body: req.body,
    params: req.params,
    query: req.query,
  });

  // Send structured error to frontend
  ResponseHandler.error(
    res,
    customError.message,
    customError.statusCode,
    environment.isDevelopment() ? err.stack : undefined
  );
};

export const notFoundHandler = (req: Request, res: Response): void => {
  ResponseHandler.error(res, `Route ${req.originalUrl} not found`, 404);
};
