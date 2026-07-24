import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { List, X, SquaresFour } from "@phosphor-icons/react";
import { Button, LogoFull } from "../components/ui";
import { useAuth } from "../context/AuthContext";

const NAV_HEIGHT = 56;

const navLinks = [
  { href: "/#how-it-works", label: "How It Works" },
  { href: "/#sandbox", label: "Live Demo" },
  { href: "/#stats", label: "Stats" },
  { href: "/#faq", label: "Help" },
];

/** Scroll to the element matching the current URL hash, offset for the fixed navbar. */
function scrollToHash() {
  const hash = window.location.hash;
  if (!hash) return;
  const id = hash.replace("#", "");
  const el = document.getElementById(id);
  if (el) {
    const top = el.getBoundingClientRect().top + window.scrollY - NAV_HEIGHT;
    window.scrollTo({ top, behavior: "smooth" });
  }
}

export function Navigation() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const isLoggedIn = !!user;
  const location = useLocation();

  // Scroll to hash on mount and whenever the hash changes
  useEffect(() => {
    scrollToHash();
  }, [location.hash]);

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    setOpen(false);
    const hash = href.split("#")[1];
    if (!hash) return;
    // If we're already on the landing page, just scroll without full navigation
    if (location.pathname === "/") {
      e.preventDefault();
      window.history.pushState(null, "", href);
      const el = document.getElementById(hash);
      if (el) {
        const top = el.getBoundingClientRect().top + window.scrollY - NAV_HEIGHT;
        window.scrollTo({ top, behavior: "smooth" });
      }
    }
  };

  return (
    <header className="fixed top-0 z-50 w-full border-b border-slate-200/80 bg-white/90 dark:border-dark-border dark:bg-dark/85 backdrop-blur-md">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3.5 lg:px-8">
        <Link to="/" className="flex items-center">
          <LogoFull size={28} showSubtitle />
        </Link>

        <div className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-8 md:flex">
          {navLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={(e) => handleNavClick(e, l.href)}
              className="text-sm font-medium text-ink-secondary transition-colors hover:text-ink dark:text-white/60 dark:hover:text-white"
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {isLoggedIn ? (
            <Link to="/dashboard">
              <Button size="sm" icon={<SquaresFour size={14} />}>
                Dashboard
              </Button>
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-lg px-3.5 py-1.5 text-sm font-medium text-ink-secondary transition-colors hover:bg-surface-tertiary dark:text-white/70 dark:hover:bg-white/5"
              >
                Sign in
              </Link>
              <Link to="/register">
                <Button size="sm">Get Started Free</Button>
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          className="text-ink dark:text-white/80 md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X size={22} /> : <List size={22} />}
        </button>
      </nav>

      {open && (
        <div className="animate-fade-in border-t border-slate-200 bg-white px-5 py-4 md:hidden dark:border-dark-border dark:bg-dark">
          <div className="flex flex-col gap-1">
            {navLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={(e) => {
                  setOpen(false);
                  handleNavClick(e, l.href);
                }}
                className="rounded-lg px-3 py-2 text-sm text-ink-secondary transition-colors hover:bg-surface-tertiary dark:text-white/60 dark:hover:bg-white/5"
              >
                {l.label}
              </a>
            ))}
            <div className="mt-2 flex flex-col gap-2 border-t border-slate-200 pt-3 dark:border-dark-border">
              {isLoggedIn ? (
                <Link to="/dashboard" onClick={() => setOpen(false)}>
                  <Button size="sm" className="w-full justify-center" icon={<SquaresFour size={14} />}>
                    Dashboard
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/login" onClick={() => setOpen(false)}>
                    <Button variant="ghost" size="sm" className="w-full justify-center">
                      Sign in
                    </Button>
                  </Link>
                  <Link to="/register" onClick={() => setOpen(false)}>
                    <Button size="sm" className="w-full justify-center">
                      Get Started Free
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
