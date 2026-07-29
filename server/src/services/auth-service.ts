import { prisma } from "../utils/prisma";
import { hashPassword, verifyPassword } from "../utils/password";
import { generateToken } from "../utils/token";
import { AppError } from "../middlewares/error-handler";

export const authService = {
  async register(data: { name: string; email: string; password: string }) {
    const email = data.email.toLowerCase().trim();
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new AppError("Email already registered", 400);
    }

    const passwordHash = await hashPassword(data.password);

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email,
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
    const email = data.email.toLowerCase().trim();
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new AppError(
        "Invalid email or password",
        401,
        `Invalid credentials - no user found with email: ${email}`
      );
    }

    const isPasswordValid = await verifyPassword(data.password, user.passwordHash);

    if (!isPasswordValid) {
      throw new AppError(
        "Invalid email or password",
        401,
        "Invalid credentials - incorrect password"
      );
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
      },
    });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    // Never return the real API key — just whether one is set
    return {
      ...user,
      aiApiKey: user.aiApiKey ? "••••••••" : null,
    };
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
      data: { resumeText },
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
      },
    });
    // Mask the API key — never return plaintext to the client
    return {
      ...user,
      aiApiKey: user.aiApiKey ? "••••••••" : null,
    };
  },

  async updateAiConfig(userId: string, data: { aiProvider: string; aiApiKey?: string; aiBaseUrl?: string; aiModel?: string }) {
    // Build update payload — only update aiApiKey if user sent a real new key
    // (not the masked placeholder returned by /me)
    const updatePayload: Record<string, unknown> = {
      aiProvider: data.aiProvider,
      aiBaseUrl: data.aiBaseUrl ?? null,
      aiModel: data.aiModel ?? null,
    };

    // Only overwrite the key if user provided a real value (not the mask or empty)
    if (data.aiApiKey && !data.aiApiKey.startsWith("••")) {
      updatePayload.aiApiKey = data.aiApiKey;
    } else if (data.aiApiKey === "") {
      // Explicitly clearing the key
      updatePayload.aiApiKey = null;
    }
    // If aiApiKey is undefined or is the mask, don't touch it

    const user = await prisma.user.update({
      where: { id: userId },
      data: updatePayload,
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
      },
    });

    // Return masked version, same as me()
    return {
      ...user,
      aiApiKey: user.aiApiKey ? "••••••••" : null,
    };
  },
};
