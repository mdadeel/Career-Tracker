import rateLimit from "express-rate-limit";

// Rate limit for auth endpoints (login/register)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: Number(process.env.AUTH_RATE_LIMIT_MAX) || (process.env.NODE_ENV === "production" ? 15 : 100), // higher threshold in dev to avoid 429 lockouts
  message: {
    success: false,
    message: "Too many login/registration attempts. Please try again in 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// General rate limit for API endpoints
export const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute per IP
  message: {
    success: false,
    message: "Too many requests. Please slow down.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Password change rate limit (5 attempts per 15 minutes)
export const passwordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === "production" ? 5 : 50,
  message: {
    success: false,
    message: "Too many password change attempts. Please try again in 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// AI endpoint rate limit (20 requests per minute per IP)
export const aiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: process.env.NODE_ENV === "production" ? 20 : 100,
  message: {
    success: false,
    message: "Too many AI requests. Please slow down and try again in a minute.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Resume upload rate limit (10 uploads per hour per IP)
export const resumeLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: process.env.NODE_ENV === "production" ? 10 : 50,
  message: {
    success: false,
    message: "Too many resume uploads. Please try again in an hour.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
