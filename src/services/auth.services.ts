import bcrypt from "bcrypt";
import { prisma } from "../config/prisma.js";

interface RegisterInput {
  name: string;
  username: string;
  email: string;
  password: string;
}

export const registerUser = async (data: RegisterInput) => {
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        { email: data.email },
        { username: data.username },
      ],
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