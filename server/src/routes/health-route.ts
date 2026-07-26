import { Router, Request, Response } from "express";
import { prisma } from "../utils/prisma";

const router = Router();

router.get("/", async (_req: Request, res: Response) => {
  const timestamp = new Date().toISOString();
  try {
    // Verify DB connectivity with a lightweight query
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({
      success: true,
      data: {
        status: "healthy",
        database: "connected",
        timestamp,
      },
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      data: {
        status: "unhealthy",
        database: "disconnected",
        timestamp,
      },
      message: error instanceof Error ? error.message : "Database unreachable",
    });
  }
});

export default router;
