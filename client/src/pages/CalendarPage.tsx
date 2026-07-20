import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useApplications } from "../hooks/useApplications";
import { Skeleton } from "../components/ui";
import { CaretLeft, CaretRight, Plus, Chats } from "@phosphor-icons/react";
import type { Application } from "../types";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

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

  if (isLoading) return <CalendarSkeleton />;

  return (
    <div className="mx-auto max-w-5xl py-5 lg:py-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold text-ink dark:text-white/90">Calendar</h1>
          <p className="mt-0.5 text-sm text-ink-secondary dark:text-white/50">Your interview schedule and deadlines</p>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_280px]">
        {/* Calendar Grid */}
        <div className="rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-dark-border">
            <button onClick={prevMonth} className="rounded-lg p-1 text-ink-tertiary dark:text-white/40 hover:bg-surface-tertiary dark:hover:bg-white/5 transition-colors">
              <CaretLeft size={16} />
            </button>
            <h2 className="text-sm font-semibold text-ink dark:text-white/85">{monthName}</h2>
            <button onClick={nextMonth} className="rounded-lg p-1 text-ink-tertiary dark:text-white/40 hover:bg-surface-tertiary dark:hover:bg-white/5 transition-colors">
              <CaretRight size={16} />
            </button>
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
              if (day === null) return <div key={`e-${i}`} className="aspect-square" />;
              const apps = appsByDate.get(day) || [];
              const isToday = today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;
              return (
                <div
                  key={day}
                  className={`aspect-square border-b border-r border-slate-100 dark:border-dark-border p-1 transition-colors hover:bg-surface-secondary dark:hover:bg-white/[0.02] ${
                    isToday ? "bg-brand-50 dark:bg-brand-500/10" : ""
                  }`}
                >
                  <div className="flex items-center justify-center">
                    <span
                      className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                        isToday
                          ? "bg-brand-600 text-white font-semibold"
                          : "text-ink dark:text-white/70"
                      }`}
                    >
                      {day}
                    </span>
                  </div>
                  {apps.length > 0 && (
                    <div className="mt-0.5 space-y-0.5">
                      {apps.slice(0, 2).map((app) => (
                        <button
                          key={app.id}
                          onClick={() => navigate("/applications")}
                          className={`w-full truncate rounded px-1 py-0.5 text-[9px] font-medium text-left transition-colors ${
                            app.status === "Interview"
                              ? "bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-500/30"
                              : "bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-500/20"
                          }`}
                        >
                          {app.companyName}
                        </button>
                      ))}
                      {apps.length > 2 && (
                        <p className="text-[9px] text-ink-tertiary dark:text-white/40 pl-1">+{apps.length - 2} more</p>
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
          {/* Quick actions */}
          <div className="rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface p-4">
            <h3 className="text-xs font-semibold text-ink dark:text-white/85 mb-3">Quick Actions</h3>
            <div className="space-y-2">
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
          </div>

          {/* Upcoming events */}
          <div className="rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface p-4">
            <h3 className="text-xs font-semibold text-ink dark:text-white/85 mb-3">Next 7 Days</h3>
            {upcomingEvents.length > 0 ? (
              <div className="space-y-2">
                {upcomingEvents.map((app) => (
                  <button
                    key={app.id}
                    onClick={() => navigate("/applications")}
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
              <div className="py-6 text-center">
                <p className="text-xs text-ink-tertiary dark:text-white/40">No upcoming events</p>
                <p className="text-[11px] text-ink-tertiary dark:text-white/30 mt-1">Schedule an interview to see it here</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
