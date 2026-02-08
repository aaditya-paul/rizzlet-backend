import { Request, Response, NextFunction } from "express";
import { HTTP_STATUS } from "../config/constants";

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: err.message,
      status: "error",
    });
    return;
  }

  // Unexpected errors
  console.error("❌ Unexpected Error:", err);

  res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    error: "Internal server error",
    status: "error",
  });
};
