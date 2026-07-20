import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth-routes";
import applicationRoutes from "./routes/application-routes";
import dashboardRoutes from "./routes/dashboard-routes";
import analyticsRoutes from "./routes/analytics-routes";
import healthRoute from "./routes/health-route";
import { errorHandler } from "./middlewares/error-handler";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./docs/swagger";
import { authLimiter, apiLimiter } from "./middlewares/rate-limiter";

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
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

// Security headers
app.use((_req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "0");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  next();
});

// CORS
app.use(
  cors({
    origin: CLIENT_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "1mb" }));

// Rate limiting
app.use("/api/auth", authLimiter);
app.use("/api", apiLimiter);

// Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: "CareerTrack API Docs",
  customCss: ".swagger-ui .topbar { display: none } .swagger-ui .info .description p { margin-top: 8px } .swagger-ui .info { margin: 20px 0 }",
  customfavIcon: "/favicon.ico",
}));

// Routes
app.use("/api/health", healthRoute);
app.use("/api/auth", authRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/analytics", analyticsRoutes);

// Error handling
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
