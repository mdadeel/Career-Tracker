import type { ReactNode } from "react";
import { useCountUp } from "../../hooks/useCountUp";

interface MetricCardProps {
  label: ReactNode;
  value: number | string;
  sub?: string;
  icon?: ReactNode;
  onClick?: () => void;
  empty?: boolean;
  valueSuffix?: string;
}

export function MetricCard({
  label,
  value,
  sub,
  icon,
  onClick,
  empty,
  valueSuffix,
}: MetricCardProps) {
  const numVal = typeof value === "number" ? value : parseInt(value, 10);
  const counted = useCountUp(isNaN(numVal) ? 0 : numVal, 1000, !empty && !isNaN(numVal));
  const displayVal = typeof value === "number" ? counted : value;

  const Tag = onClick ? "button" : "div";

  return (
    <Tag
      onClick={onClick}
      className={`rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface p-4 text-left transition-[border-color,box-shadow,background-color] duration-200 hover:border-brand-500/50 hover:bg-slate-50/50 dark:hover:bg-white/[0.02] hover:shadow-card-hover${onClick ? " cursor-pointer" : ""}`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-tertiary dark:text-white/40">
          {label}
        </span>
        {icon && <span className="text-ink-tertiary dark:text-white/30">{icon}</span>}
      </div>
      {empty ? (
        <p className="text-xs text-ink-tertiary dark:text-white/40">No data yet</p>
      ) : (
        <>
          <p className="text-2xl font-extrabold text-ink dark:text-white/90 tabular-nums">{displayVal}{valueSuffix}</p>
          {sub && <p className="mt-0.5 text-xs text-ink-tertiary dark:text-white/40">{sub}</p>}
        </>
      )}
    </Tag>
  );
}
