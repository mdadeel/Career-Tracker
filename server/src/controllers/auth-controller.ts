import { Response, NextFunction } from "express";
import { z } from "zod";
import { authService } from "../services/auth-service";
import { AppError } from "../middlewares/error-handler";
import { AuthenticatedRequest } from "../types";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
});

const updateResumeSchema = z.object({
  resumeText: z.string().max(50000, "Resume text too long (max 50,000 characters)"),
});

const updateAiConfigSchema = z.object({
  aiProvider: z.enum(["system_default", "google", "openai", "openrouter", "custom"], {
    errorMap: () => ({ message: "Invalid AI provider" }),
  }),
  aiApiKey: z.string().max(500).optional(),
  aiBaseUrl: z.string().url("Invalid base URL").max(500).optional().or(z.literal("")),
  aiModel: z.string().max(200).optional(),
});

/** Set the JWT as an httpOnly cookie on the response. */
function setTokenCookie(res: Response, token: string): void {
  const isProduction = process.env.NODE_ENV === "production";
  res.cookie("token", token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/",
    maxAge: 24 * 60 * 60 * 1000, // 24 hours (matches JWT_EXPIRY default)
  });
}

function clearTokenCookie(res: Response): void {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    path: "/",
  });
}

export async function register(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const data = registerSchema.parse(req.body);
    const result = await authService.register(data);

    setTokenCookie(res, result.token);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
      return;
    }
    next(error);
  }
}

export async function login(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const data = loginSchema.parse(req.body);
    const result = await authService.login(data);

    setTokenCookie(res, result.token);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
      return;
    }
    next(error);
  }
}

export async function logout(
  _req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    clearTokenCookie(res);
    res.status(200).json({ success: true, data: { message: "Logged out successfully" } });
  } catch (error) {
    next(error);
  }
}

export async function me(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const user = await authService.me(userId);

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
      return;
    }
    next(error);
  }
}

export async function changePassword(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const data = changePasswordSchema.parse(req.body);

    const result = await authService.changePassword(userId, data);

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
      return;
    }
    next(error);
  }
}

export async function updateResume(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { resumeText } = updateResumeSchema.parse(req.body);
    const user = await authService.updateResume(userId, resumeText);
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
}

export async function updateAiConfig(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const data = updateAiConfigSchema.parse(req.body);
    const user = await authService.updateAiConfig(userId, data);
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
}
