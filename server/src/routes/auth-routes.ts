import { Router } from "express";
import * as authController from "../controllers/auth-controller";
import { authMiddleware } from "../middlewares/auth-middleware";
import { passwordLimiter } from "../middlewares/rate-limiter";

const router = Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/me", authMiddleware, authController.me);
router.post("/logout", authController.logout);
router.patch("/password", authMiddleware, passwordLimiter, authController.changePassword);
router.patch("/resume", authMiddleware, authController.updateResume);
router.patch("/ai-config", authMiddleware, authController.updateAiConfig);

export default router;

