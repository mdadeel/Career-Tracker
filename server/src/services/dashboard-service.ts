import { prisma } from "../utils/prisma";

interface StatusRow {
  status: string;
  count: number;
}

interface SourceRow {
  source: string;
  count: number;
}

interface AvgDaysRow {
  avgDays: number | null;
}

export const dashboardService = {
  async getStats(userId: string) {
    // ── Total count ──
    const total = await prisma.application.count({ where: { userId } });

    // ── Status counts — database-level GROUP BY ──
    const statusRows = await prisma.$queryRaw<StatusRow[]>`
      SELECT "status", COUNT(*)::int AS "count"
      FROM "applications"
      WHERE "userId" = ${userId}
      GROUP BY "status"
    `;
    const statusMap = new Map(statusRows.map((r) => [r.status, r.count]));
    const saved = statusMap.get("Saved") ?? 0;
    const applied = statusMap.get("Applied") ?? 0;
    const assessment = statusMap.get("Assessment") ?? 0;
    const interview = statusMap.get("Interview") ?? 0;
    const rejected = statusMap.get("Rejected") ?? 0;
    const offer = statusMap.get("Offer") ?? 0;

    // ── Source breakdown — database-level GROUP BY ──
    const sourceRows = await prisma.$queryRaw<SourceRow[]>`
      SELECT "source", COUNT(*)::int AS "count"
      FROM "applications"
      WHERE "userId" = ${userId}
      GROUP BY "source"
      ORDER BY "count" DESC
    `;
    const sourceBreakdown = sourceRows.map((r) => ({
      source: r.source,
      count: r.count,
      percentage: total > 0 ? Math.round((r.count / total) * 100) : 0,
    }));

    // ── Average time to interview — database-level AVG ──
    const avgRow = await prisma.$queryRaw<AvgDaysRow[]>`
      SELECT ROUND(AVG(EXTRACT(EPOCH FROM ("interviewDate" - "applicationDate")) / 86400)::numeric, 1)::float8 AS "avgDays"
      FROM "applications"
      WHERE "userId" = ${userId}
        AND "status" = 'Interview'
        AND "interviewDate" IS NOT NULL
    `;
    const avgTimeToInterview = avgRow[0]?.avgDays ?? null;

    // ── Rates ──
    const responseRate = total > 0 ? Math.round(((interview + offer) / total) * 100) : 0;
    const offerRate = total > 0 ? Math.round((offer / total) * 100) : 0;
    const interviewRate = total > 0 ? Math.round((interview / total) * 100) : 0;
    const rejectionRate = total > 0 ? Math.round((rejected / total) * 100) : 0;

    // ── Recent 5 applications — lean findMany ──
    const recentApplications = await prisma.application.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        companyName: true,
        jobTitle: true,
        status: true,
        applicationDate: true,
        interviewDate: true,
        salaryMin: true,
        salaryMax: true,
        salaryCurrency: true,
        location: true,
        employmentType: true,
        remoteStatus: true,
        createdAt: true,
      },
    });

    return {
      total,
      saved,
      applied,
      assessment,
      interview,
      rejected,
      offer,
      responseRate,
      offerRate,
      interviewRate,
      rejectionRate,
      sourceBreakdown,
      avgTimeToInterview,
      recentApplications,
    };
  },
};
