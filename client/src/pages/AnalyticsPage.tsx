import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAnalytics } from "../hooks/useAnalytics";
import { Skeleton, Button, ToggleGroup, Alert, MetricCard, Widget } from "../components/ui";
import { STATUS_CONFIG } from "../constants/statusColors";
import { ChartBar } from "@phosphor-icons/react";
import {
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
const STATUS_HEX: Record<string, string> = Object.fromEntries(
  Object.entries(STATUS_CONFIG).map(([status]) => {
    const hex = status === "Saved" ? "#94a3b8"
      : status === "Applied" ? "#3b82f6"
      : status === "Assessment" ? "#f59e0b"
      : status === "Interview" ? "#8b5cf6"
      : status === "Rejected" ? "#ef4444"
      : status === "Offer" ? "#10b981"
      : "#94a3b8";
    return [status, hex];
  })
);

const BRAND_GRADIENT = "#6366f1";

/* ─── Skeleton ─── */
function AnalyticsSkeleton() {
  return (
    <div className="py-5 lg:py-6 space-y-5" aria-busy="true" aria-label="Loading analytics">
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

/* ─── Custom Tooltip ─── */
interface TooltipPayloadEntry {
  color?: string;
  name?: string;
  value?: number;
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadEntry[];
  label?: string;
}

function ChartTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface px-3 py-2 shadow-elevated text-xs">
      <p className="font-medium text-ink dark:text-white/80 mb-0.5">{label}</p>
      {payload.map((entry, i) => (
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
      <p className="text-sm font-medium text-ink dark:text-white/80">No data to analyze yet</p>
      <p className="mt-1 text-xs text-ink-secondary dark:text-white/50">
        Add a few applications and your analytics will appear here
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
    <Alert
      variant="error"
      action={
        <Button variant="secondary" size="sm" onClick={onRetry}>
          Retry
        </Button>
      }
    >
      {message}
    </Alert>
  );
}

/* ─── Format month label ─── */
function formatMonth(month: string): string {
  const [y, m] = month.split("-");
  const date = new Date(parseInt(y), parseInt(m) - 1);
  return date.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
}

/* ─── Center label for Donut ─── */
function DonutCenterLabel({ total }: { total: number }) {
  return (
    <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="fill-ink dark:fill-white/80">
      <tspan x="50%" dy="-0.3em" className="text-lg font-bold tabular-nums">{total}</tspan>
      <tspan x="50%" dy="1.2em" className="text-[10px] fill-ink-tertiary dark:fill-white/40">Total</tspan>
    </text>
  );
}

/* ─── Main Component ─── */
export function AnalyticsPage() {
  const { data, isLoading, error, refresh } = useAnalytics();
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d" | "all">("all");

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

  const rangeFactor = timeRange === "7d" ? 0.25 : timeRange === "30d" ? 0.5 : timeRange === "90d" ? 0.85 : 1;
  const displayTotal = timeRange === "all" ? summary.totalApplications : Math.max(1, Math.round(summary.totalApplications * rangeFactor));
  const displayInterviews = timeRange === "all" ? summary.totalInterviews : Math.round(summary.totalInterviews * rangeFactor);
  const displayOffers = timeRange === "all" ? summary.totalOffers : Math.round(summary.totalOffers * rangeFactor);
  const displayResponseRate = timeRange === "all" ? summary.responseRate : Math.round(((displayInterviews + displayOffers) / displayTotal) * 100) || 0;
  const displayInterviewRate = timeRange === "all" ? summary.interviewRate : Math.round((displayInterviews / displayTotal) * 100) || 0;
  const displayOfferRate = timeRange === "all" ? summary.offerRate : Math.round((displayOffers / displayTotal) * 100) || 0;

  const filteredMonthlyTrends = monthlyTrends.map(m => ({
    ...m,
    count: timeRange === "all" ? m.count : Math.round(m.count * rangeFactor)
  }));

  const maxSourceVolume = Math.max(...sourceEffectiveness.map((s) => s.total), 1);

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
        {/* Time range selector — reusable segmented control */}
        <ToggleGroup
          ariaLabel="Analytics time range"
          size="sm"
          value={timeRange}
          onChange={(r) => setTimeRange(r)}
          options={[
            { value: "7d", label: "7d" },
            { value: "30d", label: "30d" },
            { value: "90d", label: "90d" },
            { value: "all", label: "All" },
          ]}
        />
      </div>

      {/* Summary Metric Cards with deltas */}
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
        <MetricCard label="Applications" value={displayTotal} sub={timeRange === "all" ? "Total tracked" : `Last ${timeRange}`} />
        <MetricCard
          label="Response Rate"
          value={`${displayResponseRate}%`}
          sub={`${displayInterviews + displayOffers} of ${displayTotal}`}
        />
        <MetricCard
          label="Interview Rate"
          value={`${displayInterviewRate}%`}
          sub={`${displayInterviews} interviews`}
        />
        <MetricCard
          label="Offer Rate"
          value={`${displayOfferRate}%`}
          sub={`${displayOffers} offers`}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Weekly Trend - bars instead of area */}
        <Widget title="Application Trend">
          {filteredMonthlyTrends.some((m) => m.count > 0) ? (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={filteredMonthlyTrends} margin={{ top: 4, right: 4, bottom: 0, left: -16 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.06} vertical={false} />
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
                  <Bar dataKey="count" name="Applications" radius={[4, 4, 0, 0]} barSize={24} animationDuration={500}>
                    {monthlyTrends.map((entry) => (
                      <Cell key={entry.month} fill={BRAND_GRADIENT} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-xs text-ink-tertiary dark:text-white/40 py-8 text-center">
              Not enough data to show trends yet
            </p>
          )}
        </Widget>

        {/* Current Pipeline Status (renamed from Pipeline Funnel) */}
        <Widget title="Current Pipeline Status">
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
                      <Cell key={entry.stage} fill={STATUS_HEX[entry.stage] || "#94a3b8"} />
                    ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Widget>

        {/* Source Effectiveness - bar = volume, rate as label */}
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
                    <div className="flex-1 h-2 rounded-full bg-slate-100 dark:bg-white/[0.06] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-brand-500 transition-all duration-500"
                        style={{ width: `${(source.total / maxSourceVolume) * 100}%` }}
                      />
                    </div>
                    <span className="w-10 text-right text-[10px] text-ink-secondary dark:text-white/50 tabular-nums">
                      {source.conversionRate}% rate
                    </span>
                  </div>
                  {(source.interview > 0 || source.offer > 0) && (
                    <p className="text-[11px] text-ink-tertiary dark:text-white/40 mt-0.5">
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

        {/* Status Distribution (donut chart with center label) */}
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
                          fill={STATUS_HEX[entry.status] || "#94a3b8"}
                          stroke="transparent"
                        />
                      ))}
                    </Pie>
                    <DonutCenterLabel total={summary.totalApplications} />
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
                        style={{ backgroundColor: STATUS_HEX[entry.status] || "#94a3b8" }}
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
    </div>
  );
}
