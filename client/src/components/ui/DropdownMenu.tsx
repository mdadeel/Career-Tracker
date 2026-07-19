import { useState, useRef, useEffect, type ReactNode } from "react";

interface DropdownItem {
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  variant?: "default" | "danger";
}

interface DropdownMenuProps {
  trigger: ReactNode;
  items: DropdownItem[];
  align?: "left" | "right";
}

export function DropdownMenu({ trigger, items, align = "right" }: DropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  return (
    <div ref={dropdownRef} className="relative inline-block">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="rounded-lg p-1.5 text-ink-tertiary dark:text-white/40 transition-colors hover:bg-surface-tertiary dark:hover:bg-white/[0.06] hover:text-ink-secondary dark:hover:text-white/70"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        {trigger}
      </button>

      {isOpen && (
        <div
          className={`
            absolute z-50 mt-1 min-w-[160px] animate-scale-in rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface py-1 shadow-elevated
            ${align === "right" ? "right-0" : "left-0"}
          `.trim()}
          role="menu"
        >
          {items.map((item, i) => (
            <button
              key={i}
              onClick={() => {
                item.onClick();
                setIsOpen(false);
              }}
              className={`
                flex w-full items-center gap-2.5 px-3 py-2 text-left text-body transition-colors
                ${item.variant === "danger" ? "text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10" : "text-ink-secondary dark:text-white/60 hover:bg-surface-tertiary dark:hover:bg-white/[0.06]"}
              `.trim()}
              role="menuitem"
            >
              {item.icon && <span className="h-4 w-4">{item.icon}</span>}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
