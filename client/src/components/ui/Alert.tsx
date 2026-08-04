import type { ReactNode } from "react";
import { WarningCircle, CheckCircle, Info, XCircle } from "@phosphor-icons/react";

type AlertVariant = "info" | "success" | "warning" | "error";

interface AlertProps {
  variant?: AlertVariant;
  /** Concise message text (or any content). */
  children: ReactNode;
  /** Optional bold title line above the message. */
  title?: string;
  /** Optional trailing action (e.g. a Retry button). */
  action?: ReactNode;
  /** Optional dismiss control; render it yourself to keep focus handling local. */
  className?: string;
  /** Live region role — use "alert" for urgent dynamic messages, "status" for advisory. */
  role?: "alert" | "status";
}

const variantStyles: Record<AlertVariant, { surface: string; accent: string; text: string; icon: ReactNode }> = {
  info: {
    surface: "bg-blue-50 dark:bg-blue-500/10",
    accent: "border-s-blue-400 dark:border-s-blue-500",
    text: "text-blue-800 dark:text-blue-300",
    icon: <Info size={16} weight="fill" className="text-blue-500" />,
  },
  success: {
    surface: "bg-emerald-50 dark:bg-emerald-500/10",
    accent: "border-s-emerald-500",
    text: "text-emerald-800 dark:text-emerald-300",
    icon: <CheckCircle size={16} weight="fill" className="text-emerald-500" />,
  },
  warning: {
    surface: "bg-amber-50 dark:bg-amber-500/10",
    accent: "border-s-amber-500",
    text: "text-amber-800 dark:text-amber-300",
    icon: <WarningCircle size={16} weight="fill" className="text-amber-500" />,
  },
  error: {
    surface: "bg-rose-50 dark:bg-rose-500/10",
    accent: "border-s-rose-500",
    text: "text-rose-800 dark:text-rose-300",
    icon: <XCircle size={16} weight="fill" className="text-rose-500" />,
  },
};

/**
 * Inline Alert / Callout.
 *
 * Lightly tinted severity surface + a narrow border-inline-start accent
 * bar (flips to the right edge in RTL) + a matching severity icon and one
 * concise message, with an optional trailing action. Per the pattern:
 * https://namethatui.com/web/alert-callout-banner
 */
export function Alert({ variant = "info", children, title, action, className = "", role = "alert" }: AlertProps) {
  const s = variantStyles[variant];
  return (
    <div
      role={role}
      className={`flex items-start gap-3 rounded-r-lg rounded-l-md border border-s-4 py-3 pl-4 pr-3.5 text-sm ${s.surface} ${s.accent} ${s.text} ${className}`}
    >
      <span className="mt-0.5 shrink-0" aria-hidden="true">{s.icon}</span>
      <div className="min-w-0 flex-1">
        {title && <p className="mb-0.5 font-semibold">{title}</p>}
        <div className="leading-relaxed">{children}</div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
