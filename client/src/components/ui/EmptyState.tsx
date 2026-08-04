import { useId, type ReactNode } from "react";
import { Button } from "./Button";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  tips?: string[];
}

/**
 * Canonical empty state: a labelled <section> with aria-labelledby pointing at its
 * heading, a simple icon, a one-line explanation, and one primary recovery action.
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  tips,
}: EmptyStateProps) {
  const titleId = useId();

  return (
    <section
      aria-labelledby={titleId}
      className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 dark:border-dark-border bg-white dark:bg-dark-surface px-6 py-16 text-center"
    >
      {icon && (
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 dark:bg-white/[0.06] text-3xl">
          {icon}
        </div>
      )}
      <h3 id={titleId} className="text-heading text-ink dark:text-white/90">
        {title}
      </h3>
      {description && (
        <p className="mt-1.5 max-w-md text-body text-ink-secondary dark:text-white/50">
          {description}
        </p>
      )}
      <div className="mt-6 flex items-center gap-3">
        {action && (
          <Button size="lg" onClick={action.onClick}>
            {action.label}
          </Button>
        )}
        {secondaryAction && (
          <Button variant="secondary" size="lg" onClick={secondaryAction.onClick}>
            {secondaryAction.label}
          </Button>
        )}
      </div>
      {tips && tips.length > 0 && (
        <div className="mt-8 rounded-lg bg-surface-secondary dark:bg-white/[0.03] px-5 py-4 text-left">
          <p className="mb-2 text-caption font-medium uppercase tracking-wider text-ink-tertiary dark:text-white/40">
            Quick tips
          </p>
          <ul className="space-y-1.5">
            {tips.map((tip, i) => (
              <li key={i} className="flex items-start gap-2 text-body text-ink-secondary dark:text-white/50">
                <span className="mt-0.5 text-brand-500 dark:text-brand-400">•</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
