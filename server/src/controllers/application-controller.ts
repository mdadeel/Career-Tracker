import { Response, NextFunction } from "express";
import { z } from "zod";
import { ApplicationStatus, ApplicationSource } from "@prisma/client";
import { applicationService } from "../services/application-service";
import { AppError } from "../middlewares/error-handler";
import { AuthenticatedRequest } from "../types";

const createApplicationSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  jobTitle: z.string().min(1, "Job title is required"),
  jobUrl: z.string().url("Invalid URL format").optional().or(z.literal("")),
  source: z.nativeEnum(ApplicationSource),
  applicationDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format",
  }),
  status: z.nativeEnum(ApplicationStatus).default(ApplicationStatus.Saved),
  notes: z.string().optional(),
  jobDescription: z.string().optional(),
  resumeLink: z.string().optional(),
  resumeText: z.string().optional(),
  resumeId: z.string().uuid().optional().nullable(),
  interviewDate: z.string().optional().nullable(),
  salaryMin: z.number().int().positive().optional().nullable(),
  salaryMax: z.number().int().positive().optional().nullable(),
  salaryCurrency: z.string().default("USD"),
  location: z.string().optional().nullable(),
  employmentType: z.string().optional().nullable(),
  remoteStatus: z.string().optional().nullable(),
  companyLogo: z.string().url().optional().nullable().or(z.literal("")),
});

const updateApplicationSchema = z.object({
  companyName: z.string().min(1).optional(),
  jobTitle: z.string().min(1).optional(),
  jobUrl: z.string().url().optional().or(z.literal("")),
  source: z.nativeEnum(ApplicationSource).optional(),
  applicationDate: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)))
    .optional(),
  status: z.nativeEnum(ApplicationStatus).optional(),
  notes: z.string().optional(),
  jobDescription: z.string().optional(),
  resumeLink: z.string().optional(),
  resumeText: z.string().optional(),
  resumeId: z.string().uuid().optional().nullable(),
  interviewDate: z.string().optional().nullable(),
  salaryMin: z.number().int().positive().optional().nullable(),
  salaryMax: z.number().int().positive().optional().nullable(),
  salaryCurrency: z.string().optional(),
  location: z.string().optional().nullable(),
  employmentType: z.string().optional().nullable(),
  remoteStatus: z.string().optional().nullable(),
  companyLogo: z.string().url().optional().nullable().or(z.literal("")),
});

export async function getAll(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const {
      search,
      status,
      source,
      sortBy = "newest",
      page: pageStr = "1",
      limit: limitStr = "10",
    } = req.query as Record<string, string | undefined>;

    const page = Math.max(1, parseInt(pageStr, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(limitStr, 10) || 10));

    const data = await applicationService.getAll({
      userId,
      search,
      status,
      source: source,
      sortBy,
      page,
      limit,
    });

    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function getById(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    const application = await applicationService.getById(id, userId);

    res.status(200).json({ success: true, data: application });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
      return;
    }
    next(error);
  }
}

export async function create(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const data = createApplicationSchema.parse(req.body);

    const application = await applicationService.create(userId, data);

    res.status(201).json({ success: true, data: application });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: error.errors[0]?.message || "Validation failed",
        errors: error.errors.map((e) => ({ field: e.path.join("."), message: e.message })),
      });
      return;
    }
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
      return;
    }
    next(error);
  }
}

export async function update(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;
    const data = updateApplicationSchema.parse(req.body);

    const application = await applicationService.update(id, userId, data);

    res.status(200).json({ success: true, data: application });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: error.errors[0]?.message || "Validation failed",
        errors: error.errors.map((e) => ({ field: e.path.join("."), message: e.message })),
      });
      return;
    }
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
      return;
    }
    next(error);
  }
}

export async function remove(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    await applicationService.remove(id, userId);

    res.status(200).json({
      success: true,
      message: "Application deleted successfully",
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
      return;
    }
    next(error);
  }
}
