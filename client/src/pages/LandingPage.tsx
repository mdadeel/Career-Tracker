import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, List, X, FileText, ChartBar, ShieldCheck, Plus, SignIn } from "@phosphor-icons/react";
import { Button, LogoFull } from "../components/ui";

// TODO: Replace with your real details (spec §8 / §20 requires full name + student ID).
const SITE_OWNER = {
  name: "Your Full Name",
  studentId: "Your Student ID",
};

/**
 * Fixed ambient gradient background — single fixed element to avoid GPU
 * repaints on scroll (per DOM Cost rule). Brand-only tones, no purple/emerald.
 */
function AmbientBackground() {
  return (
    <div aria-hidden="true" className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
      <div className="absolute -left-24 -top-24 h-[28rem] w-[28rem] rounded-full bg-brand-400/25 blur-3xl animate-blob dark:bg-brand-500/15" />
      <div className="absolute right-[-10%] top-1/3 h-[24rem] w-[24rem] rounded-full bg-brand-400/15 blur-3xl animate-blob-slow dark:bg-brand-500/10" />
      <div className="absolute bottom-[-20%] left-1/3 h-[26rem] w-[26rem] rounded-full bg-brand-400/10 blur-3xl animate-blob dark:bg-brand-500/5" />
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
        <Link to="/" className="flex items-center">
          <LogoFull size={28} showSubtitle />
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
          <ArrowRight size={12} className="text-brand-500" />
        </a>

        <h1 className="animate-float-up text-balance text-4xl font-bold leading-[1.1] tracking-tight text-ink dark:text-white/90 sm:text-5xl lg:text-6xl [animation-delay:80ms]">
          Track every job application
          <span className="mt-1 block">
            <span className="text-brand-600 dark:text-brand-400">from one dashboard</span>
          </span>
        </h1>

        <p className="mx-auto mt-5 max-w-xl text-balance text-base leading-relaxed text-ink-secondary dark:text-white/50">
          Organize applications, store job links, follow statuses across your pipeline, and see where
          you stand — all in a private, secure workspace.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link to="/register">
            <Button size="lg" icon={<ArrowRight size={16} />}>
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
      icon: <FileText size={20} />,
      tint: "bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400",
    },
    {
      title: "Visual Pipeline",
      body: "See progress at a glance with real-time metrics and clear status stages.",
      icon: <ChartBar size={20} />,
      tint: "bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400",
    },
    {
      title: "Private & Secure",
      body: "JWT auth, hashed passwords, and complete user isolation — your data stays yours.",
      icon: <ShieldCheck size={20} />,
      tint: "bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400",
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
                {f.icon}
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
      icon: <SignIn size={20} weight="bold" />,
    },
    {
      n: "02",
      title: "Add applications",
      body: "Log each role with company, link, source, date, status, and notes.",
      icon: <Plus size={20} weight="bold" />,
    },
    {
      n: "03",
      title: "Track & filter",
      body: "Watch your pipeline, view stats, and search or filter what matters.",
      icon: <ChartBar size={20} weight="bold" />,
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
                {s.icon}
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
            <Button size="lg" icon={<ArrowRight size={16} />}>
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
      <AmbientBackground />
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
