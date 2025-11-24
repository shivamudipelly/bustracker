import type { Response } from "express";
import { type ApiResponse, type PaginatedResponse, HttpStatus } from "../types";

export class ResponseHandler {
  static success<T>(
    res: Response,
    data: T,
    message = "Success",
    statusCode: HttpStatus = HttpStatus.OK,
  ): Response<ApiResponse<T>> {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  }

  static error(
    res: Response,
    message: string,
    statusCode: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR,
    error?: string,
  ): Response<ApiResponse> {
    return res.status(statusCode).json({
      success: false,
      message,
      error,
    });
  }

  static paginated<T>(
    res: Response,
    data: T[],
    page: number,
    limit: number,
    total: number,
    message = "Success",
  ): Response<PaginatedResponse<T>> {
    const totalPages = Math.ceil(total / limit);

    return res.status(HttpStatus.OK).json({
      success: true,
      message,
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  }
}
