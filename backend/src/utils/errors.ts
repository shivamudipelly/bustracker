import { HttpStatus } from "../types";

/**
 * Base class for all custom application errors.
 */
export class AppError extends Error {
  public readonly statusCode: HttpStatus;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    statusCode: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR,
    isOperational: boolean = true,
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    // Maintains proper stack trace in V8
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 400 - Client validation error
 */
export class ValidationError extends AppError {
  constructor(message: string = "Invalid input") {
    super(message, HttpStatus.BAD_REQUEST);
  }
}

/**
 * 404 - Resource not found
 */
export class NotFoundError extends AppError {
  constructor(resource: string = "Resource") {
    super(`${resource} not found`, HttpStatus.NOT_FOUND);
  }
}

/**
 * 401 - Unauthorized (authentication failed)
 */
export class UnauthorizedError extends AppError {
  constructor(message: string = "Unauthorized") {
    super(message, HttpStatus.UNAUTHORIZED);
  }
}

/**
 * 403 - Forbidden (authorization failed)
 */
export class ForbiddenError extends AppError {
  constructor(message: string = "Forbidden") {
    super(message, HttpStatus.FORBIDDEN);
  }
}

/**
 * 409 - Conflict (e.g., duplicate resource)
 */
export class ConflictError extends AppError {
  constructor(message: string = "Conflict occurred") {
    super(message, HttpStatus.CONFLICT);
  }
}
