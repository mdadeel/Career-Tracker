import type { Prisma } from "@prisma/client";
import { ApplicationStatus, ApplicationSource } from "@prisma/client";
import { prisma } from "../utils/prisma";
import { AppError } from "../middlewares/error-handler";

export interface GetAllParams {
  userId: string;
  search?: string;
  status?: string;
  source?: string;
  sortBy?: string;
  page: number;
  limit: number;
}

export interface CreateData {
  companyName: string;
  jobTitle: string;
  jobUrl?: string;
  source: string;
  applicationDate: string;
  status: string;
  notes?: string;
  jobDescription?: string;
  resumeLink?: string;
  resumeText?: string;
  resumeId?: string | null;
  interviewDate?: string | null;
  salaryMin?: number | null;
  salaryMax?: number | null;
  salaryCurrency?: string;
  location?: string | null;
  employmentType?: string | null;
  remoteStatus?: string | null;
  companyLogo?: string | null;
}

export interface UpdateData {
  companyName?: string;
  jobTitle?: string;
  jobUrl?: string;
  source?: string;
  applicationDate?: string;
  status?: string;
  notes?: string;
  jobDescription?: string;
  resumeLink?: string;
  resumeText?: string;
  resumeId?: string | null;
  interviewDate?: string | null;
  salaryMin?: number | null;
  salaryMax?: number | null;
  salaryCurrency?: string;
  location?: string | null;
  employmentType?: string | null;
  remoteStatus?: string | null;
  companyLogo?: string | null;
}

export const applicationService = {
  async getAll(params: GetAllParams) {
    const { userId, search, status, source: sourceFilter, sortBy, page, limit } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.ApplicationWhereInput = { userId };

    if (status && status !== "All") {
      where.status = status as ApplicationStatus;
    }

    if (sourceFilter && sourceFilter !== "All") {
      where.source = sourceFilter as ApplicationSource;
    }

    if (search) {
      where.OR = [
        { companyName: { contains: search, mode: "insensitive" } },
        { jobTitle: { contains: search, mode: "insensitive" } },
        { jobDescription: { contains: search, mode: "insensitive" } },
      ];
    }

    let orderBy: Record<string, string> = { createdAt: "desc" };
    if (sortBy === "oldest") {
      orderBy = { createdAt: "asc" };
    } else if (sortBy === "date-newest") {
      orderBy = { applicationDate: "desc" };
    } else if (sortBy === "date-oldest") {
      orderBy = { applicationDate: "asc" };
    }

    const [applications, total] = await Promise.all([
      prisma.application.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        select: {
          id: true,
          companyName: true,
          jobTitle: true,
          jobUrl: true,
          source: true,
          applicationDate: true,
          status: true,
          resumeLink: true,
          resumeId: true,
          interviewDate: true,
          salaryMin: true,
          salaryMax: true,
          salaryCurrency: true,
          location: true,
          employmentType: true,
          remoteStatus: true,
          companyLogo: true,
          aiMatchScore: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.application.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);
    return { applications, total, page, limit, totalPages };
  },

  async getById(id: string, userId: string) {
    const application = await prisma.application.findUnique({ where: { id } });

    if (!application) {
      throw new AppError("Application not found", 404);
    }

    if (application.userId !== userId) {
      throw new AppError("You do not have permission to access this application", 403);
    }

    return application;
  },

  async create(userId: string, data: CreateData) {
    const application = await prisma.application.create({
      data: {
        companyName: data.companyName,
        jobTitle: data.jobTitle,
        jobUrl: data.jobUrl || null,
        source: data.source as ApplicationSource,
        applicationDate: new Date(data.applicationDate),
        status: (data.status as ApplicationStatus) || ApplicationStatus.Saved,
        notes: data.notes || null,
        jobDescription: data.jobDescription || null,
        resumeLink: data.resumeLink || null,
        resumeText: data.resumeText || null,
        resumeId: data.resumeId || null,
        interviewDate: data.interviewDate ? new Date(data.interviewDate) : null,
        salaryMin: data.salaryMin ?? null,
        salaryMax: data.salaryMax ?? null,
        salaryCurrency: data.salaryCurrency || "USD",
        location: data.location || null,
        employmentType: data.employmentType || null,
        remoteStatus: data.remoteStatus || null,
        companyLogo: data.companyLogo || null,
        userId,
      },
    });
    return application;
  },

  async update(id: string, userId: string, data: UpdateData) {
    const updateData: Record<string, unknown> = {};
    if (data.companyName !== undefined) updateData.companyName = data.companyName;
    if (data.jobTitle !== undefined) updateData.jobTitle = data.jobTitle;
    if (data.jobUrl !== undefined) updateData.jobUrl = data.jobUrl || null;
    if (data.source !== undefined) updateData.source = data.source as ApplicationSource;
    if (data.applicationDate !== undefined) updateData.applicationDate = new Date(data.applicationDate);
    if (data.status !== undefined) updateData.status = data.status as ApplicationStatus;
    if (data.notes !== undefined) updateData.notes = data.notes || null;
    if (data.jobDescription !== undefined) updateData.jobDescription = data.jobDescription || null;
    if (data.resumeLink !== undefined) updateData.resumeLink = data.resumeLink || null;
    if (data.resumeText !== undefined) updateData.resumeText = data.resumeText || null;
    if (data.resumeId !== undefined) updateData.resumeId = data.resumeId || null;
    if (data.interviewDate !== undefined) {
      updateData.interviewDate = data.interviewDate ? new Date(data.interviewDate) : null;
    }
    if (data.salaryMin !== undefined) updateData.salaryMin = data.salaryMin;
    if (data.salaryMax !== undefined) updateData.salaryMax = data.salaryMax;
    if (data.salaryCurrency !== undefined) updateData.salaryCurrency = data.salaryCurrency;
    if (data.location !== undefined) updateData.location = data.location || null;
    if (data.employmentType !== undefined) updateData.employmentType = data.employmentType || null;
    if (data.remoteStatus !== undefined) updateData.remoteStatus = data.remoteStatus || null;
    if (data.companyLogo !== undefined) updateData.companyLogo = data.companyLogo || null;

    // Atomic: update only if both id and userId match — no TOCTOU
    const result = await prisma.application.updateMany({
      where: { id, userId },
      data: updateData as Prisma.ApplicationUpdateManyMutationInput,
    });

    if (result.count === 0) {
      const exists = await prisma.application.findUnique({ where: { id } });
      if (!exists) {
        throw new AppError("Application not found", 404);
      }
      throw new AppError("You do not have permission to modify this application", 403);
    }

    // Return the updated record
    return prisma.application.findUnique({ where: { id } });
  },

  async remove(id: string, userId: string) {
    // Single atomic delete query scoped by id and userId
    const result = await prisma.application.deleteMany({
      where: { id, userId },
    });

    if (result.count === 0) {
      const exists = await prisma.application.findUnique({ where: { id } });
      if (!exists) {
        throw new AppError("Application not found", 404);
      }
      throw new AppError("You do not have permission to delete this application", 403);
    }
  },
};

