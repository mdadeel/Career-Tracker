import { prisma } from "../utils/prisma";

export const dashboardService = {
  async getStats(userId: string) {
    const applications = await prisma.application.findMany({
      where: { userId },
      take: 10000, // Safety cap — prevents unbounded memory usage
      select: {
        id: true,
        status: true,
        source: true,
        companyName: true,
        jobTitle: true,
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
      orderBy: { createdAt: "desc" },
    });

    const total = applications.length;
    const saved = applications.filter((a) => a.status === "Saved").length;
    const applied = applications.filter((a) => a.status === "Applied").length;
    const assessment = applications.filter((a) => a.status === "Assessment").length;
    const interview = applications.filter((a) => a.status === "Interview").length;
    const rejected = applications.filter((a) => a.status === "Rejected").length;
    const offer = applications.filter((a) => a.status === "Offer").length;

    // Source breakdown
    const sourceMap = new Map<string, number>();
    for (const app of applications) {
      const src = app.source || "Other";
      sourceMap.set(src, (sourceMap.get(src) || 0) + 1);
    }
    const sourceBreakdown = Array.from(sourceMap.entries())
      .map(([source, count]) => ({
        source,
        count,
        percentage: total > 0 ? Math.round((count / total) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count);

    // Compute avg time from application to interview (in days)
    const appsWithInterviews = applications.filter(
      (a) => a.status === "Interview" && a.interviewDate
    );
    let avgTimeToInterview: number | null = null;
    if (appsWithInterviews.length > 0) {
      const totalDays = appsWithInterviews.reduce((sum, a) => {
        const diff = a.interviewDate!.getTime() - a.applicationDate.getTime();
        return sum + Math.max(0, diff) / (1000 * 60 * 60 * 24);
      }, 0);
      avgTimeToInterview = Math.round(totalDays / appsWithInterviews.length);
    }

    // Compute rates
    const responseRate = total > 0 ? Math.round(((interview + offer) / total) * 100) : 0;
    const offerRate = total > 0 ? Math.round((offer / total) * 100) : 0;
    const interviewRate = total > 0 ? Math.round((interview / total) * 100) : 0;
    const rejectionRate = total > 0 ? Math.round((rejected / total) * 100) : 0;

    const recentApplications = applications.slice(0, 5).map((a) => ({
      id: a.id,
      companyName: a.companyName,
      jobTitle: a.jobTitle,
      status: a.status,
      applicationDate: a.applicationDate,
      interviewDate: a.interviewDate,
      salaryMin: a.salaryMin,
      salaryMax: a.salaryMax,
      salaryCurrency: a.salaryCurrency,
      location: a.location,
      employmentType: a.employmentType,
      remoteStatus: a.remoteStatus,
      createdAt: a.createdAt,
    }));

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
