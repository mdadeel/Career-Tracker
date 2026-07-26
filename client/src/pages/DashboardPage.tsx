import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useDashboard } from "../hooks/useDashboard";
import type { ReactNode } from "react";
import { Badge, statusVariantMap, Button, Skeleton } from "../components/ui";
import { StackSimple, ChatCircle, CheckCircle, ChartBar, Plus, ArrowUp, XCircle, CalendarCheck, WarningCircle } from "@phosphor-icons/react";
import { formatDate } from "../utils/format";
import { Info } from "@phosphor-icons/react";
import { useCountUp } from "../hooks/useCountUp";

/* ─── Tooltip ─── */
function InfoTooltip({ text }: { text: string }) {
  return (
    <span className="group relative inline-flex items-center">
      <Info size={12} className="text-ink-tertiary dark:text-white/40 cursor-help" />
      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block z-10 whitespace-nowrap rounded-lg border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface px-2.5 py-1.5 text-[11px] text-ink dark:text-white/80 shadow-elevated">
        {text}
      </span>
    </span>
  );
}

/* ─── Metric Card ─── */
function MetricCard({
  label,
  value,
  sub,
  icon,
  onClick,
  empty,
  valueSuffix,
}: {
  label: ReactNode;
  value: number | string;
  sub?: string;
  icon: ReactNode;
  onClick?: () => void;
  empty?: boolean;
  valueSuffix?: string;
}) {
  const numVal = typeof value === "number" ? value : parseInt(value, 10);
  const counted = useCountUp(isNaN(numVal) ? 0 : numVal, 1000, !empty && !isNaN(numVal));
  const displayVal = typeof value === "number" ? counted : value;
  return (
    <button
      onClick={onClick}
      className="rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-500/40 hover:shadow-card-hover active:scale-[0.98]"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-tertiary dark:text-white/40">
          {label}
        </span>
        <span className="text-ink-tertiary dark:text-white/30">{icon}</span>
      </div>
      {empty ? (
        <p className="text-xs text-ink-tertiary dark:text-white/40">No data yet</p>
      ) : (
        <>
          <p className="text-2xl font-extrabold text-ink dark:text-white/90 tabular-nums">{displayVal}{valueSuffix}</p>
          {sub && <p className="mt-0.5 text-xs text-ink-tertiary dark:text-white/40">{sub}</p>}
        </>
      )}
    </button>
  );
}

/* ─── Pipeline Stage Bar ─── */
function StageBar({ label, count, total, color }: { label: string; count: number; total: number; color: string }) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="w-20 shrink-0 text-xs text-ink-secondary dark:text-white/50">{label}</span>
      <div className="flex-1 h-2 rounded-full bg-slate-100 dark:bg-white/[0.06] overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-500 ${color} hover:scale-y-125 hover:opacity-80`} style={{ width: `${pct}%` }} />
      </div>
      <span className="w-6 text-right text-xs font-semibold text-ink dark:text-white/70 tabular-nums">{count}</span>
    </div>
  );
}

/* ─── Empty Pipeline ─── */
function EmptyStageBar({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-20 shrink-0 text-xs text-ink-tertiary dark:text-white/30">{label}</span>
      <div className="flex-1 h-2 rounded-full bg-slate-100 dark:bg-white/[0.04]" />
      <span className="w-6 text-right text-xs text-ink-tertiary dark:text-white/30">0</span>
    </div>
  );
}

/* ─── Widget Shell ─── */
function Widget({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-dark-border">
        <h3 className="text-xs font-semibold text-ink dark:text-white/85">{title}</h3>
        {action}
      </div>
      <div className="px-4 py-3">{children}</div>
    </div>
  );
}

/* ─── Dashboard Skeleton ─── */
function DashboardSkeleton() {
  return (
    <div className="py-4 lg:py-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1.5">
          <Skeleton width={160} height={18} />
          <Skeleton width={100} height={12} />
        </div>
        <Skeleton width={110} height={30} className="rounded-lg" />
      </div>
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface p-4">
            <Skeleton width={50} height={10} />
            <Skeleton width={40} height={28} className="mt-2" />
          </div>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface p-4 space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} width={`${50 + Math.random() * 40}%`} height={8} />
          ))}
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface p-4 space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton width={60} height={18} className="rounded-full" />
              <div className="flex-1 space-y-1">
                <Skeleton width="60%" height={10} />
                <Skeleton width="40%" height={8} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Error Widget ─── */
function ErrorWidget({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="py-4 lg:py-5">
      <div className="flex items-center gap-3 rounded-xl border border-rose-200 dark:border-rose-500/20 bg-rose-50 dark:bg-rose-500/10 px-4 py-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-500/20 text-rose-500">
          <WarningCircle size={16} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-rose-800 dark:text-rose-300">Failed to load dashboard</p>
          <p className="text-xs text-rose-600 dark:text-rose-400 mt-0.5">{message}</p>
        </div>
        <Button variant="secondary" size="sm" onClick={onRetry}>Retry</Button>
      </div>
    </div>
  );
}

