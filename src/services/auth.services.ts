import bcrypt from "bcrypt";
import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/app-error.js";
import { generateAccessToken, generateRefreshToken,verifyRefreshToken } from "../utils/jwt.js";
import { randomUUID } from "node:crypto";
import { hashToken } from "../utils/token-hash.js";
import jwt from "jsonwebtoken";
import {RefreshTokenPayload} from "../utils/jwt.js";

interface RegisterInput {
  name: string;
  username: string;
  email: string;
  password: string;
}

export const registerUser = async (data: RegisterInput) => {
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ email: data.email }, { username: data.username }],
    },
    select: {
      id: true,
    },
  });

  if (existingUser) {
    throw new Error("EMAIL_OR_USERNAME_TAKEN");
  }

  const passwordHash = await bcrypt.hash(data.password, 12);

  const user = await prisma.user.create({
    data: {
      name: data.name,
      username: data.username,
      email: data.email,
      passwordHash,
    },
    select: {
      id: true,
      name: true,
      username: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  return user;
};

interface LoginInput{
  email : string,
  password:string
}

export const loginUser = async (data: LoginInput) => {
  const user = await prisma.user.findUnique({
    where: {
      email: data.email,
    },
  });

  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  const isPassword = await bcrypt.compare(data.password, user.passwordHash);

  if (!isPassword) {
    throw new AppError("Invalid email or password", 401);
  }

  const sessionId = randomUUID();

  const accessToken = generateAccessToken(user.id, user.role);
  const refreshToken = generateRefreshToken(user.id, sessionId);

  const refreshTokenHash = hashToken(refreshToken);

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await prisma.session.create({
    data: {
      id: sessionId,
      userId: user.id,
      refreshTokenHash,
      expiresAt,
    },
  });

  return {
    user: {
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      role: user.role,
    },
    accessToken,
    refreshToken,
  };
};

export const getMe = async (userId: number) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      name: true,
      username: true,
      email: true,
      bio: true,
      avatarUrl: true,
      role: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return user;
};

export const refreshUserSession = async (token: string) => {
  const decoded = verifyRefreshToken(token);

const session = await prisma.session.findFirst({
  where: {
    id: decoded.sessionId,
    userId: decoded.userId,
  },
  include: {
    user: {
      select: {
        role: true,
      },
    },
  },
});

if (!session) {
  throw new AppError("Session not found", 401);
}

if (session.revokedAt) {
  throw new AppError("Session has been revoked", 401);
}

if (session.expiresAt <= new Date()) {
  throw new AppError("Session has expired", 401);
}

const incomingTokenHash = hashToken(token);

if (incomingTokenHash !== session.refreshTokenHash) {
  await prisma.session.update({
    where: {
      id: session.id,
    },
    data: {
      revokedAt: new Date(),
    },
  });

  throw new AppError("Refresh token reuse detected. Session revoked.", 401);
}

const newAccessToken = generateAccessToken(
  session.userId,
  session.user.role
);

const newRefreshToken = generateRefreshToken(
  session.userId,
  session.id
);

const newRefreshTokenHash = hashToken(newRefreshToken);

const newExpiresAt = new Date(
  Date.now() + 7 * 24 * 60 * 60 * 1000
);

await prisma.session.update({
  where: {
    id: session.id,
  },
  data: {
    refreshTokenHash: newRefreshTokenHash,
    expiresAt: newExpiresAt,
  },
});

return {
  accessToken: newAccessToken,
  refreshToken: newRefreshToken,
};
};

export const logoutUser = async (token: string) => {
  let decoded: RefreshTokenPayload;

  try {
    decoded = verifyRefreshToken(token);
  } catch (error) {
    if (
      error instanceof jwt.TokenExpiredError ||
      error instanceof jwt.JsonWebTokenError ||
      (error instanceof AppError && error.statusCode === 401)
    ) {
      return;
    }

    throw error;
  }

  const session = await prisma.session.findFirst({
    where: {
      id: decoded.sessionId,
      userId: decoded.userId,
    },
  });

  if (!session || session.revokedAt) {
    return;
  }

  await prisma.session.update({
    where: {
      id: session.id,
    },
    data: {
      revokedAt: new Date(),
    },
  });
};