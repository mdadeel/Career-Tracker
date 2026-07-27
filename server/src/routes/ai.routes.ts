import { Router } from 'express';
import { AiController } from '../controllers/ai.controller';
import { authMiddleware } from '../middlewares/auth-middleware';
import { aiLimiter } from '../middlewares/rate-limiter';

const router = Router();

router.use(authMiddleware);
router.use(aiLimiter);

router.post('/parse-jd', AiController.parseJobDescription);
router.post('/test-config', AiController.testConfig);
router.post('/match-score/:id', AiController.analyzeMatch);
router.post('/interview-prep/:id', AiController.generateInterviewPrep);
router.post('/generate-email', AiController.generateOutreachEmail);

export default router;
