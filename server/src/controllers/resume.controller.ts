import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { resumeService } from '../services/resume.service';
import { validateFile, parseResumeFile } from '../lib/resumeParser';
import fs from 'fs/promises';
import path from 'path';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'resumes');

export class ResumeController {
  static async upload(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const file = req.file;

      if (!file) {
        res.status(400).json({ success: false, message: 'No file provided.' });
        return;
      }

      const validationError = validateFile(file.mimetype, file.size);
      if (validationError) {
        await fs.unlink(file.path).catch(() => {});
        res.status(400).json({ success: false, message: validationError });
        return;
      }

      const textContent = await parseResumeFile(file.path, file.mimetype);

      const result = await resumeService.create(userId, file, textContent);

      res.status(201).json({ success: true, data: { ...result, textContent } });
    } catch (error) {
      next(error);
    }
  }

  static async list(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const resumes = await resumeService.list(userId);
      res.status(200).json({ success: true, data: resumes });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const resume = await resumeService.getById(req.params.id, userId);
      res.status(200).json({ success: true, data: resume });
    } catch (error) {
      next(error);
    }
  }

  static async update(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { textContent, fileName } = req.body;
      const updated = await resumeService.update(req.params.id, userId, { textContent, fileName });
      res.status(200).json({ success: true, data: updated });
    } catch (error) {
      next(error);
    }
  }

  static async remove(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      await resumeService.remove(req.params.id, userId);
      res.status(200).json({ success: true, message: 'Resume deleted.' });
    } catch (error) {
      next(error);
    }
  }
}
