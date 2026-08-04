import { forwardRef, type HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  onClick?: () => void;
  /** The semantic wrapper when the card stands alone — use "article" for standalone cards. */
  as?: "div" | "article" | "section";
}

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { className = "", hover = false, onClick, as: Component = "div", children, ...props },
  ref
) {
  return (
    <Component
      ref={ref}
      onClick={onClick}
      className={`
        flex flex-col rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface shadow-card overflow-hidden
        ${hover ? "transition-[border-color,box-shadow,background-color] duration-150 hover:shadow-card-hover hover:border-slate-300 dark:hover:border-white/20" : ""}
        ${onClick ? "cursor-pointer text-left w-full" : ""}
        ${className}
      `.trim()}
      {...props}
    >
      {children}
    </Component>
  );
});

export function CardHeader({ className = "", children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`flex items-center justify-between border-b border-slate-100 dark:border-dark-border px-5 py-4 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardTitle({ className = "", children, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={`text-heading text-ink dark:text-white/90 ${className}`} {...props}>
      {children}
    </h3>
  );
}

export function CardDescription({ className = "", children, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={`mt-1 text-body text-ink-secondary dark:text-white/50 ${className}`} {...props}>
      {children}
    </p>
  );
}

export function CardContent({ className = "", children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`px-5 py-4 ${className}`} {...props}>
      {children}
    </div>
  );
}

/** Actions row — pinned to the bottom of equal-height cards with mt-auto (the "chin" fix). */
export function CardFooter({ className = "", children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`mt-auto border-t border-slate-100 dark:border-dark-border px-5 py-3 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
