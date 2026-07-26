import { memo } from "react";
import { formatDate } from "../utils/format";
import type { Application, ApplicationStatus } from "../types";
import {
  Eye,
  PencilSimpleLine,
  TrashSimple,
  FileText,
} from "@phosphor-icons/react";
import { SparkleIcon } from "./ui/SparkleIcon";

/* ─── Constants ─── */

const statusConfig: Record<ApplicationStatus, { border: string; label: string }> = {
  Saved: { border: "bg-slate-400", label: "Saved" },
  Applied: { border: "bg-blue-500", label: "Applied" },
  Assessment: { border: "bg-amber-500", label: "Assessment" },
  Interview: { border: "bg-purple-500", label: "Interview" },
  Rejected: { border: "bg-rose-500", label: "Rejected" },
  Offer: { border: "bg-emerald-500", label: "Offer" },
};

const statusPill: Record<ApplicationStatus, string> = {
  Saved: "bg-slate-100 dark:bg-white/[0.06] text-slate-600 dark:text-white/50",
  Applied: "bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400",
  Assessment: "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400",
  Interview: "bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400",
  Rejected: "bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400",
  Offer: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
};

/* ─── CompanyAvatar ─── */

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

const avatarColors = [
  "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  "bg-violet-500/15 text-violet-600 dark:text-violet-400",
  "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  "bg-rose-500/15 text-rose-600 dark:text-rose-400",
  "bg-cyan-500/15 text-cyan-600 dark:text-cyan-400",
  "bg-pink-500/15 text-pink-600 dark:text-pink-400",
  "bg-teal-500/15 text-teal-600 dark:text-teal-400",
];

function CompanyAvatar({ companyName }: { companyName: string }) {
  const initials = getInitials(companyName);
  const colorIndex =
    companyName.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) %
    avatarColors.length;

  return (
    <div
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[11px] font-semibold leading-none ${avatarColors[colorIndex]}`}
      aria-hidden="true"
    >
      {initials}
    </div>
  );
}

/* ─── StatusBadge ─── */

function StatusBadge({ status }: { status: ApplicationStatus }) {
  const pillClass =
    Object.prototype.hasOwnProperty.call(statusPill, status)
      ? statusPill[status]
      : statusPill.Saved;
  return (
    <span
      className={`inline-flex items-center rounded-md px-1.5 py-[3px] text-[11px] font-medium leading-none ${pillClass}`}
    >
      {status}
    </span>
  );
}

/* ─── ApplicationActions ─── */

interface ApplicationActionsProps {
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function ApplicationActions({ onView, onEdit, onDelete }: ApplicationActionsProps) {
  return (
    <div className="flex items-center gap-0.5">
      <button
        onClick={(e) => { e.stopPropagation(); onView(); }}
        className="rounded-md p-1.5 text-ink-tertiary dark:text-white/30 opacity-0 group-hover:opacity-100 transition-all duration-150 hover:bg-surface-tertiary dark:hover:bg-white/5"
        title="View details"
        aria-label="View application details"
      >
        <Eye size={14} />
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); onEdit(); }}
        className="rounded-md p-1.5 text-ink-tertiary dark:text-white/30 opacity-0 group-hover:opacity-100 transition-all duration-150 hover:bg-surface-tertiary dark:hover:bg-white/5"
        title="Edit"
        aria-label="Edit application"
      >
        <PencilSimpleLine size={14} />
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(); }}
        className="rounded-md p-1.5 text-ink-tertiary dark:text-white/30 opacity-0 group-hover:opacity-100 transition-all duration-150 hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:text-rose-500"
        title="Delete"
        aria-label="Delete application"
      >
        <TrashSimple size={14} />
      </button>
    </div>
  );
}

/* ─── ApplicationRow ─── */

interface ApplicationRowProps {
  application: Application;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onAnalyzeMatch?: () => void;
}

export const ApplicationRow = memo(function ApplicationRow({
  application,
  onView,
  onEdit,
  onDelete,
  onAnalyzeMatch,
}: ApplicationRowProps) {
  const config =
    Object.prototype.hasOwnProperty.call(statusConfig, application.status)
      ? statusConfig[application.status]
      : statusConfig.Saved;
  const border = config.border;
  const hasResume = !!(application.resumeLink || application.resumeId);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onView}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onView(); } }}
      className="group relative flex cursor-pointer items-stretch rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface transition-all duration-150 hover:border-slate-300 dark:hover:border-white/15 hover:shadow-card-hover hover:-translate-y-px"
    >
      {/* Status left border */}
      <div className={`w-[3px] shrink-0 rounded-l-xl ${border}`} />

      {/* Desktop layout: single row */}
      <div className="hidden md:flex flex-1 items-center gap-3 px-3 py-2.5 min-w-0">
        <CompanyAvatar companyName={application.companyName} />

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-ink dark:text-white/90">
            {application.jobTitle}
          </p>
          <p className="truncate text-xs text-ink-secondary dark:text-white/50 mt-px">
            {application.companyName}
          </p>
        </div>

        <div className="w-24 shrink-0 flex items-center justify-start">
          <StatusBadge status={application.status} />
        </div>

        <span className="text-xs text-ink-tertiary dark:text-white/40 w-20 shrink-0 truncate">
          {application.source}
        </span>

        <div className="w-24 shrink-0 flex items-center justify-center">
          {application.aiMatchScore !== undefined && application.aiMatchScore !== null ? (
            <span className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-bold bg-gradient-to-r from-indigo-500/10 to-purple-500/10 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30 shadow-sm">
              <SparkleIcon className="w-3 h-3 text-indigo-500" />
              <span>{application.aiMatchScore}%</span>
            </span>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onAnalyzeMatch) onAnalyzeMatch();
              }}
              className="rounded-md p-1.5 text-ink-tertiary dark:text-white/30 opacity-0 group-hover:opacity-100 transition-all duration-150 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 hover:text-indigo-600 dark:hover:text-indigo-400"
              title="Analyze AI Match Score"
              aria-label="Analyze AI Match Score"
            >
              <SparkleIcon className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <span className="w-12 shrink-0 flex items-center justify-center">
          {hasResume ? (
            <FileText size={14} className="text-indigo-500" />
          ) : (
            <FileText size={14} className="text-ink-tertiary dark:text-white/30 opacity-40" />
          )}
        </span>

        <span className="text-[11px] text-ink-tertiary dark:text-white/40 w-20 shrink-0 whitespace-nowrap text-right">
          {formatDate(application.applicationDate)}
        </span>

        <ApplicationActions
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </div>

      {/* Mobile layout: stacked two rows */}
      <div className="flex md:hidden flex-1 flex-col gap-1 px-3 py-2 min-w-0">
        <div className="flex items-center gap-3 min-w-0">
          <CompanyAvatar companyName={application.companyName} />

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-ink dark:text-white/90">
              {application.jobTitle}
            </p>
            <p className="truncate text-xs text-ink-secondary dark:text-white/50 mt-px">
              {application.companyName}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <StatusBadge status={application.status} />
          <span className="text-[11px] text-ink-tertiary dark:text-white/40">
            {formatDate(application.applicationDate)}
          </span>
        </div>
      </div>
    </div>
  );
});

export { CompanyAvatar, StatusBadge, ApplicationActions };
