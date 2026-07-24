import { Request, Response, NextFunction } from 'express';
import { AiService, UserAiConfig } from '../services/ai.service';
import { prisma } from '../utils/prisma';
import z from 'zod';

const parseJdSchema = z.object({
  jobDescription: z.string().min(20, 'Job description must be at least 20 characters long'),
});

const generateEmailSchema = z.object({
  type: z.enum(['follow_up', 'thank_you', 'cold_outreach']),
  applicationId: z.string().uuid(),
});

async function getUserAiConfig(userId?: string): Promise<UserAiConfig | undefined> {
  if (!userId) return undefined;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { aiProvider: true, aiApiKey: true, aiBaseUrl: true, aiModel: true } as any,
  });
  if (!user) return undefined;
  return user as UserAiConfig;
}

export class AiController {
  static async testConfig(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { aiProvider, aiApiKey, aiBaseUrl, aiModel } = req.body;
      const result = await AiService.testAiConfig({ aiProvider, aiApiKey, aiBaseUrl, aiModel });
      res.status(200).json({ status: 'success', message: result.message });
    } catch (error: any) {
      res.status(400).json({ status: 'error', message: error?.message || 'Connection test failed' });
    }
  }

  static async parseJobDescription(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId || (req as any).user?.id;
      const { jobDescription } = parseJdSchema.parse(req.body);
      const aiConfig = await getUserAiConfig(userId);
      const parsedData = await AiService.parseJobDescription(jobDescription, aiConfig);
      res.status(200).json({ status: 'success', data: parsedData });
    } catch (error) {
      next(error);
    }
  }

  static async analyzeMatch(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user.userId || (req as any).user.id;
      const applicationId = req.params.id;

      const user = await prisma.user.findUnique({ where: { id: userId } });
      const application = await prisma.application.findUnique({
        where: { id: applicationId, userId },
      });

      if (!application) {
        res.status(404).json({ status: 'error', message: 'Application not found' });
        return;
      }

      if (!application.jobDescription) {
        res.status(400).json({ status: 'error', message: 'Application does not have a Job Description saved.' });
        return;
      }

      const uAny = user as any;
      const appAny = application as any;
      const effectiveResumeText =
        appAny?.resumeText ||
        uAny?.resumeText ||
        (uAny?.skills ? `Skills: ${uAny.skills.join(', ')}` : '');
      const aiConfig = await getUserAiConfig(userId);
      const analysis = await AiService.analyzeMatch(application.jobDescription, effectiveResumeText, aiConfig);

      // Save match score and analysis output back to application
      await prisma.application.update({
        where: { id: applicationId },
        data: {
          aiMatchScore: analysis.matchScore,
          aiAnalysis: analysis as any,
        } as any,
      });

      res.status(200).json({ status: 'success', data: analysis });
    } catch (error) {
      next(error);
    }
  }

  static async generateInterviewPrep(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user.userId || (req as any).user.id;
      const applicationId = req.params.id;

      const application = await prisma.application.findUnique({
        where: { id: applicationId, userId },
      });

      if (!application) {
        res.status(404).json({ status: 'error', message: 'Application not found' });
        return;
      }

      const aiConfig = await getUserAiConfig(userId);
      const questions = await AiService.generateInterviewPrep(
        application.jobTitle,
        application.companyName,
        application.jobDescription || undefined,
        aiConfig
      );

      res.status(200).json({ status: 'success', data: questions });
    } catch (error) {
      next(error);
    }
  }

  static async generateOutreachEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user.userId || (req as any).user.id;
      const { type, applicationId } = generateEmailSchema.parse(req.body);

      const user = await prisma.user.findUnique({ where: { id: userId } });
      const application = await prisma.application.findUnique({
        where: { id: applicationId, userId },
      });

      if (!application || !user) {
        res.status(404).json({ status: 'error', message: 'Application or User not found' });
        return;
      }

      const aiConfig = await getUserAiConfig(userId);
      const emailDraft = await AiService.generateOutreachEmail(
        type,
        application.companyName,
        application.jobTitle,
        user.name,
        aiConfig
      );

      res.status(200).json({ status: 'success', data: emailDraft });
    } catch (error) {
      next(error);
    }
  }
}
