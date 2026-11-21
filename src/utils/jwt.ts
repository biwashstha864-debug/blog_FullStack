import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

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

export const generateRefreshToken = (userId: number) => {
  return jwt.sign(
    { userId, tokenType: "refresh" },
    env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );
};

export const verifyAccessToken = (token: string) => {
  return jwt.verify(token, env.JWT_ACCESS_SECRET);
};

export const verifyRefreshToken = (token: string) => {
  return jwt.verify(token, env.JWT_REFRESH_SECRET);
};