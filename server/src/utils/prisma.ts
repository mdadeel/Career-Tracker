import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

type LogLevel = "warn" | "error" | "info" | "query";

/** Parse the DATABASE_URL and inject a connection_limit parameter if none exists. */
function getDatabaseUrl(): string | undefined {
  const url = process.env.DATABASE_URL;
  if (!url) return undefined;

  const poolConfig = process.env.PRISMA_POOL_SIZE;
  if (!poolConfig) return url;

  // Only inject if connection_limit isn't already set
  if (url.includes("connection_limit=")) return url;

  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}connection_limit=${poolConfig}`;
}

/** Determine log level based on environment. */
function getLogLevel(): LogLevel[] {
  if (process.env.NODE_ENV === "development") {
    return ["warn", "error"];
  }
  return ["error"];
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: getLogLevel(),
    datasources: {
      db: {
        url: getDatabaseUrl(),
      },
    },
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
