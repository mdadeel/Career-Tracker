import { useState, useEffect, useCallback } from "react";
import { analyticsService } from "../services/analyticsService";
import { getCached } from "../services/cache";
import type { AnalyticsData } from "../types/analytics";

export function useAnalytics() {
  const cached = getCached<AnalyticsData>("/analytics/stats");
  const [data, setData] = useState<AnalyticsData | null>(cached);
  const [isLoading, setIsLoading] = useState(!cached);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await analyticsService.getStats();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch analytics");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { data, isLoading, error, refresh: fetchStats };
}
