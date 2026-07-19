import { Router } from "express";
import * as dashboardController from "../controllers/dashboard-controller";
import { authMiddleware } from "../middlewares/auth-middleware";

const router = Router();

router.use(authMiddleware);
router.get("/stats", dashboardController.getStats);

export default router;
