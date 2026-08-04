import { forwardRef, type TextareaHTMLAttributes } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  showCharCount?: boolean;
  maxLength?: number;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, showCharCount, maxLength, className = "", id, value, ...props }, ref) => {
    const textareaId = id || label?.toLowerCase().replace(/\s+/g, "-");
    const helperId = `${textareaId}-helper`;
    const errorId = `${textareaId}-error`;
    const describedBy = [error ? errorId : null, helperText && !error ? helperId : null]
      .filter(Boolean)
      .join(" ") || undefined;
    const charCount = typeof value === "string" ? value.length : 0;

    return (
      <div className="space-y-1.5">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-label uppercase tracking-wider text-ink-secondary dark:text-white/60"
          >
            {label}
            {props.required && <span className="ml-1 text-rose-400" aria-hidden="true">*</span>}
          </label>
        )}
        <div className="relative">
          <textarea
            ref={ref}
            id={textareaId}
            value={value}
            className={`
              block w-full rounded-lg border px-3 py-2.5 text-body transition-all duration-150
              bg-white dark:bg-dark-surface resize-y min-h-[80px]
              text-ink dark:text-white/80
              placeholder:text-ink-tertiary dark:placeholder:text-white/30
              ${
                error
                  ? "border-rose-300 dark:border-rose-500/30 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                  : "border-slate-300 dark:border-dark-border focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
              }
              ${className}
            `.trim()}
            aria-invalid={error ? "true" : undefined}
            aria-describedby={describedBy}
            maxLength={maxLength}
            {...props}
          />
        </div>
        <div className="flex items-center justify-between gap-2">
          {error ? (
            <p id={errorId} className="text-caption text-rose-500" role="alert">
              {error}
            </p>
          ) : helperText ? (
            <p id={helperId} className="text-caption text-ink-tertiary dark:text-white/40">
              {helperText}
            </p>
          ) : (
            <span />
          )}
          {showCharCount && (
            <p className="text-caption text-ink-tertiary dark:text-white/40" aria-live="polite">
              {charCount}{maxLength ? ` / ${maxLength}` : ""}
            </p>
          )}
        </div>
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
