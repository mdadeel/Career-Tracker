import { Router } from 'express';
import { ResumeController } from '../controllers/resume.controller';
import { authMiddleware } from '../middlewares/auth-middleware';
import { resumeLimiter } from '../middlewares/rate-limiter';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'resumes');
try { fs.mkdirSync(UPLOAD_DIR, { recursive: true }); } catch { /* exists */ }

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname) || '.bin';
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type "${file.mimetype}". Accepted: PDF, DOCX, TXT.`));
    }
  },
});

const router = Router();

router.use(authMiddleware as any);
router.use(resumeLimiter);

router.post('/upload', upload.single('resume'), ResumeController.upload);
router.get('/', ResumeController.list);
router.get('/:id', ResumeController.getById);
router.patch('/:id', ResumeController.update);
router.delete('/:id', ResumeController.remove);

export default router;
