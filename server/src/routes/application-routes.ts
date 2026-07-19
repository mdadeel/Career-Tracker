import { Router } from "express";
import * as applicationController from "../controllers/application-controller";
import { authMiddleware } from "../middlewares/auth-middleware";

const router = Router();

router.use(authMiddleware);

router.get("/", applicationController.getAll);
router.get("/:id", applicationController.getById);
router.post("/", applicationController.create);
router.patch("/:id", applicationController.update);
router.delete("/:id", applicationController.remove);

export default router;
