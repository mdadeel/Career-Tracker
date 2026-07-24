import { prisma } from "../utils/prisma";
import { hashPassword, verifyPassword } from "../utils/password";
import { generateToken } from "../utils/token";
import { AppError } from "../middlewares/error-handler";

export const authService = {
  async register(data: { name: string; email: string; password: string }) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new AppError("Email already registered", 400);
    }

    const passwordHash = await hashPassword(data.password);

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    const token = generateToken({ userId: user.id, email: user.email });
    return { token, user };
  },

  async login(data: { email: string; password: string }) {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      throw new AppError("Invalid credentials", 401);
    }

    const isPasswordValid = await verifyPassword(data.password, user.passwordHash);

    if (!isPasswordValid) {
      throw new AppError("Invalid credentials", 401);
    }

    const token = generateToken({ userId: user.id, email: user.email });
    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
    };
  },

  async me(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        resumeText: true,
        skills: true,
        aiProvider: true,
        aiApiKey: true,
        aiBaseUrl: true,
        aiModel: true,
        createdAt: true,
      } as any,
    });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    return user;
  },

  async changePassword(userId: string, data: { currentPassword: string; newPassword: string }) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    const isCurrentPasswordValid = await verifyPassword(data.currentPassword, user.passwordHash);

    if (!isCurrentPasswordValid) {
      throw new AppError("Current password is incorrect", 400);
    }

    const newPasswordHash = await hashPassword(data.newPassword);

    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newPasswordHash },
    });

    return { message: "Password changed successfully" };
  },

  async updateResume(userId: string, resumeText: string) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { resumeText } as any,
      select: {
        id: true,
        name: true,
        email: true,
        resumeText: true,
        skills: true,
        aiProvider: true,
        aiApiKey: true,
        aiBaseUrl: true,
        aiModel: true,
        createdAt: true,
      } as any,
    });
    return user;
  },

  async updateAiConfig(userId: string, data: { aiProvider: string; aiApiKey?: string; aiBaseUrl?: string; aiModel?: string }) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        aiProvider: data.aiProvider,
        aiApiKey: data.aiApiKey ?? null,
        aiBaseUrl: data.aiBaseUrl ?? null,
        aiModel: data.aiModel ?? null,
      } as any,
      select: {
        id: true,
        name: true,
        email: true,
        resumeText: true,
        skills: true,
        aiProvider: true,
        aiApiKey: true,
        aiBaseUrl: true,
        aiModel: true,
        createdAt: true,
      } as any,
    });
    return user;
  },
};
