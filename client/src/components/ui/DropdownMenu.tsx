import { useState, useRef, useEffect, useCallback, type ReactNode } from "react";

interface DropdownItem {
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  variant?: "default" | "danger";
  disabled?: boolean;
}

interface DropdownMenuProps {
  trigger: ReactNode;
  items: DropdownItem[];
  align?: "left" | "right";
}

/**
 * Canonical dropdown menu: role="menu" with keyboard navigation
 * (ArrowUp/ArrowDown/Home/End to move, Enter/Space to select, Escape to close).
 */
export function DropdownMenu({ trigger, items, align = "right" }: DropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const closeMenu = useCallback(() => {
    setIsOpen(false);
    setActiveIndex(-1);
  }, []);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        closeMenu();
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen, closeMenu]);

  // Focus the highlighted item whenever activeIndex changes
  useEffect(() => {
    if (isOpen && activeIndex >= 0) {
      itemRefs.current[activeIndex]?.focus();
    }
  }, [isOpen, activeIndex]);

  const openMenu = () => {
    setIsOpen(true);
    setActiveIndex(0);
  };

  const handleTriggerKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openMenu();
    } else if (e.key === "Escape") {
      closeMenu();
    }
  };

  const handleMenuKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % items.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i - 1 + items.length) % items.length);
    } else if (e.key === "Home") {
      e.preventDefault();
      setActiveIndex(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setActiveIndex(items.length - 1);
    } else if (e.key === "Escape") {
      e.preventDefault();
      closeMenu();
      triggerRef.current?.focus();
    }
  };

  return (
    <div ref={dropdownRef} className="relative inline-block">
      <button
        ref={triggerRef}
        onClick={() => (isOpen ? closeMenu() : openMenu())}
        onKeyDown={handleTriggerKeyDown}
        className="rounded-lg p-1.5 text-ink-tertiary dark:text-white/40 transition-colors hover:bg-surface-tertiary dark:hover:bg-white/[0.06] hover:text-ink-secondary dark:hover:text-white/70"
        aria-haspopup="menu"
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
          onKeyDown={handleMenuKeyDown}
        >
          {items.map((item, i) => (
            <button
              key={i}
              ref={(el) => { itemRefs.current[i] = el; }}
              onClick={() => {
                item.onClick();
                closeMenu();
                triggerRef.current?.focus();
              }}
              onMouseEnter={() => setActiveIndex(i)}
              disabled={item.disabled}
              className={`
                flex w-full items-center gap-2.5 px-3 py-2 text-left text-body transition-colors
                ${item.disabled ? "opacity-50 cursor-not-allowed" : ""}
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
