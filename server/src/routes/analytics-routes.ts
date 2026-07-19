import { Router } from "express";
import { authMiddleware } from "../middlewares/auth-middleware";
import * as analyticsController from "../controllers/analytics-controller";

const router = Router();

router.get("/stats", authMiddleware, analyticsController.getStats);

export default router;
