import { forwardRef, type SelectHTMLAttributes } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: readonly { value: string; label: string }[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, helperText, options, placeholder, className = "", id, ...props }, ref) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, "-");
    const helperId = `${selectId}-helper`;
    const errorId = `${selectId}-error`;
    const describedBy = [error ? errorId : null, helperText && !error ? helperId : null]
      .filter(Boolean)
      .join(" ") || undefined;

    return (
      <div className="space-y-1.5">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-label uppercase tracking-wider text-ink-secondary dark:text-white/60"
          >
            {label}
            {props.required && <span className="ml-1 text-rose-400" aria-hidden="true">*</span>}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={`
            block w-full rounded-lg border px-3 py-2.5 text-body transition-all duration-150
            border-slate-300 dark:border-dark-border
            bg-white dark:bg-dark-surface
            text-ink dark:text-white/80
            focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none
            disabled:cursor-not-allowed disabled:opacity-50
            ${className}
          `.trim()}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={describedBy}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error ? (
          <p id={errorId} className="text-caption text-rose-500" role="alert">
            {error}
          </p>
        ) : helperText ? (
          <p id={helperId} className="text-caption text-ink-tertiary dark:text-white/40">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  }
);

Select.displayName = "Select";
