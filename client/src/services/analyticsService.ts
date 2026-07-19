import { api } from "./api";
import type { AnalyticsData } from "../types/analytics";

export const analyticsService = {
  getStats: () => api.get<AnalyticsData>("/analytics/stats"),
};
