import { useState, useEffect, useRef, useCallback } from "react";
import {
  SquaresFour, StackSimple, ChartBar, Calendar, Gear, Plus, MagnifyingGlass,
} from "@phosphor-icons/react";

interface Action {
  id: string;
  label: string;
  description?: string;
  icon: React.ReactNode;
  onSelect: () => void;
  shortcut?: string;
}

const NAV_ACTIONS: Action[] = [
  {
    id: "dashboard",
    label: "Go to Dashboard",
    icon: <SquaresFour size={16} />,
    onSelect: () => {},
    shortcut: "g d",
  },
  {
    id: "pipeline",
    label: "Go to Pipeline",
    icon: <StackSimple size={16} />,
    onSelect: () => {},
  },
  {
    id: "applications",
    label: "Go to Applications",
    icon: <StackSimple size={16} />,
    onSelect: () => {},
    shortcut: "g a",
  },
  {
    id: "analytics",
    label: "Go to Analytics",
    icon: <ChartBar size={16} />,
    onSelect: () => {},
  },
  {
    id: "calendar",
    label: "Go to Calendar",
    icon: <Calendar size={16} />,
    onSelect: () => {},
  },
  {
    id: "settings",
    label: "Go to Settings",
    icon: <Gear size={16} />,
    onSelect: () => {},
  },
  {
    id: "add-application",
    label: "Add Application",
    description: "Create a new job application",
    icon: <Plus size={16} />,
    onSelect: () => {},
    shortcut: "n",
  },
];

const QUICK_ACTIONS: Action[] = [
  {
    id: "new-application",
    label: "New Application",
    description: "Add a job application",
    icon: <Plus size={16} />,
    onSelect: () => {},
  },
];

interface CommandPaletteProps {
  applications: { id: string; companyName: string; jobTitle: string }[];
  onClose: () => void;
  onNavigate: (path: string) => void;
  onAddApplication: () => void;
}

export function CommandPalette({ applications, onClose, onNavigate, onAddApplication }: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const navActions = NAV_ACTIONS.map((a) => ({
    ...a,
    onSelect: () => {
      if (a.id === "add-application") {
        onAddApplication();
      } else {
        onNavigate(`/${a.id === "dashboard" ? "dashboard" : a.id}`);
      }
    },
  }));

  const quickActions = QUICK_ACTIONS.map((a) => ({
    ...a,
    onSelect: () => onAddApplication(),
  }));

  const allActions = [...navActions, ...quickActions];
  const filtered = query
    ? allActions.filter(
        (a) =>
          a.label.toLowerCase().includes(query.toLowerCase()) ||
          a.description?.toLowerCase().includes(query.toLowerCase())
      )
    : allActions;

  const matchedApps = query
    ? applications.filter(
        (app) =>
          app.companyName.toLowerCase().includes(query.toLowerCase()) ||
          app.jobTitle.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  const results = [
    ...matchedApps.map((app) => ({
      id: `app-${app.id}`,
      label: app.jobTitle,
      description: app.companyName,
      icon: (
        <div className="flex h-4 w-4 items-center justify-center rounded bg-brand-500/20 text-[8px] font-bold text-brand-400">
          {app.companyName.charAt(0)}
        </div>
      ),
      onSelect: () => onNavigate(`/applications`),
    })),
    ...filtered,
  ];

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter" && results[selectedIndex]) {
        e.preventDefault();
        results[selectedIndex].onSelect();
        onClose();
      } else if (e.key === "Escape") {
        onClose();
      }
    },
    [results, selectedIndex, onClose]
  );

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center pt-[15vh]">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative w-full max-w-lg animate-scale-in rounded-2xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface shadow-dialog overflow-hidden"
        onKeyDown={handleKeyDown}
      >
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-dark-border px-4 py-3">
          <MagnifyingGlass size={16} className="shrink-0 text-ink-tertiary dark:text-white/30" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
            placeholder="Search pages, actions, applications..."
            className="flex-1 bg-transparent text-sm text-ink dark:text-white/80 placeholder:text-ink-tertiary dark:placeholder:text-white/30 focus:outline-none"
          />
          <kbd className="hidden sm:inline-flex items-center rounded border border-slate-300 dark:border-dark-border px-1.5 py-0.5 text-xs font-medium text-ink-tertiary dark:text-white/40">
            ESC
          </kbd>
        </div>

        <div className="max-h-72 overflow-y-auto py-1" role="listbox">
          {results.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <p className="text-xs text-ink-tertiary dark:text-white/40">No results for "{query}"</p>
            </div>
          ) : (
            results.map((item, i) => (
              <button
                key={item.id}
                role="option"
                aria-selected={i === selectedIndex}
                onClick={() => { item.onSelect(); onClose(); }}
                onMouseEnter={() => setSelectedIndex(i)}
                className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                  i === selectedIndex
                    ? "bg-brand-50 dark:bg-brand-500/10"
                    : "hover:bg-surface-secondary dark:hover:bg-white/[0.03]"
                }`}
              >
                <span className="shrink-0 text-ink-tertiary dark:text-white/40">{item.icon}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-ink dark:text-white/85 truncate">{item.label}</p>
                  {item.description && (
                    <p className="text-xs text-ink-tertiary dark:text-white/40 truncate">{item.description}</p>
                  )}
                </div>
                {"shortcut" in item && item.shortcut && (
                  <kbd className="shrink-0 hidden sm:inline-flex items-center rounded border border-slate-200 dark:border-dark-border px-1.5 py-0.5 text-xs font-medium text-ink-tertiary dark:text-white/40">
                    {item.shortcut}
                  </kbd>
                )}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
