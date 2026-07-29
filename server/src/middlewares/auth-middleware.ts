import { Response, NextFunction } from "express";
import { verifyToken } from "../utils/token";
import { AuthenticatedRequest } from "../types";
import { AppError } from "./error-handler";

export function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  // Read token from cookie (httpOnly) first, fall back to Authorization header
  const token =
    req.cookies?.token ||
    (req.headers.authorization?.startsWith("Bearer ")
      ? req.headers.authorization.split(" ")[1]
      : null);

  if (!token) {
    next(
      new AppError(
        "Please sign in to access this resource.",
        401,
        "Authentication required - no token found in request cookies or headers"
      )
    );
    return;
  }

  try {
    const payload = verifyToken(token);
    req.user = payload;
    next();
  } catch (error) {
    const detail = error instanceof Error ? error.message : "unknown error";
    next(
      new AppError(
        "Your session has expired. Please sign in again.",
        401,
        `Token validation failed: ${detail}`
      )
    );
  }
}
