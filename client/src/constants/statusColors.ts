/**
 * Single source of truth for job application status colors.
 * Import this everywhere instead of defining status colors inline.
 */
export const STATUS_CONFIG = {
  Saved: {
    label: "Saved",
    dot: "bg-slate-400",
    badge: {
      bg: "bg-slate-100",
      text: "text-slate-700",
      darkBg: "dark:bg-white/10",
      darkText: "dark:text-white/60",
    },
    pill: {
      bg: "bg-slate-100 dark:bg-slate-500/20",
      text: "text-slate-700 dark:text-slate-300",
      hover: "hover:bg-slate-200 dark:hover:bg-slate-500/30",
    },
    pipeline: "bg-slate-500",
    kanban: "bg-slate-200 text-slate-600 dark:bg-slate-500/10 dark:text-slate-400",
  },
  Applied: {
    label: "Applied",
    dot: "bg-blue-500",
    badge: {
      bg: "bg-blue-50",
      text: "text-blue-700",
      darkBg: "dark:bg-blue-500/10",
      darkText: "dark:text-blue-400",
    },
    pill: {
      bg: "bg-blue-100 dark:bg-blue-500/20",
      text: "text-blue-700 dark:text-blue-300",
      hover: "hover:bg-blue-200 dark:hover:bg-blue-500/30",
    },
    pipeline: "bg-blue-500",
    kanban: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
  },
  Assessment: {
    label: "Assessment",
    dot: "bg-amber-500",
    badge: {
      bg: "bg-amber-50",
      text: "text-amber-700",
      darkBg: "dark:bg-amber-500/10",
      darkText: "dark:text-amber-400",
    },
    pill: {
      bg: "bg-amber-100 dark:bg-amber-500/20",
      text: "text-amber-700 dark:text-amber-300",
      hover: "hover:bg-amber-200 dark:hover:bg-amber-500/30",
    },
    pipeline: "bg-amber-500",
    kanban: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
  },
  Interview: {
    label: "Interview",
    dot: "bg-purple-500",
    badge: {
      bg: "bg-purple-50",
      text: "text-purple-700",
      darkBg: "dark:bg-purple-500/10",
      darkText: "dark:text-purple-400",
    },
    pill: {
      bg: "bg-purple-100 dark:bg-purple-500/20",
      text: "text-purple-700 dark:text-purple-300",
      hover: "hover:bg-purple-200 dark:hover:bg-purple-500/30",
    },
    pipeline: "bg-purple-500",
    kanban: "bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400",
  },
  Rejected: {
    label: "Rejected",
    dot: "bg-rose-500",
    badge: {
      bg: "bg-rose-50",
      text: "text-rose-700",
      darkBg: "dark:bg-rose-500/10",
      darkText: "dark:text-rose-400",
    },
    pill: {
      bg: "bg-rose-100 dark:bg-rose-500/20",
      text: "text-rose-700 dark:text-rose-300",
      hover: "hover:bg-rose-200 dark:hover:bg-rose-500/30",
    },
    pipeline: "bg-rose-500",
    kanban: "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400",
  },
  Offer: {
    label: "Offer",
    dot: "bg-emerald-500",
    badge: {
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      darkBg: "dark:bg-emerald-500/10",
      darkText: "dark:text-emerald-400",
    },
    pill: {
      bg: "bg-emerald-100 dark:bg-emerald-500/20",
      text: "text-emerald-700 dark:text-emerald-300",
      hover: "hover:bg-emerald-200 dark:hover:bg-emerald-500/30",
    },
    pipeline: "bg-emerald-500",
    kanban: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
  },
} as const;

export type JobStatus = keyof typeof STATUS_CONFIG;

/** All status values as an array, for iteration */
export const ALL_STATUSES = Object.keys(STATUS_CONFIG) as JobStatus[];

/** Get the Tailwind class string for a badge (inline or Badge component) */
export function getBadgeClasses(status: JobStatus): string {
  const s = STATUS_CONFIG[status].badge;
  return `${s.bg} ${s.text} ${s.darkBg} ${s.darkText}`;
}

/** Get the Tailwind class string for a calendar pill */
export function getPillClasses(status: JobStatus): string {
  const s = STATUS_CONFIG[status].pill;
  return `${s.bg} ${s.text} ${s.hover}`;
}
