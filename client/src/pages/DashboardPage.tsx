import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useDashboard } from "../hooks/useDashboard";
import type { ReactNode } from "react";
import { Badge, statusVariantMap, Button, Skeleton } from "../components/ui";
import { formatDate } from "../utils/format";

/* ─── Metric Card ─── */
function MetricCard({
  label,
  value,
  sub,
  icon,
  onClick,
  empty,
}: {
  label: string;
  value: number;
  sub?: string;
  icon: ReactNode;
  onClick?: () => void;
  empty?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className="rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface p-4 text-left transition-all duration-150 hover:border-slate-300 dark:hover:border-white/15"
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
          <p className="text-2xl font-bold text-ink dark:text-white/90 tabular-nums">{value}</p>
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
        <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${pct}%` }} />
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
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
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

  // Upcoming interviews (with interviewDate, sorted by date ascending)
  const upcomingInterviews = hasData
    ? stats!.recentApplications
        .filter((a) => a.status === "Interview" && a.interviewDate)
        .sort((a, b) => new Date(a.interviewDate!).getTime() - new Date(b.interviewDate!).getTime())
        .slice(0, 5)
    : [];

  const interviewsWithoutDate = hasData
    ? stats!.recentApplications.filter((a) => a.status === "Interview" && !a.interviewDate).length
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
    <div className="py-4 lg:py-5 space-y-4">
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
          icon={
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          }
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
          icon={
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
            </svg>
          }
          onClick={() => navigate("/applications")}
        />
        <MetricCard
          label="Interviews"
          value={stats?.interview ?? 0}
          icon={
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
            </svg>
          }
          empty={!hasData}
          onClick={() => navigate("/applications?status=Interview")}
        />
        <MetricCard
          label="Offers"
          value={stats?.offer ?? 0}
          icon={
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
            </svg>
          }
          empty={!hasData}
          onClick={() => navigate("/applications?status=Offer")}
        />
        <MetricCard
          label="Response Rate"
          value={hasData ? stats!.responseRate : 0}
          sub={hasData ? `${stats!.interview + stats!.offer} of ${stats!.total} applications` : undefined}
          icon={
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
            </svg>
          }
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
                  <span className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400">
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                    </svg>
                  </span>
                  <div>
                    <p className="text-sm font-medium text-ink dark:text-white/85">{thisWeekApps} application{thisWeekApps !== 1 ? "s" : ""} submitted</p>
                    <p className="text-xs text-ink-tertiary dark:text-white/40">This week</p>
                  </div>
                </div>
                {stats!.interview > 0 && (
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-md bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400">
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
                      </svg>
                    </span>
                    <div>
                      <p className="text-sm font-medium text-ink dark:text-white/85">{stats!.interview} interview{stats!.interview !== 1 ? "s" : ""} scheduled</p>
                      <p className="text-xs text-ink-tertiary dark:text-white/40">In your pipeline</p>
                    </div>
                  </div>
                )}
                {stats!.rejected > 0 && (
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-md bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400">
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
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
                        <p className="text-[10px] text-ink-tertiary dark:text-white/40">{timeStr}</p>
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
              <div className="py-4 text-center">
                <p className="text-xs text-ink-tertiary dark:text-white/40">No upcoming interviews</p>
                <p className="text-[11px] text-ink-tertiary dark:text-white/30 mt-1">Set an interview date to see it here</p>
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
