
import { Request, Response, NextFunction } from "express";
import {
  registerUser,
  loginUser,
  getMe,
  refreshUserSession
} from "../services/auth.services.js";
import { env } from "../config/env.js";
import { AppError } from "../utils/app-error.js";

export const registerController = async (
  req: Request,
  res: Response,
  next: NextFunction,
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

export const loginController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { user, accessToken, refreshToken } = await loginUser(req.body);

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 15 * 60 * 1000,
      path : "/"
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/api/auth",
    });

    

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user,
      },
    });

    
  } catch (error) {
    return next(error);
  }
};


export const getMeController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = await getMe(req.user!.id);

    return res.status(200).json({
      success: true,
      message: "User retrieved successfully",
      data: {
        user,
      },
    });
  } catch (error) {
    return next(error);
  }
};


export const refreshController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      throw new AppError("Refresh token required", 401);
    }

    const { accessToken, refreshToken: newRefreshToken } =
      await refreshUserSession(refreshToken);

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 15 * 60 * 1000,
      path: "/",
    });

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/api/auth",
    });

    return res.status(200).json({
      success: true,
      message: "Tokens refreshed successfully",
    });
  } catch (error) {
    return next(error);
  }
};