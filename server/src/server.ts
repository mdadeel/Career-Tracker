import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth-routes";
import applicationRoutes from "./routes/application-routes";
import dashboardRoutes from "./routes/dashboard-routes";
import analyticsRoutes from "./routes/analytics-routes";
import healthRoute from "./routes/health-route";
import aiRoutes from "./routes/ai.routes";
import resumeRoutes from "./routes/resume.routes";
import { errorHandler } from "./middlewares/error-handler";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./docs/swagger";
import { authLimiter, apiLimiter } from "./middlewares/rate-limiter";
import { prisma } from "./utils/prisma";

dotenv.config();

// Validate required environment variables at startup
const REQUIRED_ENV_VARS = ["DATABASE_URL", "JWT_SECRET"] as const;
const missing: string[] = [];
for (const envVar of REQUIRED_ENV_VARS) {
  if (!process.env[envVar]) {
    missing.push(envVar);
  }
}
if (missing.length > 0) {
  console.error(`❌ Missing required environment variable(s): ${missing.join(", ")}`);
  console.error("   Please check your .env file or environment configuration.");
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 5000;
const rawClientUrl = process.env.CLIENT_URL;
const allowedOrigins = ["http://localhost:5173", "http://localhost:3000"];
if (rawClientUrl) {
  const cleanUrl = rawClientUrl.replace(/\/$/, "");
  allowedOrigins.push(cleanUrl);
}

// Security headers (including CSP)
app.use((_req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "0");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https:; frame-ancestors 'none'; object-src 'none'; base-uri 'self'"
  );
  next();
});

// CORS
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow server-to-server / curl requests with no origin
      if (!origin) return callback(null, true);
      const cleanOrigin = origin.replace(/\/$/, "");
      if (allowedOrigins.includes(cleanOrigin) || cleanOrigin.endsWith(".vercel.app")) {
        return callback(null, true);
      }
      return callback(new Error(`Origin ${cleanOrigin} not allowed by CORS`));
    },
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "1mb" }));

// Request logging
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`);
  });
  next();
});

// Rate limiting
app.use("/api/auth", authLimiter);
app.use("/api", apiLimiter);

// Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: "CareerTrack API Docs",
  customCss: ".swagger-ui .topbar { display: none } .swagger-ui .info .description p { margin-top: 8px } .swagger-ui .info { margin: 20px 0 }",
  customfavIcon: "/favicon.ico",
}));

// Root endpoint
app.get("/", (_req, res) => {
  res.json({
    message: "CareerTrack Lite API Server is running",
    docs: "/api-docs",
    health: "/api/health",
  });
});

// Routes
app.use("/api/health", healthRoute);
app.use("/api/auth", authRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/resumes", resumeRoutes);

// Error handling
app.use(errorHandler);

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Graceful shutdown
function gracefulShutdown(signal: string) {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  server.close(async () => {
    await prisma.$disconnect();
    console.log("Server closed. DB connection released.");
    process.exit(0);
  });

  // Force exit after 10s if graceful shutdown hangs
  setTimeout(() => {
    console.error("Forced shutdown after timeout.");
    process.exit(1);
  }, 10_000);
}

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

export default app;
