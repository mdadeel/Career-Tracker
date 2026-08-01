import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export function Card({
  children,
  header,
  footer,
  className = "",
  hover = false,
  onClick,
}: CardProps) {
  const Component = onClick ? "button" : "div";

  return (
    <Component
      onClick={onClick}
      className={`
        rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface shadow-card
        ${hover ? "transition-[border-color,box-shadow,background-color] duration-150 hover:shadow-card-hover hover:border-slate-300 dark:hover:border-white/20" : ""}
        ${onClick ? "cursor-pointer text-left w-full" : ""}
        ${className}
      `.trim()}
    >
      {header && (
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-dark-border px-5 py-4">
          {header}
        </div>
      )}
      {children && <div className="px-5 py-4">{children}</div>}
      {footer && (
        <div className="border-t border-slate-100 dark:border-dark-border px-5 py-3">{footer}</div>
      )}
    </Component>
  );
}
