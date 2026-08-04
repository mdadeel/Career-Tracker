import { useState, type ReactNode } from "react";
import { CaretDown } from "@phosphor-icons/react";

interface AccordionItem {
  /** Stable id for the item. */
  id: string;
  /** The disclosure trigger (the FAQ question). */
  trigger: ReactNode;
  /** The revealed content. */
  children: ReactNode;
}

interface AccordionProps {
  items: AccordionItem[];
  /** Allow one open at a time ("single") or several ("multiple"). */
  type?: "single" | "multiple";
  /** Ids of items open initially. */
  defaultOpen?: string[];
  className?: string;
}

/**
 * Accordion (Disclosure).
 *
 * A vertical stack of triggers that disclose content in place, with the
 * panel animated via grid-template-rows 0fr -> 1fr and the chevron turning
 * when the row opens. "single" collapses siblings; "multiple" keeps several
 * open. Per the pattern:
 * https://namethatui.com/web/accordion
 */
export function Accordion({ items, type = "single", defaultOpen = type === "single" ? [items[0]?.id].filter(Boolean) : [], className = "" }: AccordionProps) {
  const [openIds, setOpenIds] = useState<string[]>(defaultOpen);

  const toggle = (id: string) => {
    setOpenIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (type === "single") return [id];
      return [...prev, id];
    });
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {items.map((item) => {
        const isOpen = openIds.includes(item.id);
        return (
          <div
            key={item.id}
            className={`overflow-hidden rounded-xl border bg-surface-secondary/50 dark:bg-dark transition-colors duration-200 ${
              isOpen
                ? "border-slate-300/80 dark:border-white/15"
                : "border-slate-200/90 dark:border-dark-border hover:border-slate-300 dark:hover:border-white/10"
            }`}
          >
            <h3>
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={`accordion-panel-${item.id}`}
                onClick={() => toggle(item.id)}
                className="flex w-full items-center justify-between gap-4 p-5 text-left text-sm font-bold text-ink dark:text-white/90 transition-colors hover:text-brand-700 dark:hover:text-brand-300"
              >
                <span>{item.trigger}</span>
                <CaretDown
                  size={18}
                  weight="bold"
                  className={`shrink-0 text-brand-500 transition-transform duration-300 ease-out ${isOpen ? "rotate-180" : ""}`}
                />
              </button>
            </h3>
            {/* Animated panel: grid-template-rows 0fr -> 1fr keeps height smooth */}
            <div
              id={`accordion-panel-${item.id}`}
              role="region"
              className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${
                isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden">
                <div className="border-t border-slate-200/60 px-5 pb-5 pt-3 text-sm leading-relaxed text-ink-secondary dark:border-white/5 dark:text-white/60">
                  {item.children}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
