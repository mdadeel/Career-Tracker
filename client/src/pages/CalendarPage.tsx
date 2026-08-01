import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useApplications } from "../hooks/useApplications";
import { Skeleton } from "../components/ui";
import { CaretLeft, CaretRight, Plus, Chats, Bookmark, ArrowUp, PencilLine, ChatCircle, XCircle, CheckCircle } from "@phosphor-icons/react";
import type { Application } from "../types";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const STATUS_PILL_STYLES: Record<string, string> = {
  Saved: "bg-slate-100 dark:bg-slate-500/20 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-500/30",
  Applied: "bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-500/30",
  Assessment: "bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-500/30",
  Interview: "bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-500/30",
  Rejected: "bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 hover:bg-rose-200 dark:hover:bg-rose-500/30",
  Offer: "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-500/30",
};

function getMonthGrid(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);
  return days;
}

function CalendarSkeleton() {
  return (
    <div className="py-5 lg:py-6 space-y-4">
      <Skeleton width={160} height={18} />
      <div className="rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface p-4">
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: 35 }).map((_, i) => (
            <div key={i} className="aspect-square rounded-lg bg-slate-100 dark:bg-white/[0.04]" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function CalendarPage() {
  const navigate = useNavigate();
  const { applications, isLoading } = useApplications();
  const today = new Date();
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const monthName = viewDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const days = getMonthGrid(year, month);

  // Group applications by date for this month
  const appsByDate = useMemo(() => {
    const map = new Map<number, Application[]>();
    for (const app of applications) {
      // Show interviews on their date
      if (app.status === "Interview" && app.interviewDate) {
        const d = new Date(app.interviewDate);
        if (d.getMonth() === month && d.getFullYear() === year) {
          const list = map.get(d.getDate()) || [];
          list.push(app);
          map.set(d.getDate(), list);
        }
      }
      // Show applications on their application date
      const appDate = new Date(app.applicationDate);
      if (appDate.getMonth() === month && appDate.getFullYear() === year) {
        const list = map.get(appDate.getDate()) || [];
        if (!list.find((a) => a.id === app.id)) {
          list.push(app);
          map.set(appDate.getDate(), list);
        }
      }
    }
    return map;
  }, [applications, month, year]);

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

  // Upcoming events (next 7 days)
  const upcomingEvents = useMemo(() => {
    const now = new Date();
    const weekFromNow = new Date(now.getTime() + 7 * 86400000);
    return applications
      .filter((a) => {
        if (a.status === "Interview" && a.interviewDate) {
          const d = new Date(a.interviewDate);
          return d >= now && d <= weekFromNow;
        }
        return false;
      })
      .sort((a, b) => new Date(a.interviewDate!).getTime() - new Date(b.interviewDate!).getTime());
  }, [applications]);

  // All events in current month view (for agenda)
  const allMonthEvents = useMemo(() => {
    const events: Application[] = [];
    for (const [, apps] of appsByDate) {
      apps.forEach((a) => {
        if (!events.find((e) => e.id === a.id)) events.push(a);
      });
    }
    return events.sort((a, b) => new Date(a.applicationDate).getTime() - new Date(b.applicationDate).getTime());
  }, [appsByDate]);

  const [calendarView, setCalendarView] = useState<"month" | "agenda">("month");
  const [activeStageFilter, setActiveStageFilter] = useState<string | null>(null);

  const toggleStageFilter = (status: string) => {
    setActiveStageFilter((prev) => (prev === status ? null : status));
  };

  const goToToday = () => setViewDate(new Date(today.getFullYear(), today.getMonth(), 1));

  const getEventIcon = (status: string) => {
    switch (status) {
      case "Saved": return <Bookmark size={10} weight="fill" />;
      case "Applied": return <ArrowUp size={10} weight="fill" />;
      case "Assessment": return <PencilLine size={10} weight="fill" />;
      case "Interview": return <ChatCircle size={10} weight="fill" />;
      case "Rejected": return <XCircle size={10} weight="fill" />;
      case "Offer": return <CheckCircle size={10} weight="fill" />;
      default: return (
        <svg className="h-2.5 w-2.5 text-ink-tertiary dark:text-white/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      );
    }
  };

  if (isLoading) return <CalendarSkeleton />;

  return (
    <div className="mx-auto max-w-5xl py-5 lg:py-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold text-ink dark:text-white/90">Calendar</h1>
          <p className="mt-0.5 text-sm text-ink-secondary dark:text-white/50">Your interview schedule and deadlines</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={goToToday}
            className="rounded-lg border border-slate-200 dark:border-dark-border px-3 py-1.5 text-xs font-medium text-ink-secondary dark:text-white/60 hover:bg-surface-secondary dark:hover:bg-white/5 transition-colors"
          >
            Today
          </button>
          <div className="flex items-center gap-0.5 rounded-lg border border-slate-200 dark:border-dark-border p-0.5">
            {(["month", "agenda"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setCalendarView(v)}
                className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors ${
                  calendarView === v
                    ? "bg-brand-600 text-white shadow-sm"
                    : "text-ink-tertiary dark:text-white/40 hover:text-ink dark:hover:text-white/70"
                }`}
              >
                {v === "month" ? "Month" : "Agenda"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_280px]">
        {/* Calendar Grid */}
        <div className="rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface overflow-hidden shadow-sm">
          {/* Month Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-dark-border">
            <button onClick={prevMonth} className="rounded-lg p-1 text-ink-tertiary dark:text-white/40 hover:bg-surface-tertiary dark:hover:bg-white/5 transition-colors">
              <CaretLeft size={16} />
            </button>
            <h2 className="text-sm font-semibold text-ink dark:text-white/85">{monthName}</h2>
            <button onClick={nextMonth} className="rounded-lg p-1 text-ink-tertiary dark:text-white/40 hover:bg-surface-tertiary dark:hover:bg-white/5 transition-colors">
              <CaretRight size={16} />
            </button>
          </div>

          {/* Interactive Stage Legend */}
          <div className="flex flex-wrap items-center gap-2 px-4 py-2.5 border-b border-slate-100 dark:border-dark-border bg-slate-50/50 dark:bg-white/[0.02]">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-tertiary dark:text-white/40 mr-1">Filter Stage:</span>
            {Object.entries(STATUS_PILL_STYLES).map(([status]) => {
              const isActive = activeStageFilter === status;
              return (
                <button
                  key={status}
                  onClick={() => toggleStageFilter(status)}
                  className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium transition-all ${
                    isActive
                      ? "ring-2 ring-brand-500 bg-brand-500 text-white"
                      : "text-ink-tertiary dark:text-white/60 hover:bg-slate-200/60 dark:hover:bg-white/10"
                  }`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${isActive ? "bg-white" : STATUS_PILL_STYLES[status].split(" ")[0]}`} />
                  {status}
                </button>
              );
            })}
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 border-b border-slate-100 dark:border-dark-border">
            {WEEKDAYS.map((d) => (
              <div key={d} className="px-2 py-2 text-center text-[11px] font-semibold text-ink-tertiary dark:text-white/40 uppercase tracking-wider">
                {d}
              </div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7">
            {days.map((day, i) => {
              if (day === null) return <div key={`e-${i}`} className="aspect-square bg-slate-50/30 dark:bg-white/[0.01]" />;
              const rawApps = appsByDate.get(day) || [];
              const apps = activeStageFilter ? rawApps.filter(a => a.status === activeStageFilter) : rawApps;
              const isToday = today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;
              const isPast = new Date(year, month, day) < new Date(new Date().toDateString());
              
              const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

              return (
                <div
                  key={day}
                  onClick={() => navigate(`/applications/new?date=${dateStr}`)}
                  className={`group relative aspect-square border-b border-r border-slate-100 dark:border-dark-border p-1.5 transition-colors cursor-pointer hover:bg-brand-50/40 dark:hover:bg-brand-500/5 ${
                    isToday ? "bg-brand-50/70 dark:bg-brand-500/10" : ""
                  } ${isPast ? "opacity-60" : ""}`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] ${
                        isToday
                          ? "bg-brand-600 text-white font-bold shadow-xs"
                          : "text-ink dark:text-white/70 font-medium"
                      }`}
                    >
                      {day}
                    </span>
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold text-brand-600 dark:text-brand-400">
                      +
                    </span>
                  </div>
                  {apps.length > 0 && (
                    <div className="mt-1 space-y-0.5">
                      {apps.slice(0, 2).map((app) => (
                        <button
                          key={app.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/applications?id=${app.id}`);
                          }}
                          className={`w-full truncate rounded px-1.5 py-0.5 text-[9px] font-medium text-left transition-colors flex items-center gap-1 ${
                            STATUS_PILL_STYLES[app.status] || STATUS_PILL_STYLES.Saved
                          }`}
                        >
                          <span className="shrink-0">{getEventIcon(app.status)}</span>
                          <span className="truncate">{app.companyName}</span>
                        </button>
                      ))}
                      {apps.length > 2 && (
                        <p className="text-[9px] text-ink-tertiary dark:text-white/40 pl-1 font-mono">+{apps.length - 2} more</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Sidebar: Upcoming Events */}
        <div className="space-y-4">
          {/* Agenda list */}
          <div className="rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface p-4">
            <h3 className="text-xs font-semibold text-ink dark:text-white/85 mb-3">Agenda</h3>
            {calendarView === "agenda" ? (
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {allMonthEvents.length > 0 ? (
                  allMonthEvents.map((app) => {
                    const date = app.status === "Interview" && app.interviewDate ? new Date(app.interviewDate) : new Date(app.applicationDate);
                    return (
                      <button
                        key={app.id}
                        onClick={() => navigate(`/applications?id=${app.id}`)}
                        className="flex w-full items-center gap-2 rounded-lg p-2 text-left transition-colors hover:bg-surface-secondary dark:hover:bg-white/[0.03]"
                      >
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-brand-50 dark:bg-brand-500/10 text-xs font-bold text-brand-600 dark:text-brand-400">
                          {app.companyName.charAt(0)}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium text-ink dark:text-white/85 truncate">{app.jobTitle}</p>
                          <p className="text-xs text-ink-tertiary dark:text-white/40 truncate">{app.companyName}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-[11px] font-semibold text-ink dark:text-white/70 tabular-nums">
                            {date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          </p>
                          <p className="text-[10px] text-ink-tertiary dark:text-white/40">{app.status}</p>
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <p className="text-xs text-ink-tertiary dark:text-white/40 py-4 text-center">No events this month</p>
                )}
              </div>
            ) : (
              <>
                <h4 className="text-[11px] font-semibold text-ink-tertiary dark:text-white/50 mb-2">Upcoming Interviews</h4>
                {upcomingEvents.length > 0 ? (
                  <div className="space-y-2">
                    {upcomingEvents.map((app) => (
                      <button
                        key={app.id}
                        onClick={() => navigate(`/applications?id=${app.id}`)}
                        className="flex w-full items-center gap-2 rounded-lg p-2 text-left transition-colors hover:bg-surface-secondary dark:hover:bg-white/[0.03]"
                      >
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-purple-50 dark:bg-purple-500/10 text-xs font-bold text-purple-600 dark:text-purple-400">
                          {app.companyName.charAt(0)}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium text-ink dark:text-white/85 truncate">{app.jobTitle}</p>
                          <p className="text-xs text-ink-tertiary dark:text-white/40 truncate">{app.companyName}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs font-semibold text-purple-600 dark:text-purple-400 tabular-nums">
                            {new Date(app.interviewDate!).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="py-4 text-center">
                    <p className="text-xs text-ink-tertiary dark:text-white/40">No upcoming interviews</p>
                  </div>
                )}
                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-dark-border">
                  <button
                    onClick={() => navigate("/applications/new")}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-ink-secondary dark:text-white/60 hover:bg-surface-secondary dark:hover:bg-white/[0.04] transition-colors"
                  >
                    <Plus size={16} className="text-brand-500" />
                    New Application
                  </button>
                  <button
                    onClick={() => navigate("/applications")}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-ink-secondary dark:text-white/60 hover:bg-surface-secondary dark:hover:bg-white/[0.04] transition-colors"
                  >
                    <Chats size={16} className="text-purple-500" />
                    View Applications
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
