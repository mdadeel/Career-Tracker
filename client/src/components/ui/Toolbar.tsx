import type { ReactNode } from "react";

interface ToolbarProps {
  children: ReactNode;
  className?: string;
}

export function Toolbar({ children, className = "" }: ToolbarProps) {
  return (
    <div
      className={`
        flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface px-4 py-3 shadow-card
        ${className}
      `.trim()}
    >
      {children}
    </div>
  );
}

interface ToolbarSectionProps {
  children: ReactNode;
  className?: string;
}

export function ToolbarSection({ children, className = "" }: ToolbarSectionProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {children}
    </div>
  );
}

export function ToolbarSpacer() {
  return <div className="flex-1" />;
}
