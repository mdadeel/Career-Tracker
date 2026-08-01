import { prisma } from "../utils/prisma";

export interface AnalyticsData {
  /** Monthly application counts for trend chart */
  monthlyTrends: { month: string; count: number }[];
  /** Weekly application counts for the current year */
  weeklyTrends: { week: string; count: number }[];
  /** Funnel: count of apps at each stage */
  funnel: { stage: string; count: number }[];
  /** Source breakdown with conversion rates */
  sourceEffectiveness: {
    source: string;
    total: number;
    interview: number;
    offer: number;
    conversionRate: number;
  }[];
  /** Summary metrics */
  summary: {
    totalApplications: number;
    totalInterviews: number;
    totalOffers: number;
    totalRejected: number;
    responseRate: number;
    interviewRate: number;
    offerRate: number;
    rejectionRate: number;
    avgTimeToInterview: number | null;
    activeApplications: number;
  };
  /** Status distribution */
  statusDistribution: { status: string; count: number }[];
}

/* ── Raw SQL row types ── */
interface StatusRow {
  status: string;
  count: number;
}

interface MonthRow {
  month: string;
  count: number;
}

interface WeekRow {
  week: string;
  count: number;
}

interface SourceEffectivenessRow {
  source: string;
  total: number;
  interview: number;
  offer: number;
}

interface AvgDaysRow {
  avgDays: number | null;
}

const STATUS_ORDER = ["Saved", "Applied", "Assessment", "Interview", "Rejected", "Offer"] as const;

export const analyticsService = {
  async getStats(userId: string): Promise<AnalyticsData> {
    const now = new Date();

    // ── Run all independent queries in parallel ──
    const [
      statusRows,
      monthlyRows,
      weeklyRows,
      sourceRows,
      avgRow,
    ] = await Promise.all([
      // 1. Status distribution (total derived from sum)
      prisma.$queryRaw<StatusRow[]>`
        SELECT "status", COUNT(*)::int AS "count"
        FROM "applications"
        WHERE "userId" = ${userId}
        GROUP BY "status"
      `,

      // 3. Monthly trends (last 12 months)
      prisma.$queryRaw<MonthRow[]>`
        SELECT
          TO_CHAR("applicationDate", 'YYYY-MM') AS "month",
          COUNT(*)::int AS "count"
        FROM "applications"
        WHERE "userId" = ${userId}
          AND "applicationDate" >= ${new Date(now.getFullYear() - 1, now.getMonth(), 1)}
        GROUP BY "month"
        ORDER BY "month"
      `,

      // 4. Weekly trends (last 8 weeks) — ISO week numbering
      prisma.$queryRaw<WeekRow[]>`
        SELECT
          CONCAT('W', LPAD(EXTRACT(WEEK FROM "applicationDate")::int::text, 2, '0')) AS "week",
          COUNT(*)::int AS "count"
        FROM "applications"
        WHERE "userId" = ${userId}
          AND "applicationDate" >= ${new Date(now.getTime() - 56 * 24 * 60 * 60 * 1000)}
        GROUP BY "week"
        ORDER BY "week"
      `,

      // 5. Source effectiveness — single pass FILTER aggregates
      prisma.$queryRaw<SourceEffectivenessRow[]>`
        SELECT
          "source",
          COUNT(*)::int AS "total",
          COUNT(*) FILTER (WHERE "status" IN ('Interview', 'Offer'))::int AS "interview",
          COUNT(*) FILTER (WHERE "status" = 'Offer')::int AS "offer"
        FROM "applications"
        WHERE "userId" = ${userId}
        GROUP BY "source"
        ORDER BY "total" DESC
      `,

      // 6. Average days to interview
      prisma.$queryRaw<AvgDaysRow[]>`
        SELECT AVG(EXTRACT(EPOCH FROM ("interviewDate" - "applicationDate")) / 86400)::int AS "avgDays"
        FROM "applications"
        WHERE "userId" = ${userId}
          AND "status" = 'Interview'
          AND "interviewDate" IS NOT NULL
      `,
    ]);

    // ── Build status map ──
    const statusMap = new Map(statusRows.map((r) => [r.status, r.count]));

    // ── Funnel: fill zeroes for missing stages ──
    const funnel = STATUS_ORDER.map((stage) => ({
      stage,
      count: statusMap.get(stage) ?? 0,
    }));

    // ── Status distribution ──
    const statusDistribution = Array.from(statusMap.entries()).map(([status, count]) => ({
      status,
      count,
    }));

    // ── Source effectiveness ──
    const sourceEffectiveness = sourceRows.map((r) => ({
      source: r.source,
      total: r.total,
      interview: r.interview,
      offer: r.offer,
      conversionRate: r.total > 0 ? Math.round((r.interview / r.total) * 100) : 0,
    }));

    // ── Monthly trends: fill zeroes for missing months ──
    const monthlyMap = new Map(monthlyRows.map((r) => [r.month, r.count]));
    const monthlyTrends: { month: string; count: number }[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      monthlyTrends.push({ month: key, count: monthlyMap.get(key) ?? 0 });
    }

    // ── Weekly trends: fill zeroes for missing weeks ──
    const weeklyMap = new Map(weeklyRows.map((r) => [r.week, r.count]));
    const weeklyTrends: { week: string; count: number }[] = [];
    for (let i = 7; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
      const weekLabel = `W${String(getISOWeekNumber(d)).padStart(2, "0")}`;
      weeklyTrends.push({ week: weekLabel, count: weeklyMap.get(weekLabel) ?? 0 });
    }

    // ── Summary counts ──
    const total = statusRows.reduce((sum, r) => sum + r.count, 0);
    const interview = statusMap.get("Interview") ?? 0;
    const offer = statusMap.get("Offer") ?? 0;
    const rejected = statusMap.get("Rejected") ?? 0;
    const avgTimeToInterview = avgRow[0]?.avgDays ?? null;

    return {
      monthlyTrends,
      weeklyTrends,
      funnel,
      sourceEffectiveness,
      summary: {
        totalApplications: total,
        totalInterviews: interview,
        totalOffers: offer,
        totalRejected: rejected,
        responseRate: total > 0 ? Math.round(((interview + offer) / total) * 100) : 0,
        interviewRate: total > 0 ? Math.round((interview / total) * 100) : 0,
        offerRate: total > 0 ? Math.round((offer / total) * 100) : 0,
        rejectionRate: total > 0 ? Math.round((rejected / total) * 100) : 0,
        avgTimeToInterview,
        activeApplications: total - rejected - offer,
      },
      statusDistribution,
    };
  },
};

/** ISO 8601 week number (1-53) */
function getISOWeekNumber(d: Date): number {
  const target = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = (target.getUTCDay() + 6) % 7;
  target.setUTCDate(target.getUTCDate() - dayNum + 3);
  const firstThursday = target.valueOf();
  target.setUTCMonth(0, 1);
  if (target.getUTCDay() !== 4) {
    target.setUTCMonth(0, 1 + ((4 - target.getUTCDay() + 7) % 7));
  }
  return 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
}


