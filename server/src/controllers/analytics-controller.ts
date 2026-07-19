import { Response, NextFunction } from "express";
import { analyticsService } from "../services/analytics-service";
import { AuthenticatedRequest } from "../types";

export async function getStats(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const data = await analyticsService.getStats(userId);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
}
