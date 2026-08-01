import { useState, useEffect, useCallback, useRef } from "react";
import { dashboardService } from "../services/dashboardService";
import { getCached } from "../services/cache";
import type { DashboardStats } from "../types";

export function useDashboard() {
  const cached = getCached<DashboardStats>("/dashboard/stats");
  const [stats, setStats] = useState<DashboardStats | null>(cached);
  const [isLoading, setIsLoading] = useState(!cached);
  const [error, setError] = useState<string | null>(null);
  const hasCached = useRef(!!cached);

  const fetchStats = useCallback(async () => {
    if (!hasCached.current) {
      setIsLoading(true);
    }
    hasCached.current = true;
    setError(null);
    try {
      const data = await dashboardService.getStats();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch dashboard data");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, isLoading, error, refresh: fetchStats };
}
