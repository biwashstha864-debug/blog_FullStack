import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/app-error.js";

export const errorHandler = (
  error: unknown,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(error);

  if (res.headersSent) {
    return next(error);
  }
  
  if (error instanceof AppError) {
  return res.status(error.statusCode).json({
    success: false,
    message: error.message,
  });
}

  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2002"
  ) {
    return res.status(409).json({
      success: false,
      message: "Email or username is already registered",
    });
  }

  return res.status(500).json({
    success: false,
    message: "Internal server error",
  });
};