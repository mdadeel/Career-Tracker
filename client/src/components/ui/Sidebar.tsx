import { useState, useRef, useEffect, type ReactNode } from "react";
import { Link, useLocation, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../hooks/useTheme";
import { useKeyboardShortcuts } from "../../hooks/useKeyboardShortcuts";
import { ErrorBoundary } from "../ErrorBoundary";
import { CommandPalette } from "../CommandPalette";
import { Logo, LogoFull } from "./Logo";


interface NavItem {
  path: string;
  label: string;
  icon: ReactNode;
  comingSoon?: boolean;
}

const primaryNav: NavItem[] = [
  {
    path: "/dashboard",
    label: "Dashboard",
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zm0 9.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zm0 9.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
      </svg>
    ),
  },
  {
    path: "/pipeline",
    label: "Pipeline",
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-3 2.148 2.148A12.061 12.061 0 0116.5 7.605" />
      </svg>
    ),
  },
  {
    path: "/applications",
    label: "Applications",
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
      </svg>
    ),
  },
  {
    path: "/analytics",
    label: "Analytics",
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
  },
  {
    path: "/calendar",
    label: "Calendar",
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
      </svg>
    ),
  },
];

export function SidebarLayout() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // ── Global keyboard shortcuts ──
  useKeyboardShortcuts([
    {
      keys: ["g", "d"],
      handler: () => navigate("/dashboard"),
    },
    {
      keys: ["g", "a"],
      handler: () => navigate("/applications"),
    },
    {
      keys: ["ctrl", "k"],
      handler: () => setIsCommandPaletteOpen(true),
    },
    {
      keys: ["meta", "k"],
      handler: () => setIsCommandPaletteOpen(true),
    },
  ]);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close user menu on click outside
  useEffect(() => {
    if (!showUserMenu) return;
    const handleClick = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showUserMenu]);

  return (
    <div className="flex min-h-screen bg-surface-secondary dark:bg-dark">
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex flex-col bg-[#0b1120] transition-all duration-200
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          ${collapsed ? "w-14" : "w-56"}
        `.trim()}
      >
        {/* Header: Logo + collapse */}
        <div className={`flex h-12 items-center border-b border-white/[0.06] ${collapsed ? "justify-center px-0" : "px-3"}`}>
          <Link to="/dashboard" className={`flex items-center gap-2 ${collapsed ? "justify-center" : ""}`}>
            {collapsed ? (
              <Logo size={24} />
            ) : (
              <LogoFull size={24} textClassName="text-white/85" />
            )}
          </Link>
          {!collapsed && (
            <button
              onClick={() => setCollapsed(true)}
              className="ml-auto rounded-md p-1 text-white/40 hover:text-white/70 hover:bg-white/[0.06] transition-all"
              title="Collapse sidebar"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18.75 19.5l-7.5-7.5 7.5-7.5m-6 15L5.25 12l7.5-7.5" />
              </svg>
            </button>
          )}
        </div>

        {/* Primary nav */}
        <div className="flex-1 overflow-y-auto px-2 py-3">
          <div className="space-y-0.5">
            {primaryNav.map((item) => {
              const isActive = location.pathname.startsWith(item.path);
              const classes = `
                flex items-center gap-2.5 rounded-md px-2.5 py-2 text-xs font-medium transition-all duration-150
                ${isActive && !item.comingSoon
                  ? "bg-brand-500/10 text-brand-400"
                  : item.comingSoon
                    ? "text-white/40 cursor-default"
                    : "text-white/60 hover:text-white/85 hover:bg-white/[0.05]"
                }
                ${collapsed ? "justify-center px-0" : ""}
              `.trim();
              const inner = (
                <>
                  <span className="shrink-0">{item.icon}</span>
                  {!collapsed && (
                    <>
                      <span className="flex-1">{item.label}</span>
                      {item.comingSoon && (
                        <span className="rounded border border-white/[0.07] px-1.5 py-[1px] text-[9px] font-medium text-white/35">
                          Soon
                        </span>
                      )}
                    </>
                  )}
                </>
              );
              return item.comingSoon ? (
                <div key={item.path} className={classes} title={collapsed ? item.label : undefined}>
                  {inner}
                </div>
              ) : (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileOpen(false)}
                  className={classes}
                  title={collapsed ? item.label : undefined}
                >
                  {inner}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Expand button when collapsed */}
        {collapsed && (
          <button
            onClick={() => setCollapsed(false)}
            className="flex items-center justify-center h-8 mx-2 mb-1 rounded-md text-white/40 hover:text-white/70 hover:bg-white/[0.05] transition-all"
            title="Expand sidebar"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 4.5l7.5 7.5-7.5 7.5m6-15l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        )}

        {/* User section with dropdown */}
        <div ref={userMenuRef} className="relative border-t border-white/[0.06]">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className={`
              flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-xs font-medium text-white/60
              transition-colors hover:bg-white/[0.05] hover:text-white/85
              ${collapsed ? "justify-center" : ""}
            `.trim()}
          >
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-500/20 text-[10px] font-semibold text-brand-400">
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            {!collapsed && (
              <>
                <div className="flex-1 text-left min-w-0">
                  <p className="truncate text-xs font-medium text-white/85">{user?.name}</p>
                </div>
                <svg className={`h-3 w-3 text-white/50 transition-transform duration-150 ${showUserMenu ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </>
            )}
          </button>

          {/* Dropdown menu */}
          {showUserMenu && (
            <div
              className={`
                absolute bottom-full left-2 right-2 mb-1 rounded-xl border border-white/[0.08] bg-[#161b2e] py-1 shadow-xl
                ${collapsed ? "left-1 right-1" : ""}
              `.trim()}
            >
              {/* User info header */}
              <div className="border-b border-white/[0.06] px-3 py-2.5">
                <p className="text-xs font-medium text-white/85">{user?.name}</p>
                <p className="mt-0.5 text-[10px] text-white/40">{user?.email}</p>
              </div>

              {/* Saved Jobs */}
              <Link
                to="/saved-jobs"
                className="flex w-full items-center gap-2.5 px-3 py-2 text-xs text-white/60 transition-colors hover:bg-white/[0.05] hover:text-white/85"
                onClick={() => setShowUserMenu(false)}
              >
                <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
                </svg>
                Saved Jobs
              </Link>

              {/* Settings */}
              <Link
                to="/settings"
                className="flex w-full items-center gap-2.5 px-3 py-2 text-xs text-white/60 transition-colors hover:bg-white/[0.05] hover:text-white/85"
                onClick={() => setShowUserMenu(false)}
              >
                <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Settings
              </Link>

              {/* Dark Mode */}
              <button
                onClick={() => { toggleTheme(); setShowUserMenu(false); }}
                className="flex w-full items-center gap-2.5 px-3 py-2 text-xs text-white/60 transition-colors hover:bg-white/[0.05] hover:text-white/85"
              >
                {theme === "dark" ? (
                  <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                  </svg>
                ) : (
                  <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                  </svg>
                )}
                {theme === "dark" ? "Light Mode" : "Dark Mode"}
              </button>

              <div className="border-t border-white/[0.06]" />

              {/* Sign Out */}
              <button
                onClick={() => { setShowUserMenu(false); logout(); }}
                className="flex w-full items-center gap-2.5 px-3 py-2 text-xs text-white/60 transition-colors hover:bg-white/[0.05] hover:text-rose-400"
              >
                <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                </svg>
                Sign out
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main content */}
      <div className={`flex min-w-0 flex-1 flex-col transition-all duration-200 ${collapsed ? "md:ml-14" : "md:ml-56"}`}>
        {/* Mobile top bar */}
        <header className="sticky top-0 z-30 flex h-12 items-center gap-2 border-b border-slate-200 bg-white/90 backdrop-blur-md px-3 dark:border-dark-border dark:bg-dark/90 md:hidden">
          <button
            onClick={() => setIsMobileOpen(true)}
            className="rounded-md p-1.5 text-ink-secondary hover:bg-surface-tertiary dark:text-white/60 dark:hover:bg-dark-hover"
            aria-label="Open menu"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
          <div className="flex items-center gap-1.5">
            <span className="flex h-5 w-5 items-center justify-center rounded bg-brand-500 text-[8px] font-bold text-white">CT</span>
            <span className="text-xs font-semibold text-ink dark:text-white/85">CareerTrack</span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1">
          <ErrorBoundary>
            <div className="px-3 lg:px-4">
              <Outlet />
            </div>
          </ErrorBoundary>
        </main>
      </div>

      {/* Command Palette */}
      {isCommandPaletteOpen && (
        <CommandPalette
          applications={[]}
          onClose={() => setIsCommandPaletteOpen(false)}
          onNavigate={(path) => { setIsCommandPaletteOpen(false); navigate(path); }}
          onAddApplication={() => { setIsCommandPaletteOpen(false); navigate("/applications/new"); }}
        />
      )}
    </div>
  );
}
