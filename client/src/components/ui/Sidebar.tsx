import { useState, useRef, useEffect, Suspense, type ReactNode } from "react";
import { Link, useLocation, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../hooks/useTheme";
import { useApplications } from "../../hooks/useApplications";
import { ErrorBoundary } from "../ErrorBoundary";
import { CommandPalette } from "../CommandPalette";
import { LogoFull } from "./Logo";
import { SparkleIcon } from "./SparkleIcon";
import {
  SquaresFour, StackSimple, ChartBar, Calendar, FileText,
  Gear, SignOut, Sun, Moon, CaretDown, List,
} from "@phosphor-icons/react";


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
    icon: <SquaresFour size={16} />,
  },
  {
    path: "/applications",
    label: "Applications Hub",
    icon: <StackSimple size={16} />,
  },
  {
    path: "/analytics",
    label: "Analytics",
    icon: <ChartBar size={16} />,
  },
  {
    path: "/calendar",
    label: "Calendar",
    icon: <Calendar size={16} />,
  },
  {
    path: "/resumes",
    label: "Resumes",
    icon: <FileText size={16} />,
  },
  {
    path: "/settings",
    label: "Settings",
    icon: <Gear size={16} />,
  },
];

export function SidebarLayout() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const { applications } = useApplications();
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showAiMenu, setShowAiMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const aiMenuRef = useRef<HTMLDivElement>(null);

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

  // Close AI menu on click outside
  useEffect(() => {
    if (!showAiMenu) return;
    const handleClick = (e: MouseEvent) => {
      if (aiMenuRef.current && !aiMenuRef.current.contains(e.target as Node)) {
        setShowAiMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showAiMenu]);

  const recentAppsForAi = applications.slice(0, 5);

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
        className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-[#0b1120] transition-all duration-200 w-48 ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Header: Logo + Theme Toggle Switch */}
        <div className="flex h-12 items-center gap-2 px-3 border-b border-white/[0.06]">
          <Link to="/" className="flex items-center gap-2 flex-1 min-w-0">
            <LogoFull size={24} textClassName="text-white/85" />
          </Link>
          <button
            onClick={toggleTheme}
            className="relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border border-white/20 bg-white/10 transition-colors duration-200 ease-in-out focus:outline-none hover:bg-white/20"
            role="switch"
            aria-checked={theme === "dark"}
            aria-label="Toggle dark mode"
            title={theme === "dark" ? "Switch to Light mode" : "Switch to Dark mode"}
          >
            <span
              className={`pointer-events-none inline-flex h-3.5 w-3.5 items-center justify-center rounded-full bg-white shadow-sm ring-0 transition-transform duration-200 ${
                theme === "dark" ? "translate-x-[18px]" : "translate-x-[2px]"
              }`}
            >
              {theme === "dark" ? (
                <Sun size={9} className="text-amber-500" />
              ) : (
                <Moon size={9} className="text-slate-700" />
              )}
            </span>
          </button>
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
              `.trim();
              return item.comingSoon ? (
                <div key={item.path} className={classes}>
                  <span className="shrink-0">{item.icon}</span>
                  <span className="flex-1">{item.label}</span>
                  <span className="rounded border border-white/[0.07] px-1.5 py-[1px] text-[9px] font-medium text-white/35">
                    Soon
                  </span>
                </div>
              ) : (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileOpen(false)}
                  className={classes}
                >
                  <span className="shrink-0">{item.icon}</span>
                  <span className="flex-1">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* User section with dropdown */}
        <div ref={userMenuRef} className="relative border-t border-white/[0.06]">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-xs font-medium text-white/60 transition-colors hover:bg-white/[0.05] hover:text-white/85"
          >
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-500/20 text-xs font-semibold text-brand-400">
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className="truncate text-xs font-medium text-white/85">{user?.name}</p>
            </div>
            <CaretDown size={12} className={`text-white/50 transition-transform duration-150 ${showUserMenu ? "rotate-180" : ""}`} />
          </button>

          {/* Dropdown menu */}
          {showUserMenu && (
            <div className="absolute bottom-full left-2 right-2 mb-1 rounded-xl border border-white/[0.08] bg-[#161b2e] py-1 shadow-xl">
              <div className="border-b border-white/[0.06] px-3 py-2.5">
                <p className="text-xs font-medium text-white/85">{user?.name}</p>
                <p className="mt-0.5 text-xs text-white/40">{user?.email}</p>
              </div>

              <button
                onClick={() => { setShowUserMenu(false); logout(); }}
                className="flex w-full items-center gap-2.5 px-3 py-2 text-xs text-white/60 transition-colors hover:bg-white/[0.05] hover:text-rose-400"
              >
                <SignOut size={16} />
                Sign out
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main content */}
      <div className="flex min-w-0 flex-1 flex-col transition-all duration-200 md:ml-48">
        {/* Mobile top bar */}
        <header className="sticky top-0 z-30 flex h-12 items-center gap-2 border-b border-slate-200 bg-white/90 backdrop-blur-md px-3 dark:border-dark-border dark:bg-dark/90 md:hidden">
          <button
            onClick={() => setIsMobileOpen(true)}
            className="rounded-md p-1.5 text-ink-secondary hover:bg-surface-tertiary dark:text-white/60 dark:hover:bg-dark-hover"
            aria-label="Open menu"
          >
            <List size={16} />
          </button>
          <div className="flex items-center gap-1.5">
            <span className="flex h-5 w-5 items-center justify-center rounded bg-brand-500 text-[8px] font-bold text-white">CT</span>
            <span className="text-xs font-semibold text-ink dark:text-white/85">CareerTrack</span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1">
          <ErrorBoundary>
            <div className="px-3 py-5 lg:px-4 lg:py-6">
              <Suspense fallback={
                <div className="flex min-h-[50vh] items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
                </div>
              }>
                <Outlet />
              </Suspense>
            </div>
          </ErrorBoundary>
        </main>

        {/* AI Copilot floating button + popup */}
        <div ref={aiMenuRef} className="fixed bottom-6 right-6 z-40">
          <button
            onClick={() => setShowAiMenu(!showAiMenu)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-brand-600 text-white shadow-lg shadow-indigo-500/20 transition-all duration-200 hover:scale-110 hover:shadow-xl hover:shadow-indigo-500/30 active:scale-95"
            title="AI Copilot"
          >
            <SparkleIcon className="h-[18px] w-[18px] text-white" />
          </button>
          {showAiMenu && (
            <div className="absolute bottom-full right-0 mb-3 w-64 rounded-xl border border-white/[0.08] bg-[#161b2e] py-1.5 shadow-xl overflow-hidden">
              <div className="px-3 py-2 border-b border-white/[0.06]">
                <p className="text-xs font-semibold text-white/85">AI Copilot</p>
                <p className="text-[10px] text-white/40">Select an application</p>
              </div>
              {recentAppsForAi.length > 0 ? (
                <div className="max-h-60 overflow-y-auto">
                  {recentAppsForAi.map((app) => (
                    <button
                      key={app.id}
                      onClick={() => { setShowAiMenu(false); navigate(`/applications/${app.id}/copilot`); }}
                      className="flex w-full items-center gap-2.5 px-3 py-2 text-left transition-colors hover:bg-white/[0.05]"
                    >
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-indigo-500/20 text-[10px] font-bold text-indigo-400">
                        {app.companyName.charAt(0)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-medium text-white/80">{app.jobTitle}</p>
                        <p className="truncate text-[10px] text-white/40">{app.companyName}</p>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="px-3 py-4 text-center">
                  <p className="text-xs text-white/50">No applications yet</p>
                  <button
                    onClick={() => { setShowAiMenu(false); navigate("/applications/new"); }}
                    className="mt-2 text-[11px] font-semibold text-indigo-400 hover:text-indigo-300"
                  >
                    Add your first application
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
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
