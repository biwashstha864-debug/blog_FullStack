import { Request, Response, NextFunction } from "express";
import { registerUser } from "../services/auth.services.js";

export const registerController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await registerUser(req.body);

    return res.status(201).json({
      success: true,
      message: "Account created successfully",
      data: {
        user,
      },
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "EMAIL_OR_USERNAME_TAKEN"
    ) {
      return res.status(409).json({
        success: false,
        message: "Email or username is already registered",
      });
    }

    return next(error);
  }
};