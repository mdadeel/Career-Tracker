import { prisma } from '../utils/prisma';
import { AppError } from '../middlewares/error-handler';
import { isS3Configured, uploadToS3, getS3SignedUrl, buildResumeKey } from '../utils/s3';

export const resumeService = {
  async list(userId: string) {
    const resumes = await prisma.resume.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        fileName: true,
        fileType: true,
        fileSize: true,
        textContent: true,
        s3Key: true,
        createdAt: true,
      },
    });

    // No signed URL generation here — lazy-load via getById on download click
    return resumes.map((r) => ({ ...r, fileUrl: null }));
  },

  async getById(id: string, userId: string) {
    const resume = await prisma.resume.findUnique({ where: { id } });
    if (!resume) throw new AppError('Resume not found', 404);
    if (resume.userId !== userId) throw new AppError('Access denied', 403);
    return {
      ...resume,
      fileUrl: resume.s3Key ? await getS3SignedUrl(resume.s3Key) : null,
    };
  },

  async create(userId: string, file: Express.Multer.File, textContent: string) {
    // Save resume metadata first to get the ID
    const saved = await prisma.resume.create({
      data: {
        userId,
        fileName: file.originalname,
        fileType: file.mimetype,
        fileSize: file.size,
        textContent,
      },
    });

    // Upload to S3 if configured
    let s3Key: string | null = null;
    if (isS3Configured()) {
      s3Key = buildResumeKey(userId, saved.id, file.originalname);
      await uploadToS3(file.buffer, s3Key, file.mimetype);

      // Update the record with the S3 key
      await prisma.resume.update({
        where: { id: saved.id },
        data: { s3Key },
      });
    }

    return {
      id: saved.id,
      fileName: saved.fileName,
      fileType: saved.fileType,
      fileSize: saved.fileSize,
      s3Key,
      createdAt: saved.createdAt,
      fileUrl: s3Key ? await getS3SignedUrl(s3Key) : null,
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

    const updated = await prisma.resume.findUnique({ where: { id } });
    if (!updated) throw new AppError('Resume not found', 404);
    return {
      ...updated,
      fileUrl: updated.s3Key ? await getS3SignedUrl(updated.s3Key) : null,
    };
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
