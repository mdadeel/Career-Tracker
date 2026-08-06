import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/ui";
import { useSEO } from "../hooks/useSEO";
import { Navigation } from "../components/Navigation";
import { MagnifyingGlass, ArrowLeft, House, SquaresFour, Calendar, FileText } from "@phosphor-icons/react";

const HELPFUL_LINKS = [
  { to: "/applications", label: "Applications Hub", icon: <SquaresFour size={16} /> },
  { to: "/calendar", label: "Interview Calendar", icon: <Calendar size={16} /> },
  { to: "/resumes", label: "Resumes", icon: <FileText size={16} /> },
];

export function NotFoundPage() {
  const seo = useSEO();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(query.trim() ? `/applications?search=${encodeURIComponent(query.trim())}` : "/");
  };

  return (
    <div className="flex min-h-screen flex-col bg-surface-secondary dark:bg-dark">
      {seo}
      <Navigation />
      <main id="main-content" className="flex flex-1 items-center justify-center px-4 py-16">
        <div className="w-full max-w-lg text-center">
          {/* Illustration */}
          <div className="relative mx-auto mb-8 flex h-40 w-40 items-center justify-center">
            <div className="absolute inset-0 rounded-2xl bg-brand-50 dark:bg-brand-500/10 rotate-3" />
            <div className="absolute inset-0 rounded-2xl bg-slate-100 dark:bg-white/[0.06] -rotate-3" />
            <p className="relative font-mono text-6xl font-extrabold tracking-tight text-brand-600 dark:text-brand-400">
              404
            </p>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-ink dark:text-white/90">
            Page not found
          </h1>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-ink-secondary dark:text-white/50">
            The page you're looking for doesn't exist, has been moved, or requires
            sign in. Try searching your applications instead.
          </p>

          {/* Search */}
          <form onSubmit={handleSearch} role="search" className="mx-auto mt-6 max-w-sm">
            <label htmlFor="notfound-search" className="sr-only">
              Search your applications
            </label>
            <div className="relative">
              <MagnifyingGlass
                size={18}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-tertiary dark:text-white/40"
              />
              <input
                id="notfound-search"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search applications…"
                className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-ink placeholder:text-ink-tertiary focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 dark:border-dark-border dark:bg-dark-surface dark:text-white/90 dark:placeholder:text-white/30"
              />
            </div>
          </form>

          {/* Actions */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Button icon={<ArrowLeft size={14} />} onClick={() => navigate(-1)}>
              Go Back
            </Button>
            <Link to="/">
              <Button variant="secondary" icon={<House size={14} />}>
                Home
              </Button>
            </Link>
          </div>

          {/* Helpful links */}
          <div className="mt-8 border-t border-slate-200 pt-6 dark:border-dark-border">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-tertiary dark:text-white/40">
              Helpful places
            </p>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
              {HELPFUL_LINKS.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-ink-secondary transition-colors hover:border-brand-500/50 hover:text-brand-600 dark:border-dark-border dark:bg-dark-surface dark:text-white/60 dark:hover:text-brand-400"
                >
                  {link.icon}
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
