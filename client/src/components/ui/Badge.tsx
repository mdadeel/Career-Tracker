import type { ReactNode } from "react";

type BadgeVariant = "default" | "success" | "warning" | "danger" | "info" | "neutral";

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  dot?: boolean;
  className?: string;
}

const variantStyles: Record<BadgeVariant, { bg: string; text: string; dot: string }> = {
  default: { bg: "bg-slate-100", text: "text-slate-700", dot: "bg-slate-400" },
  success: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
  warning: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
  danger: { bg: "bg-rose-50", text: "text-rose-700", dot: "bg-rose-500" },
  info: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500" },
  neutral: { bg: "bg-purple-50", text: "text-purple-700", dot: "bg-purple-500" },
};

const statusVariantMap: Record<string, BadgeVariant> = {
  Saved: "default",
  Applied: "info",
  Assessment: "warning",
  Interview: "neutral",
  Rejected: "danger",
  Offer: "success",
};

export { statusVariantMap };

export function Badge({ children, variant = "default", dot = false, className = "" }: BadgeProps) {
  const styles = variantStyles[variant];

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-caption font-medium
        ${styles.bg} ${styles.text}
        ${className}
      `.trim()}
    >
      {dot && (
        <span className={`h-1.5 w-1.5 rounded-full ${styles.dot}`} />
      )}
      {children}
    </span>
  );
}
