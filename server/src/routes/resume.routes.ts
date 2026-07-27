import { Router } from 'express';
import { ResumeController } from '../controllers/resume.controller';
import { authMiddleware } from '../middlewares/auth-middleware';
import { resumeLimiter } from '../middlewares/rate-limiter';
import multer from 'multer';

/**
 * Use memory storage — files are parsed from Buffer and uploaded to S3.
 * No local disk dependency. The 5MB limit is enforced by multer.
 */
const upload = multer({
  storage: multer.memoryStorage(),
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

router.use(authMiddleware);
router.use(resumeLimiter);

router.post('/upload', upload.single('resume'), ResumeController.upload);
router.get('/', ResumeController.list);
router.get('/:id', ResumeController.getById);
router.patch('/:id', ResumeController.update);
router.delete('/:id', ResumeController.remove);

export default router;
