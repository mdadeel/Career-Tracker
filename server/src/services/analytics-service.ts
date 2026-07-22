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

export const analyticsService = {
  async getStats(userId: string): Promise<AnalyticsData> {
    const applications = await prisma.application.findMany({
      where: { userId },
      select: {
        id: true,
        status: true,
        source: true,
        applicationDate: true,
        interviewDate: true,
        createdAt: true,
      },
      orderBy: { applicationDate: "desc" },
    });

    const total = applications.length;

    // ── Monthly trends (last 12 months) ──
    const now = new Date();
    const monthlyMap = new Map<string, number>();
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      monthlyMap.set(key, 0);
    }
    for (const app of applications) {
      const d = app.applicationDate;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (monthlyMap.has(key)) {
        monthlyMap.set(key, (monthlyMap.get(key) || 0) + 1);
      }
    }
    const monthlyTrends = Array.from(monthlyMap.entries()).map(([month, count]) => ({
      month,
      count,
    }));

    // ── Funnel ──
    const stages = ["Saved", "Applied", "Assessment", "Interview", "Rejected", "Offer"];
    const funnel = stages.map((stage) => ({
      stage,
      count: applications.filter((a) => a.status === stage).length,
    }));

    // ── Status distribution ──
    const statusCounts = new Map<string, number>();
    for (const app of applications) {
      statusCounts.set(app.status, (statusCounts.get(app.status) || 0) + 1);
    }
    const statusDistribution = Array.from(statusCounts.entries()).map(([status, count]) => ({
      status,
      count,
    }));

    // ── Source effectiveness ──
    const sourceMap = new Map<
      string,
      { total: number; interview: number; offer: number }
    >();
    for (const app of applications) {
      const src = app.source || "Other";
      const entry = sourceMap.get(src) || { total: 0, interview: 0, offer: 0 };
      entry.total++;
      if (app.status === "Interview" || app.status === "Offer") entry.interview++;
      if (app.status === "Offer") entry.offer++;
      sourceMap.set(src, entry);
    }
    const sourceEffectiveness = Array.from(sourceMap.entries())
      .map(([source, data]) => ({
        source,
        total: data.total,
        interview: data.interview,
        offer: data.offer,
        conversionRate: data.total > 0 ? Math.round((data.interview / data.total) * 100) : 0,
      }))
      .sort((a, b) => b.total - a.total);

    // ── Summary metrics ──
    const interview = applications.filter((a) => a.status === "Interview").length;
    const offer = applications.filter((a) => a.status === "Offer").length;
    const rejected = applications.filter((a) => a.status === "Rejected").length;
    const activeNonInterview = applications.filter(
      (a) =>
        a.status !== "Rejected" &&
        a.status !== "Offer" &&
        a.status !== "Interview"
    ).length;

    const avgTimeToInterview = (() => {
      const appsWithInterviews = applications.filter(
        (a) => a.status === "Interview" && a.interviewDate
      );
      if (appsWithInterviews.length === 0) return null;
      const totalDays = appsWithInterviews.reduce((sum, a) => {
        const diff = a.interviewDate!.getTime() - a.applicationDate.getTime();
        return sum + Math.max(0, diff) / (1000 * 60 * 60 * 24);
      }, 0);
      return Math.round(totalDays / appsWithInterviews.length);
    })();

    // ── Weekly trends (last 8 weeks) ──
    const weeklyMap = new Map<string, number>();
    for (let i = 7; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
      const weekLabel = `W${getWeekNumber(d)}`;
      weeklyMap.set(weekLabel, 0);
    }
    for (const app of applications) {
      const diffDays = Math.floor((now.getTime() - app.applicationDate.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays >= 0 && diffDays < 56) {
        const weekLabel = `W${getWeekNumber(app.applicationDate)}`;
        if (weeklyMap.has(weekLabel)) {
          weeklyMap.set(weekLabel, (weeklyMap.get(weekLabel) || 0) + 1);
        }
      }
    }
    const weeklyTrends = Array.from(weeklyMap.entries()).map(([week, count]) => ({
      week,
      count,
    }));

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

function getWeekNumber(d: Date): number {
  const target = new Date(d.valueOf());
  const dayNr = (d.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = target.valueOf();
  target.setMonth(0, 1);
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay() + 7) % 7));
  }
  return 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
}

