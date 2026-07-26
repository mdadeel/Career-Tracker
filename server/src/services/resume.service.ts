import { prisma } from '../utils/prisma';
import { AppError } from '../middlewares/error-handler';
import fs from 'fs/promises';
import path from 'path';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'resumes');

async function ensureUploadDir() {
  try {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
  } catch { /* exists */ }
}

export const resumeService = {
  async list(userId: string) {
    return prisma.resume.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        fileName: true,
        fileType: true,
        fileSize: true,
        createdAt: true,
      },
    });
  },

  async getById(id: string, userId: string) {
    const resume = await prisma.resume.findUnique({ where: { id } });
    if (!resume) throw new AppError('Resume not found', 404);
    if (resume.userId !== userId) throw new AppError('Access denied', 403);
    return resume;
  },

  async create(userId: string, file: Express.Multer.File, textContent: string) {
    await ensureUploadDir();
    const saved = await prisma.resume.create({
      data: {
        userId,
        fileName: file.originalname,
        fileType: file.mimetype,
        fileSize: file.size,
        textContent,
      },
    });

    return {
      id: saved.id,
      fileName: saved.fileName,
      fileType: saved.fileType,
      fileSize: saved.fileSize,
      createdAt: saved.createdAt,
    };
  },

  async update(id: string, userId: string, data: { textContent?: string; fileName?: string }) {
    const result = await prisma.resume.updateMany({
      where: { id, userId },
      data,
    });

    if (result.count === 0) {
      const exists = await prisma.resume.findUnique({ where: { id } });
      if (!exists) throw new AppError('Resume not found', 404);
      throw new AppError('Access denied', 403);
    }

    return prisma.resume.findUnique({ where: { id } });
  },

  async remove(id: string, userId: string) {
    const result = await prisma.resume.deleteMany({
      where: { id, userId },
    });

    if (result.count === 0) {
      const exists = await prisma.resume.findUnique({ where: { id } });
      if (!exists) throw new AppError('Resume not found', 404);
      throw new AppError('Access denied', 403);
    }
  },
};
