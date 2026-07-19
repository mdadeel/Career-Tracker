import { Router } from "express";
import * as authController from "../controllers/auth-controller";
import { authMiddleware } from "../middlewares/auth-middleware";

const router = Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/me", authMiddleware, authController.me);
router.patch("/password", authMiddleware, authController.changePassword);

export default router;
