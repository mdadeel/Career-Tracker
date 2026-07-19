import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, icon, className = "", id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-label uppercase tracking-wider text-ink-secondary"
          >
            {label}
            {props.required && (
              <span className="ml-1 text-rose-400">*</span>
            )}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-ink-tertiary">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`
              block w-full rounded-lg border px-3 py-2.5 text-body transition-all duration-150
              bg-white dark:bg-dark-surface
              text-ink dark:text-white/80
              placeholder:text-ink-tertiary dark:placeholder:text-white/30
              ${
                error
                  ? "border-rose-300 dark:border-rose-500/30 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                  : "border-slate-300 dark:border-dark-border focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
              }
              ${icon ? "pl-10" : ""}
              ${className}
            `.trim()}
            aria-invalid={error ? "true" : undefined}
            aria-describedby={error ? `${inputId}-error` : undefined}
            {...props}
          />
        </div>
        {error && (
          <p id={`${inputId}-error`} className="text-caption text-rose-500" role="alert">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className="text-caption text-ink-tertiary">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
