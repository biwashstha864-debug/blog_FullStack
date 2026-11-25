import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { AppError } from "./app-error.js";

export interface RefreshTokenPayload {
  userId: number;
  sessionId: string;
  tokenType: "refresh";
}

export const generateAccessToken = (
  userId: number,
  role: string
) => {
  return jwt.sign(
    { userId, role },
    env.JWT_ACCESS_SECRET,
    { expiresIn: "15m" }
  );
};

export const generateRefreshToken = (userId: number,sessionId:string) => {
  return jwt.sign(
    { userId,sessionId, tokenType: "refresh" },
    env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );
};

export const verifyAccessToken = (token: string) => {
  return jwt.verify(token, env.JWT_ACCESS_SECRET);
};

export const verifyRefreshToken = (token: string): RefreshTokenPayload => {
  const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET);

  if (
    typeof decoded === "string" ||
    typeof decoded.userId !== "number" ||
    typeof decoded.sessionId !== "string" ||
    decoded.tokenType !== "refresh"
  ) {
    throw new AppError("Invalid refresh token", 401);
  }

  return {
    userId: decoded.userId,
    sessionId: decoded.sessionId,
    tokenType: "refresh",
  };
};