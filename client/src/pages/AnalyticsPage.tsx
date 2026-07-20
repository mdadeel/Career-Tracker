import { useNavigate } from "react-router-dom";
import { useAnalytics } from "../hooks/useAnalytics";
import { Skeleton, Button } from "../components/ui";
import { ChartBar } from "@phosphor-icons/react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from "recharts";

/* ─── Color palette for charts ─── */
const STATUS_COLORS: Record<string, string> = {
  Saved: "#94a3b8",
  Applied: "#3b82f6",
  Assessment: "#f59e0b",
  Interview: "#8b5cf6",
  Rejected: "#ef4444",
  Offer: "#10b981",
};

const BRAND_GRADIENT = "#6366f1";

/* ─── Skeleton ─── */
function AnalyticsSkeleton() {
  return (
    <div className="py-5 lg:py-6 space-y-5">
      <div className="flex items-center justify-between">
        <div className="space-y-1.5">
          <Skeleton width={160} height={18} />
          <Skeleton width={120} height={12} />
        </div>
      </div>
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface p-4">
            <Skeleton width={50} height={10} />
            <Skeleton width={40} height={28} className="mt-2" />
            <Skeleton width={60} height={8} className="mt-1" />
          </div>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface p-4">
          <Skeleton width={100} height={14} />
          <Skeleton width="90%" height={200} className="mt-3" />
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface p-4">
          <Skeleton width={100} height={14} />
          <Skeleton width="90%" height={200} className="mt-3" />
        </div>
      </div>
    </div>
  );
}

/* ─── Metric Card ─── */
function MetricCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface p-4 transition-all duration-150 hover:border-slate-300 dark:hover:border-white/15">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-tertiary dark:text-white/40">
        {label}
      </p>
      <p className="mt-1 text-2xl font-bold text-ink dark:text-white/90 tabular-nums">
        {value}
      </p>
      {sub && (
        <p className="mt-0.5 text-xs text-ink-tertiary dark:text-white/40">{sub}</p>
      )}
    </div>
  );
}

/* ─── Widget Shell ─── */
function Widget({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-100 dark:border-dark-border">
        <h3 className="text-xs font-semibold text-ink dark:text-white/85">{title}</h3>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

/* ─── Custom Tooltip ─── */
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface px-3 py-2 shadow-elevated text-xs">
      <p className="font-medium text-ink dark:text-white/80 mb-0.5">{label}</p>
      {payload.map((entry: any, i: number) => (
        <p key={i} style={{ color: entry.color }} className="tabular-nums">
          {entry.name}: {entry.value}
        </p>
      ))}
    </div>
  );
}

/* ─── Empty State ─── */
function AnalyticsEmptyState({ onNavigate }: { onNavigate: () => void }) {
  return (
    <div className="py-12 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-secondary dark:bg-white/[0.04] mb-4">
        <ChartBar size={32} className="text-ink-tertiary dark:text-white/30" />
      </div>
      <p className="text-sm font-medium text-ink dark:text-white/80">No data yet</p>
      <p className="mt-1 text-xs text-ink-secondary dark:text-white/50">
        Add some applications first to see analytics
      </p>
      <div className="mt-4">
        <Button size="sm" onClick={onNavigate}>
          Add Application
        </Button>
      </div>
    </div>
  );
}

/* ─── Error State ─── */
function AnalyticsError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-rose-200 dark:border-rose-500/20 bg-rose-50 dark:bg-rose-500/10 px-4 py-3">
      <p className="flex-1 text-sm text-rose-700 dark:text-rose-300">{message}</p>
      <Button variant="secondary" size="sm" onClick={onRetry}>Retry</Button>
    </div>
  );
}

/* ─── Format month label ─── */
function formatMonth(month: string): string {
  const [y, m] = month.split("-");
  const date = new Date(parseInt(y), parseInt(m) - 1);
  return date.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
}

