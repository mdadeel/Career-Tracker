import { Router, Request, Response } from "express";
import { prisma } from "../utils/prisma";

const router = Router();

/** Server start time — used to compute uptime. */
const START_TIME = Date.now();

/** Read package version (injected at build time or fallback to "0.0.0"). */
function getVersion(): string {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const pkg = require("../../package.json");
    return pkg.version || "0.0.0";
  } catch {
    return "0.0.0";
  }
}

const VERSION = getVersion();

interface MemoryUsage {
  rss: string;
  heapTotal: string;
  heapUsed: string;
  external: string;
}

function formatMemory(bytes: number): string {
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function getMemoryUsage(): MemoryUsage {
  const mem = process.memoryUsage();
  return {
    rss: formatMemory(mem.rss),
    heapTotal: formatMemory(mem.heapTotal),
    heapUsed: formatMemory(mem.heapUsed),
    external: formatMemory(mem.external),
  };
}

function getUptimeSeconds(): number {
  return Math.floor((Date.now() - START_TIME) / 1000);
}

router.get("/", async (_req: Request, res: Response) => {
  const timestamp = new Date().toISOString();
  try {
    // Verify DB connectivity with a lightweight query
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({
      success: true,
      data: {
        status: "healthy",
        version: VERSION,
        uptime: getUptimeSeconds(),
        database: "connected",
        memory: getMemoryUsage(),
        timestamp,
      },
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      data: {
        status: "unhealthy",
        version: VERSION,
        uptime: getUptimeSeconds(),
        database: "disconnected",
        memory: getMemoryUsage(),
        timestamp,
      },
      message: error instanceof Error ? error.message : "Database unreachable",
    });
  }
});

export default router;
