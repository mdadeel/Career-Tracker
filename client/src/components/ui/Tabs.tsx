import { useRef, useState, useLayoutEffect, type KeyboardEvent, type ReactNode } from "react";

interface TabItem<T extends string> {
  value: T;
  label: ReactNode;
}

interface TabsProps<T extends string> {
  /** The tab list labels. */
  tabs: TabItem<T>[];
  active: T;
  onChange: (value: T) => void;
  /** Accessible name for the tablist (e.g. "Copilot tools"). */
  ariaLabel?: string;
  /** Stable id prefix so panels can reference tab ids (e.g. "copilot-workspace"). */
  idPrefix?: string;
  className?: string;
}

/**
 * Accessible Tabs: role="tablist" with one roving tab at tabindex="0",
 * arrow-key movement, and an animated indicator line that slides under
 * the selected tab. Panels are wired via aria-controls / aria-labelledby
 * by the consumer. Per the pattern:
 * https://namethatui.com/web/tabs
 */
export function Tabs<T extends string>({
  tabs,
  active,
  onChange,
  ariaLabel,
  idPrefix = "tabs",
  className = "",
}: TabsProps<T>) {
  const baseId = idPrefix;
  const listRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);
  const [indicator, setIndicator] = useState<{ left: number; width: number } | null>(null);

  useLayoutEffect(() => {
    const el = activeRef.current;
    if (!el || typeof el.offsetLeft !== "number") return;
    setIndicator({ left: el.offsetLeft, width: el.offsetWidth });
  }, [active, tabs.length]);

  const activeIndex = tabs.findIndex((t) => t.value === active);

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!["ArrowRight", "ArrowLeft", "Home", "End"].includes(e.key)) return;
    e.preventDefault();
    let next = activeIndex;
    if (e.key === "ArrowRight") next = Math.min(activeIndex + 1, tabs.length - 1);
    if (e.key === "ArrowLeft") next = Math.max(activeIndex - 1, 0);
    if (e.key === "Home") next = 0;
    if (e.key === "End") next = tabs.length - 1;
    listRef.current
      ?.querySelector<HTMLButtonElement>(`[data-tab-value="${tabs[next].value}"]`)
      ?.focus();
    onChange(tabs[next].value);
  };

  return (
    <div
      ref={listRef}
      role="tablist"
      aria-label={ariaLabel}
      onKeyDown={handleKeyDown}
      className={`relative flex items-center gap-1 ${className}`}
    >
      {/* Animated active-tab indicator */}
      <span
        aria-hidden="true"
        className={`absolute bottom-0 h-0.5 rounded-full bg-brand-600 dark:bg-brand-400 transition-[left,width] duration-200 ease-out ${
          indicator ? "" : "opacity-0"
        }`}
        style={indicator ? { left: indicator.left, width: indicator.width } : undefined}
      />
      {tabs.map((tab) => {
        const isActive = tab.value === active;
        return (
          <button
            key={tab.value}
            ref={isActive ? activeRef : undefined}
            type="button"
            role="tab"
            id={`${baseId}-tab-${tab.value}`}
            aria-selected={isActive}
            aria-controls={`${baseId}-panel-${tab.value}`}
            data-tab-value={tab.value}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onChange(tab.value)}
            className={`relative z-10 inline-flex items-center whitespace-nowrap rounded-md px-3.5 py-2 text-xs font-semibold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 ${
              isActive
                ? "text-brand-700 dark:text-brand-300"
                : "text-ink-secondary dark:text-white/50 hover:text-ink dark:hover:text-white/80"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
