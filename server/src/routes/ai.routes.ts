import { Router } from 'express';
import { AiController } from '../controllers/ai.controller';
import { authMiddleware } from '../middlewares/auth-middleware';

const router = Router();

router.use(authMiddleware as any);

router.post('/parse-jd', AiController.parseJobDescription);
router.post('/test-config', AiController.testConfig);
router.post('/match-score/:id', AiController.analyzeMatch);
router.post('/interview-prep/:id', AiController.generateInterviewPrep);
router.post('/generate-email', AiController.generateOutreachEmail);

export default router;
