import { useState, useEffect, useRef, useCallback } from "react";

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
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zm0 9.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zm0 9.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
      </svg>
    ),
    onSelect: () => {},
    shortcut: "g d",
  },
  {
    id: "pipeline",
    label: "Go to Pipeline",
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-3 2.148 2.148A12.061 12.061 0 0116.5 7.605" />
      </svg>
    ),
    onSelect: () => {},
  },
  {
    id: "applications",
    label: "Go to Applications",
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
      </svg>
    ),
    onSelect: () => {},
    shortcut: "g a",
  },
  {
    id: "analytics",
    label: "Go to Analytics",
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
    onSelect: () => {},
  },
  {
    id: "calendar",
    label: "Go to Calendar",
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
      </svg>
    ),
    onSelect: () => {},
  },
  {
    id: "settings",
    label: "Go to Settings",
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    onSelect: () => {},
  },
  {
    id: "add-application",
    label: "Add Application",
    description: "Create a new job application",
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
      </svg>
    ),
    onSelect: () => {},
    shortcut: "n",
  },
];

const QUICK_ACTIONS: Action[] = [
  {
    id: "new-application",
    label: "New Application",
    description: "Add a job application",
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
      </svg>
    ),
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

  // Build actions with real handlers
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

  // Filtered results
  const allActions = [...navActions, ...quickActions];
  const filtered = query
    ? allActions.filter(
        (a) =>
          a.label.toLowerCase().includes(query.toLowerCase()) ||
          a.description?.toLowerCase().includes(query.toLowerCase())
      )
    : allActions;

  // Application matches
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

  // Auto-focus input
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Keyboard navigation
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
        {/* Search input */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-dark-border px-4 py-3">
          <svg className="h-4 w-4 shrink-0 text-ink-tertiary dark:text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
            placeholder="Search pages, actions, applications..."
            className="flex-1 bg-transparent text-sm text-ink dark:text-white/80 placeholder:text-ink-tertiary dark:placeholder:text-white/30 focus:outline-none"
          />
          <kbd className="hidden sm:inline-flex items-center rounded border border-slate-300 dark:border-dark-border px-1.5 py-0.5 text-[10px] font-medium text-ink-tertiary dark:text-white/40">
            ESC
          </kbd>
        </div>

        {/* Results */}
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
                  <kbd className="shrink-0 hidden sm:inline-flex items-center rounded border border-slate-200 dark:border-dark-border px-1.5 py-0.5 text-[10px] font-medium text-ink-tertiary dark:text-white/40">
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
