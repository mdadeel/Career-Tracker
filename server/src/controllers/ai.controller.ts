import { Request, Response, NextFunction } from 'express';
import { AiService, type UserAiConfig } from '../services/ai.service';
import { prisma } from '../utils/prisma';
import z from 'zod';
import { AuthenticatedRequest } from '../types';


const parseJdSchema = z.object({
  jobDescription: z.string().min(20, 'Job description must be at least 20 characters long'),
});

const generateEmailSchema = z.object({
  type: z.enum(['follow_up', 'thank_you', 'cold_outreach']),
  applicationId: z.string().uuid(),
});

/** Fields from User that map to UserAiConfig — kept in sync manually. */
interface UserAiConfigFields {
  aiProvider: string;
  aiApiKey: string | null;
  aiBaseUrl: string | null;
  aiModel: string | null;
}

function toUserAiConfig(row: UserAiConfigFields | null | undefined): UserAiConfig | undefined {
  if (!row) return undefined;
  return {
    aiProvider: row.aiProvider,
    aiApiKey: row.aiApiKey,
    aiBaseUrl: row.aiBaseUrl,
    aiModel: row.aiModel,
  };
}

async function getUserAiConfig(userId?: string): Promise<UserAiConfig | undefined> {
  if (!userId) return undefined;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { aiProvider: true, aiApiKey: true, aiBaseUrl: true, aiModel: true },
  });
  return toUserAiConfig(user);
}

export class AiController {
  static async testConfig(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as AuthenticatedRequest).user?.userId;
      const { aiProvider, aiApiKey, aiBaseUrl, aiModel } = req.body;

      // If no key provided in request, fall back to stored key from DB
      let effectiveKey = aiApiKey;
      if (!effectiveKey && userId && aiProvider !== 'system_default') {
        const dbConfig = await getUserAiConfig(userId);
        effectiveKey = dbConfig?.aiApiKey;
      }

      const result = await AiService.testAiConfig({ aiProvider, aiApiKey: effectiveKey, aiBaseUrl, aiModel });
      res.status(200).json({ success: true, data: { message: result.message } });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Connection test failed';
      res.status(400).json({ success: false, message });
    }
  }

  static async parseJobDescription(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as AuthenticatedRequest).user?.userId;
      const { jobDescription } = parseJdSchema.parse(req.body);
      const aiConfig = await getUserAiConfig(userId);
      const parsedData = await AiService.parseJobDescription(jobDescription, aiConfig);
      res.status(200).json({ success: true, data: parsedData });
    } catch (error) {
      next(error);
    }
  }

  static async analyzeMatch(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as AuthenticatedRequest).user!.userId;
      const applicationId = req.params.id;

      const application = await prisma.application.findUnique({
        where: { id: applicationId, userId },
        include: { resume: true },
      });

      if (!application) {
        res.status(404).json({ success: false, message: 'Application not found' });
        return;
      }

      if (!application.jobDescription) {
        res.status(400).json({ success: false, message: 'Application does not have a Job Description saved.' });
        return;
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { resumeText: true, skills: true, aiProvider: true, aiApiKey: true, aiBaseUrl: true, aiModel: true },
      });

      if (!user) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
      }

      const effectiveResumeText =
        application.resume?.textContent ||
        application.resumeText ||
        user.resumeText ||
        (Array.isArray(user.skills) ? `Skills: ${user.skills.join(', ')}` : '');
      const aiConfig = toUserAiConfig(user);
      const analysis = await AiService.analyzeMatch(application.jobDescription, effectiveResumeText, aiConfig);

      // Save match score and analysis output back to application
      await prisma.application.update({
        where: { id: applicationId },
        data: {
          aiMatchScore: analysis.matchScore,
          aiAnalysis: JSON.parse(JSON.stringify(analysis)),
        },
      });

      res.status(200).json({ success: true, data: analysis });
    } catch (error) {
      next(error);
    }
  }

  static async generateInterviewPrep(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as AuthenticatedRequest).user!.userId;
      const applicationId = req.params.id;

      const application = await prisma.application.findUnique({
        where: { id: applicationId, userId },
      });

      if (!application) {
        res.status(404).json({ success: false, message: 'Application not found' });
        return;
      }

      const aiConfig = await getUserAiConfig(userId);
      const questions = await AiService.generateInterviewPrep(
        application.jobTitle,
        application.companyName,
        application.jobDescription || undefined,
        aiConfig
      );

      res.status(200).json({ success: true, data: questions });
    } catch (error) {
      next(error);
    }
  }

  static async generateOutreachEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as AuthenticatedRequest).user!.userId;
      const { type, applicationId } = generateEmailSchema.parse(req.body);

      const application = await prisma.application.findUnique({
        where: { id: applicationId, userId },
      });

      if (!application) {
        res.status(404).json({ success: false, message: 'Application not found' });
        return;
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { name: true, aiProvider: true, aiApiKey: true, aiBaseUrl: true, aiModel: true },
      });

      if (!user) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
      }

      const aiConfig = toUserAiConfig(user);
      const emailDraft = await AiService.generateOutreachEmail(
        type,
        application.companyName,
        application.jobTitle,
        user.name,
        aiConfig
      );

      res.status(200).json({ success: true, data: emailDraft });
    } catch (error) {
      next(error);
    }
  }
}