/* ─── Main Component ─── */
export function AnalyticsPage() {
  const { data, isLoading, error, refresh } = useAnalytics();
  const navigate = useNavigate();

  if (isLoading) return <AnalyticsSkeleton />;
  if (error) return (
    <div className="py-5 lg:py-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-base font-semibold text-ink dark:text-white/90">Analytics</h1>
          <p className="mt-0.5 text-sm text-ink-secondary dark:text-white/50">Deep insights into your job search</p>
        </div>
      </div>
      <AnalyticsError message={error} onRetry={refresh} />
    </div>
  );
  if (!data || data.summary.totalApplications === 0) {
    return (
      <div className="py-5 lg:py-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-base font-semibold text-ink dark:text-white/90">Analytics</h1>
            <p className="mt-0.5 text-sm text-ink-secondary dark:text-white/50">Deep insights into your job search</p>
          </div>
        </div>
        <AnalyticsEmptyState onNavigate={() => navigate("/applications/new")} />
      </div>
    );
  }

  const { summary, monthlyTrends, funnel, sourceEffectiveness, statusDistribution } = data;

  return (
    <div className="mx-auto max-w-5xl py-5 lg:py-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold text-ink dark:text-white/90">Analytics</h1>
          <p className="mt-0.5 text-sm text-ink-secondary dark:text-white/50">
            Deep insights into your job search performance
          </p>
        </div>
      </div>

      {/* Summary Metric Cards */}
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
        <MetricCard label="Applications" value={summary.totalApplications} sub="Total tracked" />
        <MetricCard
          label="Response Rate"
          value={`${summary.responseRate}%`}
          sub={`${summary.totalInterviews + summary.totalOffers} of ${summary.totalApplications}`}
        />
        <MetricCard
          label="Interview Rate"
          value={`${summary.interviewRate}%`}
          sub={`${summary.totalInterviews} interviews`}
        />
        <MetricCard
          label="Offer Rate"
          value={`${summary.offerRate}%`}
          sub={`${summary.totalOffers} offers`}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Monthly Trend */}
        <Widget title="Application Trend">
          {monthlyTrends.some((m) => m.count > 0) ? (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyTrends} margin={{ top: 4, right: 4, bottom: 0, left: -16 }}>
                  <defs>
                    <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={BRAND_GRADIENT} stopOpacity={0.2} />
                      <stop offset="100%" stopColor={BRAND_GRADIENT} stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.06} />
                  <XAxis
                    dataKey="month"
                    tickFormatter={formatMonth}
                    tick={{ fontSize: 10, fill: "currentColor" }}
                    opacity={0.5}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 10, fill: "currentColor" }}
                    opacity={0.5}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="count"
                    name="Applications"
                    stroke={BRAND_GRADIENT}
                    strokeWidth={2}
                    fill="url(#trendGradient)"
                    animationDuration={500}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-xs text-ink-tertiary dark:text-white/40 py-8 text-center">
              Not enough data to show trends yet
            </p>
          )}
        </Widget>

        {/* Conversion Funnel */}
        <Widget title="Pipeline Funnel">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={funnel
                  .filter((s) => s.count > 0 && s.stage !== "Rejected")
                  .sort((a, b) => {
                    const order = ["Saved", "Applied", "Assessment", "Interview", "Offer"];
                    return order.indexOf(a.stage) - order.indexOf(b.stage);
                  })}
                layout="vertical"
                margin={{ top: 4, right: 4, bottom: 0, left: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.06} horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: "currentColor" }} opacity={0.5} axisLine={false} tickLine={false} allowDecimals={false} />
                <YAxis type="category" dataKey="stage" tick={{ fontSize: 10, fill: "currentColor" }} opacity={0.7} axisLine={false} tickLine={false} width={72} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="count" name="Applications" radius={[0, 4, 4, 0]} barSize={20} animationDuration={500}>
                  {funnel
                    .filter((s) => s.count > 0 && s.stage !== "Rejected")
                    .sort((a, b) => {
                      const order = ["Saved", "Applied", "Assessment", "Interview", "Offer"];
                      return order.indexOf(a.stage) - order.indexOf(b.stage);
                    })
                    .map((entry) => (
                      <Cell key={entry.stage} fill={STATUS_COLORS[entry.stage] || "#94a3b8"} />
                    ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Widget>

        {/* Source Breakdown */}
        <Widget title="Source Effectiveness">
          {sourceEffectiveness.length > 0 ? (
            <div className="space-y-3">
              {sourceEffectiveness.map((source) => (
                <div key={source.source}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-ink dark:text-white/80">{source.source}</span>
                    <span className="text-[11px] text-ink-tertiary dark:text-white/40 tabular-nums">
                      {source.total} app{source.total !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full bg-slate-100 dark:bg-white/[0.06] overflow-hidden">
                      {source.conversionRate > 0 && (
                        <div
                          className="h-full rounded-full bg-brand-500 transition-all duration-500"
                          style={{ width: `${source.conversionRate}%` }}
                        />
                      )}
                    </div>
                    <span className="w-8 text-right text-[11px] font-semibold text-ink dark:text-white/70 tabular-nums">
                      {source.conversionRate}%
                    </span>
                  </div>
                  {(source.interview > 0 || source.offer > 0) && (
                    <p className="text-xs text-ink-tertiary dark:text-white/40 mt-0.5">
                      {source.interview > 0 && `${source.interview} interview${source.interview !== 1 ? "s" : ""}`}
                      {source.interview > 0 && source.offer > 0 && " · "}
                      {source.offer > 0 && `${source.offer} offer${source.offer !== 1 ? "s" : ""}`}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-ink-tertiary dark:text-white/40 py-8 text-center">No source data available</p>
          )}
        </Widget>

        {/* Status Distribution (donut chart) */}
        <Widget title="Status Distribution">
          {statusDistribution.length > 0 ? (
            <div className="flex items-center gap-6">
              <div className="h-40 w-40 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={38}
                      outerRadius={62}
                      dataKey="count"
                      nameKey="status"
                      animationDuration={500}
                    >
                      {statusDistribution.map((entry) => (
                        <Cell
                          key={entry.status}
                          fill={STATUS_COLORS[entry.status] || "#94a3b8"}
                          stroke="transparent"
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<ChartTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-2 min-w-0">
                {statusDistribution
                  .sort((a, b) => b.count - a.count)
                  .map((entry) => (
                    <div key={entry.status} className="flex items-center gap-2">
                      <span
                        className="h-2 w-2 shrink-0 rounded-full"
                        style={{ backgroundColor: STATUS_COLORS[entry.status] || "#94a3b8" }}
                      />
                      <span className="flex-1 text-xs text-ink-secondary dark:text-white/60 truncate">
                        {entry.status}
                      </span>
                      <span className="text-xs font-semibold text-ink dark:text-white/80 tabular-nums">
                        {entry.count}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          ) : (
            <p className="text-xs text-ink-tertiary dark:text-white/40 py-8 text-center">No status data available</p>
          )}
        </Widget>
      </div>

      {/* Additional Metrics */}
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
        <MetricCard
          label="Active Apps"
          value={summary.activeApplications}
          sub="Still in progress"
        />
        <MetricCard
          label="Rejected"
          value={summary.totalRejected}
          sub={`${summary.rejectionRate}% rejection rate`}
        />
        <MetricCard
          label="Avg Time to Interview"
          value={summary.avgTimeToInterview !== null ? `${summary.avgTimeToInterview}d` : "—"}
          sub={summary.avgTimeToInterview !== null ? "From application" : "No interview data yet"}
        />
        <MetricCard label="Offers" value={summary.totalOffers} sub={`${summary.offerRate}% offer rate`} />
      </div>
    </div>
  );
}