/* ─── Dashboard ─── */
export function DashboardPage() {
  const { user } = useAuth();
  const { stats, isLoading, error, refresh } = useDashboard();
  const navigate = useNavigate();

  if (isLoading) return <DashboardSkeleton />;
  if (error) return <ErrorWidget message={error} onRetry={refresh} />;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening";
  const hasData = stats && stats.total > 0;

  const thisWeekApps = hasData
    ? stats!.recentApplications.filter((a) => {
        const d = new Date(a.applicationDate);
        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return d >= weekAgo;
      }).length
    : 0;

  // TODO: Backend needs to distinguish between status=Interview and has_scheduled_date=true
  // For now, frontend filters to only show interviews with a future date
  const upcomingInterviews = hasData
    ? stats!.recentApplications
        .filter((a) => {
          if (a.status !== "Interview" || !a.interviewDate) return false;
          return new Date(a.interviewDate) > new Date();
        })
        .sort((a, b) => new Date(a.interviewDate!).getTime() - new Date(b.interviewDate!).getTime())
        .slice(0, 5)
    : [];

  const interviewsWithoutDate = hasData
    ? stats!.recentApplications.filter((a) => a.status === "Interview" && !a.interviewDate).length
    : 0;

  // Frontend-only count of interviews with a future date (from recentApplications subset)
  const futureInterviewCount = hasData
    ? stats!.recentApplications.filter((a) => a.status === "Interview" && a.interviewDate && new Date(a.interviewDate) > new Date()).length
    : 0;

  // Pipeline stages in order
  const pipelineStages = [
    { key: "saved" as const, label: "Saved", color: "bg-slate-400" },
    { key: "applied" as const, label: "Applied", color: "bg-blue-500" },
    { key: "assessment" as const, label: "Assessment", color: "bg-amber-500" },
    { key: "interview" as const, label: "Interview", color: "bg-purple-500" },
    { key: "rejected" as const, label: "Rejected", color: "bg-rose-500" },
    { key: "offer" as const, label: "Offer", color: "bg-emerald-500" },
  ];

  return (
    <div className="mx-auto max-w-5xl py-4 lg:py-5 space-y-4">
      {/* ─── Top Bar ─── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-base font-semibold text-ink dark:text-white/90">
            Good {greeting}, {user?.name?.split(" ")[0] || "there"}
          </h1>
          <p className="mt-0.5 text-xs text-ink-secondary dark:text-white/50">
            {hasData
              ? `${stats!.total} application${stats!.total !== 1 ? "s" : ""} tracked`
              : "Let's start tracking your job search"}
          </p>
        </div>
        <Button
          size="sm"
          icon={<Plus size={14} weight="bold" />}
          onClick={() => navigate("/applications/new")}
        >
          Add Application
        </Button>
      </div>

      {/* ─── Metric Cards ─── */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Applications"
          value={stats?.total ?? 0}
          icon={<StackSimple size={16} />}
          onClick={() => navigate("/applications")}
        />
        <MetricCard
          label="Interviews"
          value={stats?.interview ?? 0}
          icon={<ChatCircle size={16} />}
          empty={!hasData}
          onClick={() => navigate("/applications?status=Interview")}
        />
        <MetricCard
          label="Offers"
          value={stats?.offer ?? 0}
          icon={<CheckCircle size={16} />}
          empty={!hasData}
          onClick={() => navigate("/applications?status=Offer")}
        />
        <MetricCard
          label={
            <span className="inline-flex items-center gap-1">
              Response Rate
              <InfoTooltip text="Responses (interviews + offers + rejections) ÷ Total applications" />
            </span>
          }
          value={hasData ? stats!.responseRate : 0}
          valueSuffix={hasData ? "%" : ""}
          sub={hasData ? `${stats!.interview + stats!.offer} of ${stats!.total} applications` : undefined}
          icon={<ChartBar size={16} />}
          empty={!hasData}
        />
      </div>

      {/* ─── Pipeline + Recent Activity ─── */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Pipeline */}
        <Widget
          title="Pipeline"
          action={
            <button
              onClick={() => navigate("/applications")}
              className="text-xs font-medium text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 transition-colors"
            >
              View all
            </button>
          }
        >
          <div className="space-y-2.5">
            {hasData
              ? pipelineStages.map((s) => (
                  <StageBar
                    key={s.key}
                    label={s.label}
                    count={(stats as unknown as Record<string, number>)[s.key] ?? 0}
                    total={stats!.total}
                    color={s.color}
                  />
                ))
              : pipelineStages.map((s) => <EmptyStageBar key={s.key} label={s.label} />)}
          </div>
        </Widget>

        {/* This Week / Upcoming */}
        <div className="space-y-4">
          {/* This Week */}
          <Widget title="This Week">
            {hasData ? (
              <div className="space-y-2.5">
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-md bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400">
                    <ArrowUp size={14} />
                  </span>
                  <div>
                    <p className="text-sm font-medium text-ink dark:text-white/85">{thisWeekApps} application{thisWeekApps !== 1 ? "s" : ""} submitted</p>
                    <p className="text-xs text-ink-tertiary dark:text-white/40">This week</p>
                  </div>
                </div>
                {futureInterviewCount > 0 && (
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-md bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400">
                      <CalendarCheck size={14} />
                    </span>
                    <div>
                      <p className="text-sm font-medium text-ink dark:text-white/85">{futureInterviewCount} interview{futureInterviewCount !== 1 ? "s" : ""} scheduled</p>
                      <p className="text-xs text-ink-tertiary dark:text-white/40">With upcoming dates</p>
                    </div>
                  </div>
                )}
                {stats!.rejected > 0 && (
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-md bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400">
                      <XCircle size={14} />
                    </span>
                    <div>
                      <p className="text-sm font-medium text-ink dark:text-white/85">{stats!.rejected} rejection{stats!.rejected !== 1 ? "s" : ""}</p>
                      <p className="text-xs text-ink-tertiary dark:text-white/40">{stats!.rejected > 0 ? "Keep going, numbers are normal" : "No rejections yet"}</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-4 text-center">
                <p className="text-xs text-ink-tertiary dark:text-white/40">Submit your first application to see weekly activity</p>
              </div>
            )}
          </Widget>

          {/* Upcoming Interviews */}
          <Widget title="Upcoming Interviews">
            {hasData && (upcomingInterviews.length > 0 || interviewsWithoutDate > 0) ? (
              <div className="space-y-2">
                {upcomingInterviews.map((app) => {
                  const d = new Date(app.interviewDate!);
                  const dateStr = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
                  const timeStr = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
                  const isToday = new Date().toDateString() === d.toDateString();
                  const isTomorrow = new Date(Date.now() + 86400000).toDateString() === d.toDateString();
                  const dayLabel = isToday ? "Today" : isTomorrow ? "Tomorrow" : dateStr;
                  return (
                    <button
                      key={app.id}
                      onClick={() => navigate(`/applications/${app.id}`)}
                      className="flex w-full items-center gap-3 rounded-lg p-2 transition-colors hover:bg-surface-secondary dark:hover:bg-white/[0.03] text-left"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 dark:bg-brand-500/10 text-xs font-bold text-brand-600 dark:text-brand-400">
                        {app.companyName.charAt(0)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-ink dark:text-white/85 truncate">{app.jobTitle}</p>
                        <p className="text-[11px] text-ink-secondary dark:text-white/50">{app.companyName}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-[11px] font-semibold ${isToday ? "text-brand-600 dark:text-brand-400" : "text-ink-secondary dark:text-white/60"}`}>
                          {dayLabel}
                        </p>
                        <p className="text-xs text-ink-tertiary dark:text-white/40">{timeStr}</p>
                      </div>
                    </button>
                  );
                })}
                {interviewsWithoutDate > 0 && (
                  <p className="text-[11px] text-ink-tertiary dark:text-white/40 text-center pt-1">
                    +{interviewsWithoutDate} interview{interviewsWithoutDate !== 1 ? "s" : ""} without a scheduled date
                  </p>
                )}
              </div>
            ) : (
              <div className="py-6 text-center">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 dark:bg-white/[0.06] mb-3">
                  <CalendarCheck size={20} className="text-ink-tertiary dark:text-white/40" />
                </div>
                <p className="text-xs font-medium text-ink dark:text-white/70">No upcoming interviews</p>
                <p className="text-[11px] text-ink-tertiary dark:text-white/40 mt-1">Schedule an interview with a company</p>
                <button
                  onClick={() => navigate("/applications")}
                  className="mt-3 inline-flex items-center gap-1 rounded-lg bg-brand-600 px-3 py-1.5 text-[11px] font-semibold text-white shadow-sm hover:bg-brand-700 transition-colors"
                >
                  <CalendarCheck size={12} />
                  Schedule an interview
                </button>
              </div>
            )}
          </Widget>
        </div>
      </div>

      {/* ─── Recent Applications ─── */}
      <Widget
        title="Recent Applications"
        action={
          <button
            onClick={() => navigate("/applications")}
            className="text-xs font-medium text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 transition-colors"
          >
            View all
          </button>
        }
      >
        {hasData && stats!.recentApplications.length > 0 ? (
          <div className="-mx-4 -mb-3">
            {stats!.recentApplications.slice(0, 5).map((app) => (
              <button
                key={app.id}
                onClick={() => navigate(`/applications/${app.id}`)}
                className="flex w-full items-center gap-3 border-b border-slate-100 dark:border-dark-border px-4 py-2.5 text-left transition-colors last:border-0 hover:bg-surface-secondary dark:hover:bg-white/[0.02]"
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-slate-100 dark:bg-white/[0.06] text-[11px] font-bold text-slate-500 dark:text-white/50">
                  {app.companyName.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-ink dark:text-white/85 truncate">{app.jobTitle}</p>
                  <p className="text-[11px] text-ink-secondary dark:text-white/50">{app.companyName}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-ink-tertiary dark:text-white/40 hidden sm:block">{formatDate(app.applicationDate)}</span>
                  <Badge variant={statusVariantMap[app.status] || "default"} dot={false}>
                    {app.status}
                  </Badge>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="py-6 text-center">
            <p className="text-xs text-ink-tertiary dark:text-white/40">No applications yet</p>
            <button
              onClick={() => navigate("/applications/new")}
              className="mt-2 text-xs font-medium text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 transition-colors"
            >
              Add your first application
            </button>
          </div>
        )}
      </Widget>

      {/* ─── Insights ─── */}
      <Widget title="Insights">
        {hasData && stats!.total >= 3 ? (
          <div className="space-y-4">
            {/* Rate cards */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-lg bg-surface-secondary dark:bg-white/[0.03] p-3">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-tertiary dark:text-white/40">Response</p>
                <p className="mt-1 text-lg font-bold text-ink dark:text-white/90">{stats!.responseRate}%</p>
                <p className="text-[11px] text-ink-tertiary dark:text-white/40 mt-0.5">{stats!.interview + stats!.offer} of {stats!.total}</p>
              </div>
              <div className="rounded-lg bg-surface-secondary dark:bg-white/[0.03] p-3">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-tertiary dark:text-white/40">Interview</p>
                <p className="mt-1 text-lg font-bold text-ink dark:text-white/90">{stats!.interviewRate}%</p>
                <p className="text-[11px] text-ink-tertiary dark:text-white/40 mt-0.5">{stats!.interview} total</p>
              </div>
              <div className="rounded-lg bg-surface-secondary dark:bg-white/[0.03] p-3">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-tertiary dark:text-white/40">Offer</p>
                <p className="mt-1 text-lg font-bold text-ink dark:text-white/90">{stats!.offerRate}%</p>
                <p className="text-[11px] text-ink-tertiary dark:text-white/40 mt-0.5">{stats!.offer} total</p>
              </div>
              <div className="rounded-lg bg-surface-secondary dark:bg-white/[0.03] p-3">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-tertiary dark:text-white/40">Rejected</p>
                <p className="mt-1 text-lg font-bold text-ink dark:text-white/90">{stats!.rejectionRate}%</p>
                <p className="text-[11px] text-ink-tertiary dark:text-white/40 mt-0.5">{stats!.rejected} total</p>
              </div>
            </div>

            {/* Time to Interview */}
            {stats!.avgTimeToInterview !== null && (
              <div className="rounded-lg bg-surface-secondary dark:bg-white/[0.03] p-3">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-tertiary dark:text-white/40">Avg Time to Interview</p>
                <p className="mt-1 text-lg font-bold text-ink dark:text-white/90">{stats!.avgTimeToInterview}d</p>
                <p className="text-[11px] text-ink-tertiary dark:text-white/40 mt-0.5">From application to interview</p>
              </div>
            )}

            {/* Source breakdown */}
            {stats!.sourceBreakdown.length > 1 && (
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-tertiary dark:text-white/40 mb-2">By Source</p>
                <div className="space-y-1.5">
                  {stats!.sourceBreakdown.slice(0, 5).map((s) => (
                    <div key={s.source} className="flex items-center gap-3">
                      <span className="w-20 shrink-0 text-xs text-ink-secondary dark:text-white/50">{s.source}</span>
                      <div className="flex-1 h-2 rounded-full bg-slate-100 dark:bg-white/[0.06] overflow-hidden">
                        <div
                          className="h-full rounded-full bg-brand-500"
                          style={{ width: `${s.percentage}%` }}
                        />
                      </div>
                      <span className="w-8 text-right text-xs font-semibold text-ink dark:text-white/70 tabular-nums">{s.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="py-4 text-center">
            <p className="text-xs text-ink-tertiary dark:text-white/40">Track at least 3 applications to see insights</p>
          </div>
        )}
      </Widget>
    </div>
  );
}
