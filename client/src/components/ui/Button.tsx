import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  icon?: ReactNode;
  children?: ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-brand-400 text-ink-secondary border border-ink-secondary hover:bg-brand-300 active:translate-y-[2px] active:shadow-none shadow-irfan-shadow transition-all duration-150",
  secondary:
    "bg-white text-ink-secondary border border-ink-secondary hover:bg-surface-muted active:translate-y-[2px] active:shadow-none shadow-irfan-shadow transition-all duration-150",
  ghost:
    "text-ink hover:bg-white/10 active:bg-white/20 transition-all duration-150",
  danger:
    "bg-rose-600 text-white border border-ink-secondary hover:bg-rose-700 active:translate-y-[2px] active:shadow-none shadow-irfan-shadow transition-all duration-150",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-xs gap-2",
  md: "px-4 py-2 text-sm gap-3",
  lg: "px-5 py-2.5 text-md gap-4",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      isLoading = false,
      icon,
      children,
      className = "",
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`
          inline-flex items-center justify-center font-medium
          rounded-lg transition-colors duration-150
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 focus-visible:ring-offset-2
          disabled:cursor-not-allowed disabled:opacity-50
          ${variantStyles[variant]}
          ${sizeStyles[size]}
          ${className}
        `.trim()}
        {...props}
      >
        {isLoading ? (
          <svg
            className="h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : icon ? (
          <span className="flex shrink-0">{icon}</span>
        ) : null}
        {children && <span className="whitespace-nowrap">{children}</span>}
      </button>
    );
  }
);

Button.displayName = "Button";
