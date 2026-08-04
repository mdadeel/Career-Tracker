import { useRef, useState, useLayoutEffect, type KeyboardEvent, type ReactNode } from "react";

interface ToggleGroupOption<T extends string> {
  value: T;
  label: ReactNode;
  icon?: ReactNode;
}

interface ToggleGroupProps<T extends string> {
  /** The connected segments. */
  options: ToggleGroupOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /** Accessible name for the radiogroup. */
  ariaLabel?: string;
  size?: "sm" | "md";
  className?: string;
}

const sizeStyles = {
  sm: "px-2.5 py-1 text-[11px] rounded-md gap-1",
  md: "px-3 py-1.5 text-xs rounded-lg gap-1.5",
} as const;

/**
 * Toggle Group (Segmented Control).
 *
 * One segment stays filled (the selected toggle), connected as a single
 * pill with `role="radiogroup"` / `role="radio"` + `aria-checked`, and
 * arrow-key movement between segments per the pattern:
 * https://namethatui.com/web/toggle-group
 */
export function ToggleGroup<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
  size = "md",
  className = "",
}: ToggleGroupProps<T>) {
  const listRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);
  const [thumb, setThumb] = useState<{ left: number; width: number } | null>(null);

  // Measure the active segment so the sliding thumb tracks it.
  useLayoutEffect(() => {
    const el = activeRef.current;
    if (!el || typeof el.offsetLeft !== "number") return;
    setThumb({ left: el.offsetLeft, width: el.offsetWidth });
  }, [value, options.length]);

  const activeIndex = options.findIndex((o) => o.value === value);

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!["ArrowRight", "ArrowLeft", "Home", "End"].includes(e.key)) return;
    e.preventDefault();
    let next = activeIndex;
    if (e.key === "ArrowRight") next = Math.min(activeIndex + 1, options.length - 1);
    if (e.key === "ArrowLeft") next = Math.max(activeIndex - 1, 0);
    if (e.key === "Home") next = 0;
    if (e.key === "End") next = options.length - 1;
    onChange(options[next].value);
    // Move focus to the newly selected radio
    listRef.current?.querySelector<HTMLButtonElement>(`[data-value="${options[next].value}"]`)?.focus();
  };

  return (
    <div
      ref={listRef}
      role="radiogroup"
      aria-label={ariaLabel}
      onKeyDown={handleKeyDown}
      className={`relative inline-flex items-center gap-0.5 rounded-xl border border-slate-200 dark:border-dark-border bg-slate-100/80 dark:bg-white/[0.04] p-0.5 ${className}`}
    >
      {/* Sliding thumb — the segment that stays filled */}
      <span
        aria-hidden="true"
        className={`absolute inset-y-0.5 rounded-[10px] bg-white dark:bg-dark-elevated shadow-sm ring-1 ring-slate-200/80 dark:ring-white/10 transition-[left,width] duration-200 ease-out ${
          thumb ? "" : "opacity-0"
        }`}
        style={thumb ? { left: thumb.left, width: thumb.width } : undefined}
      />
      {options.map((opt) => {
        const isActive = opt.value === value;
        return (
          <button
            key={opt.value}
            ref={isActive ? activeRef : undefined}
            type="button"
            role="radio"
            aria-checked={isActive}
            data-value={opt.value}
            onClick={() => onChange(opt.value)}
            className={`relative z-10 inline-flex items-center justify-center whitespace-nowrap font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 ${
              sizeStyles[size]
            } ${
              isActive
                ? "text-brand-700 dark:text-white"
                : "text-ink-secondary dark:text-white/50 hover:text-ink dark:hover:text-white/75"
            }`}
          >
            {opt.icon && <span className="shrink-0">{opt.icon}</span>}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}


