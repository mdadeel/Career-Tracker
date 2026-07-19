export interface AnalyticsData {
  monthlyTrends: { month: string; count: number }[];
  weeklyTrends: { week: string; count: number }[];
  funnel: { stage: string; count: number }[];
  sourceEffectiveness: {
    source: string;
    total: number;
    interview: number;
    offer: number;
    conversionRate: number;
  }[];
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
  statusDistribution: { status: string; count: number }[];
}
