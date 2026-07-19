import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui";

// TODO: Replace with your real details (spec §8 / §20 requires full name + student ID).
const SITE_OWNER = {
  name: "Your Full Name",
  studentId: "Your Student ID",
};

function IconArrowRight({ className = "", size = 16 }: { className?: string; size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

function IconMenu({ className = "", size = 24 }: { className?: string; size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <line x1="4" x2="20" y1="12" y2="12" />
      <line x1="4" x2="20" y1="6" y2="6" />
      <line x1="4" x2="20" y1="18" y2="18" />
    </svg>
  );
}

function IconClose({ className = "", size = 24 }: { className?: string; size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

/**
 * Animated drifting gradient background (21st.dev "Animated Gradient Background"
 * technique, reimplemented dependency-free). Brand-tinted blobs drift behind
 * the hero using the tailwind `blob` keyframes.
 */
function AnimatedGradientBackground({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden="true" className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      <div className="absolute -left-24 -top-24 h-[28rem] w-[28rem] rounded-full bg-brand-400/30 blur-3xl animate-blob dark:bg-brand-500/20" />
      <div className="absolute right-[-10%] top-10 h-[24rem] w-[24rem] rounded-full bg-purple-400/25 blur-3xl animate-blob-slow dark:bg-purple-500/15" />
      <div className="absolute bottom-[-20%] left-1/3 h-[26rem] w-[26rem] rounded-full bg-emerald-400/20 blur-3xl animate-blob dark:bg-emerald-500/10" />
    </div>
  );
}

/**
 * Cursor-following radial spotlight (21st.dev "Spotlight Background" technique):
 * a soft circle tracks the pointer and gently breathes when idle.
 */
function SpotlightBackground({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 ${className}`}
      onMouseMove={(e) => {
        const el = e.currentTarget;
        const r = el.getBoundingClientRect();
        el.style.setProperty("--x", `${e.clientX - r.left}px`);
        el.style.setProperty("--y", `${e.clientY - r.top}px`);
      }}
      style={{
        background:
          "radial-gradient(380px circle at var(--x, 50%) var(--y, 0%), rgba(99,102,241,0.12), transparent 70%)",
      }}
    />
  );
}

/**
 * Animated gradient headline text (21st.dev "Animated Gradient Text" technique):
 * a wide multi-stop gradient swept via the tailwind `gradient-x` keyframe.
 */
function GradientText({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={`bg-[length:200%_auto] bg-clip-text text-transparent animate-gradient-x ${className}`}
      style={{
        backgroundImage:
          "linear-gradient(90deg, #4f46e5 0%, #6366f1 25%, #8b5cf6 50%, #6366f1 75%, #4f46e5 100%)",
      }}
    >
      {children}
    </span>
  );
}

/**
 * Scroll-triggered reveal (21st.dev scroll-in pattern): fades + lifts children
 * into view once, via IntersectionObserver. Honors prefers-reduced-motion.
 */
function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(true);
      return;
    }
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          obs.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-out motion-reduce:transition-none ${
        shown ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      } ${className}`}
    >
      {children}
    </div>
  );
}

const navLinks = [
  { href: "#features", label: "Features" },
  { href: "#pipeline", label: "Pipeline" },
  { href: "#stats", label: "Why CareerTrack" },
];

function Navigation() {
  const [open, setOpen] = useState(false);
  return (
    <header className="fixed top-0 z-50 w-full border-b border-slate-200/80 bg-white/85 dark:border-dark-border dark:bg-dark/80 backdrop-blur-md">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5 lg:px-8">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-500 text-[11px] font-bold text-white shadow-sm">
            CT
          </span>
          <span className="text-sm font-semibold tracking-tight text-ink dark:text-white/90">
            CareerTrack
          </span>
        </Link>

        <div className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-8 md:flex">
          {navLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm text-ink-secondary transition-colors hover:text-ink dark:text-white/60 dark:hover:text-white"
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <Link
            to="/login"
            className="rounded-lg px-3.5 py-1.5 text-sm font-medium text-ink-secondary transition-colors hover:bg-surface-tertiary dark:text-white/60 dark:hover:bg-white/5"
          >
            Sign in
          </Link>
          <Link to="/register">
            <Button size="sm">Get Started Free</Button>
          </Link>
        </div>

        <button
          type="button"
          className="text-ink dark:text-white/80 md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <IconClose size={22} /> : <IconMenu size={22} />}
        </button>
      </nav>

      {open && (
        <div className="animate-fade-in border-t border-slate-200 bg-white px-5 py-4 md:hidden dark:border-dark-border dark:bg-dark">
          <div className="flex flex-col gap-1">
            {navLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2 text-sm text-ink-secondary transition-colors hover:bg-surface-tertiary dark:text-white/60 dark:hover:bg-white/5"
              >
                {l.label}
              </a>
            ))}
            <div className="mt-2 flex flex-col gap-2 border-t border-slate-200 pt-3 dark:border-dark-border">
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
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden bg-surface-secondary px-5 pb-20 pt-28 dark:bg-dark lg:px-8 lg:pb-28 lg:pt-36">
      <AnimatedGradientBackground />
      <SpotlightBackground />
      <div className="relative mx-auto max-w-3xl text-center">
        <a
          href="#features"
          className="animate-float-up mb-6 inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-caption font-medium text-ink-secondary shadow-sm transition-colors hover:bg-surface-secondary dark:border-dark-border dark:bg-dark-surface dark:text-white/60 dark:hover:bg-white/5"
        >
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
          </span>
          Job search tracker — built for serious applicants
          <IconArrowRight size={12} className="text-brand-500" />
        </a>

        <h1 className="animate-float-up text-balance text-4xl font-bold leading-[1.1] tracking-tight text-ink dark:text-white/90 sm:text-5xl lg:text-6xl [animation-delay:80ms]">
          Track every job application
          <span className="mt-1 block">
            <GradientText>from one dashboard</GradientText>
          </span>
        </h1>

        <p className="mx-auto mt-5 max-w-xl text-balance text-base leading-relaxed text-ink-secondary dark:text-white/50">
          Organize applications, store job links, follow statuses across your pipeline, and see where
          you stand — all in a private, secure workspace.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link to="/register">
            <Button size="lg" icon={<IconArrowRight />}>
              Start Tracking Free
            </Button>
          </Link>
          <Link to="/login">
            <Button variant="secondary" size="lg">
              Sign In
            </Button>
          </Link>
        </div>
      </div>

      {/* Dashboard preview mockup */}
      <div className="relative mx-auto mt-16 max-w-5xl animate-float-up [animation-delay:160ms]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-[-30%] w-[80%] -translate-x-1/2"
        >
          <div className="h-[260px] w-full rounded-full bg-brand-500/30 blur-[90px] dark:bg-brand-500/20" />
        </div>
        <div className="relative overflow-hidden rounded-2xl border border-brand-500/20 bg-white shadow-elevated ring-1 ring-brand-500/10 dark:border-dark-border dark:bg-dark-surface">
          <div className="flex items-center gap-1.5 border-b border-slate-200 px-4 py-3 dark:border-dark-border">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
            <span className="ml-3 text-caption text-ink-tertiary dark:text-white/40">
              CareerTrack — Dashboard
            </span>
          </div>
          <div className="grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Total", value: "24", tone: "text-ink dark:text-white/90" },
              { label: "Applied", value: "11", tone: "text-brand-600 dark:text-brand-400" },
              { label: "Interviews", value: "4", tone: "text-emerald-600 dark:text-emerald-400" },
              { label: "Offers", value: "2", tone: "text-amber-600 dark:text-amber-400" },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-xl border border-slate-200 bg-surface-secondary p-4 dark:border-dark-border dark:bg-dark"
              >
                <p className="text-caption font-semibold uppercase tracking-wide text-ink-tertiary dark:text-white/40">
                  {s.label}
                </p>
                <p className={`mt-1 text-stat font-bold ${s.tone}`}>{s.value}</p>
              </div>
            ))}
          </div>
          <div className="space-y-2 px-5 pb-5">
            {[
              { c: "Acme Corp", t: "Senior Engineer", s: "Interview", badge: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400" },
              { c: "Globex", t: "Frontend Dev", s: "Applied", badge: "bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-400" },
              { c: "Initech", t: "Product Designer", s: "Saved", badge: "bg-slate-100 text-slate-600 dark:bg-white/5 dark:text-white/60" },
            ].map((r) => (
              <div
                key={r.c}
                className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-2.5 dark:border-dark-border dark:bg-dark"
              >
                <div className="min-w-0">
                  <p className="truncate text-body font-medium text-ink dark:text-white/90">{r.c}</p>
                  <p className="truncate text-caption text-ink-tertiary dark:text-white/40">{r.t}</p>
                </div>
                <span className={`rounded-full px-2.5 py-0.5 text-caption font-medium ${r.badge}`}>
                  {r.s}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Features() {
  const items = [
    {
      title: "Track Applications",
      body: "Log every job with company details, links, source, and status — all in one place.",
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      ),
      tint: "bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400",
    },
    {
      title: "Visual Pipeline",
      body: "See progress at a glance with real-time metrics and clear status stages.",
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      ),
      tint: "bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400",
    },
    {
      title: "Private & Secure",
      body: "JWT auth, hashed passwords, and complete user isolation — your data stays yours.",
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
      ),
      tint: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
    },
  ];

  return (
    <section id="features" className="border-t border-slate-200 bg-white py-16 dark:border-dark-border dark:bg-dark-surface lg:py-20">
      <Reveal className="mx-auto max-w-6xl px-5 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="text-lg font-semibold text-ink dark:text-white/90">
            Everything you need to stay organized
          </h2>
          <p className="mt-2 text-sm text-ink-secondary dark:text-white/50">
            Simple tools that make job hunting manageable
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {items.map((f) => (
            <div
              key={f.title}
              className="rounded-xl border border-slate-200 bg-surface-secondary p-5 transition-shadow hover:shadow-card-hover dark:border-dark-border dark:bg-dark"
            >
              <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-lg ${f.tint}`}>
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  {f.icon}
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-ink dark:text-white/90">{f.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-secondary dark:text-white/50">
                {f.body}
              </p>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}

function Pipeline() {
  const stages = [
    { label: "Saved", count: "5", tone: "bg-slate-100 text-slate-600 dark:bg-white/5 dark:text-white/60" },
    { label: "Applied", count: "11", tone: "bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-400" },
    { label: "Assessment", count: "3", tone: "bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-400" },
    { label: "Interview", count: "4", tone: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400" },
    { label: "Rejected", count: "6", tone: "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400" },
    { label: "Offer", count: "2", tone: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400" },
  ];
  return (
    <section id="pipeline" className="border-t border-slate-200 bg-surface-secondary py-16 dark:border-dark-border dark:bg-dark lg:py-20">
      <Reveal className="mx-auto max-w-6xl px-5 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="text-lg font-semibold text-ink dark:text-white/90">
            Follow every stage of your pipeline
          </h2>
          <p className="mt-2 text-sm text-ink-secondary dark:text-white/50">
            From saved to offer — know exactly where each application stands
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {stages.map((s) => (
            <div
              key={s.label}
              className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-5 py-4 dark:border-dark-border dark:bg-dark-surface"
            >
              <span className={`rounded-full px-3 py-1 text-caption font-medium ${s.tone}`}>
                {s.label}
              </span>
              <span className="text-stat font-bold text-ink dark:text-white/90">{s.count}</span>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      n: "01",
      title: "Create your account",
      body: "Register securely with a hashed password and sign in with a JWT session.",
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
      ),
    },
    {
      n: "02",
      title: "Add applications",
      body: "Log each role with company, link, source, date, status, and notes.",
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
      ),
    },
    {
      n: "03",
      title: "Track & filter",
      body: "Watch your pipeline, view stats, and search or filter what matters.",
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      ),
    },
  ];
  return (
    <section className="border-t border-slate-200 bg-white py-16 dark:border-dark-border dark:bg-dark-surface lg:py-20">
      <Reveal className="mx-auto max-w-6xl px-5 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="text-lg font-semibold text-ink dark:text-white/90">
            Up and running in three steps
          </h2>
          <p className="mt-2 text-sm text-ink-secondary dark:text-white/50">
            From sign-up to a clear view of your job hunt
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {steps.map((s) => (
            <div
              key={s.n}
              className="relative rounded-xl border border-slate-200 bg-surface-secondary p-6 dark:border-dark-border dark:bg-dark"
            >
              <span className="text-caption font-bold tracking-widest text-brand-500">
                {s.n}
              </span>
              <div className="mt-3 flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  {s.icon}
                </svg>
              </div>
              <h3 className="mt-4 text-sm font-semibold text-ink dark:text-white/90">
                {s.title}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-secondary dark:text-white/50">
                {s.body}
              </p>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}

function Stats() {
  const items = [
    { value: "100%", label: "Private — your data is isolated" },
    { value: "6", label: "Tracked statuses out of the box" },
    { value: "0", label: "Spreadsheet rows to maintain" },
  ];
  return (
    <section id="stats" className="border-t border-slate-200 bg-white py-16 dark:border-dark-border dark:bg-dark-surface lg:py-20">
      <Reveal className="mx-auto grid max-w-5xl gap-8 px-5 text-center lg:grid-cols-3 lg:px-8">
        {items.map((s) => (
          <div key={s.label}>
            <p className="text-stat-lg font-bold tracking-tight text-brand-600 dark:text-brand-400">
              {s.value}
            </p>
            <p className="mt-1 text-sm text-ink-secondary dark:text-white/50">{s.label}</p>
          </div>
        ))}
      </Reveal>
    </section>
  );
}

function CtaFooter() {
  return (
    <section className="border-t border-slate-200 bg-surface-secondary dark:border-dark-border dark:bg-dark">
      <div className="mx-auto max-w-6xl px-5 py-20 text-center lg:px-8 lg:py-24">
        <h2 className="mx-auto max-w-2xl text-balance text-3xl font-bold tracking-tight text-ink dark:text-white/90 sm:text-4xl">
          Stop losing track of your applications
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-base text-ink-secondary dark:text-white/50">
          Create a free account and add your first application in under a minute.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link to="/register">
            <Button size="lg" icon={<IconArrowRight />}>
              Get Started Free
            </Button>
          </Link>
          <Link to="/login">
            <Button variant="secondary" size="lg">
              Sign In
            </Button>
          </Link>
        </div>
      </div>
      <footer className="border-t border-slate-200 bg-white py-6 dark:border-dark-border dark:bg-dark">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-5 text-sm text-ink-tertiary dark:text-white/40 lg:flex-row lg:px-8">
          <p>© {new Date().getFullYear()} CareerTrack Lite</p>
          <p>
            Built by {SITE_OWNER.name} · Student ID: {SITE_OWNER.studentId}
          </p>
        </div>
      </footer>
    </section>
  );
}

export function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-surface-secondary text-ink dark:bg-dark dark:text-white">
      <Navigation />
      <main className="flex-1">
        <Hero />
        <Features />
        <HowItWorks />
        <Pipeline />
        <Stats />
        <CtaFooter />
      </main>
    </div>
  );
}
