import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  FileText,
  ChartBar,
  ShieldCheck,
  MagnifyingGlass,
  SquaresFour,
  CalendarCheck,
  CheckCircle,
  Lightning,
} from "@phosphor-icons/react";
import { Button, LogoFull, Accordion } from "../components/ui";
import { Navigation } from "../components/Navigation";
import { useSEO } from "../hooks/useSEO";


const SITE_OWNER = {
  name: "Shahnawas Adeel",
  studentId: "WEB12-1911",
};

/**
 * FAQ Data used both in the Accordion UI and injected as JSON-LD Schema for Google Rich Snippets.
 */
const FAQ_ITEMS = [
  {
    question: "Is my job search data private and secure?",
    answer:
      "Yes. CareerTrack uses JWT token authentication with bcrypt password hashing. All application details, notes, salary figures, and job descriptions are strictly isolated to your private account.",
  },
  {
    question: "Can I track job descriptions (JDs) and attached resume links?",
    answer:
      "Absolutely. For every job application, you can store full job descriptions (searchable across your pipeline) and direct links to the exact resume version you submitted.",
  },
  {
    question: "How does the pipeline Kanban board work?",
    answer:
      "CareerTrack provides an intuitive drag-and-drop Kanban board spanning 6 stages: Saved, Applied, Assessment, Interview, Rejected, and Offer. Updating a stage instantly re-computes your response rate and analytics.",
  },
  {
    question: "Does CareerTrack calculate response rates and average time to interview?",
    answer:
      "Yes. The built-in Analytics engine calculates your total response rate, interview conversion rate, offer rate, monthly application velocity, and exact average days from submission to interview.",
  },
  {
    question: "Is CareerTrack free to use?",
    answer:
      "CareerTrack is 100% free for job seekers with zero limits on the number of applications, notes, or saved jobs you can log.",
  },
];

/**
 * Realistic Sample Applications used for the Interactive Hero Preview & Sandbox
 */
const DEMO_APPLICATIONS = [
  {
    id: "demo-1",
    companyName: "Stripe",
    domain: "stripe.com",
    jobTitle: "Senior Full Stack Engineer",
    status: "Interview",
    location: "San Francisco, CA",
    salaryMin: 185000,
    salaryMax: 210000,
    salaryCurrency: "USD",
    employmentType: "Full-time",
    remoteStatus: "Hybrid",
    applicationDate: "2026-07-10",
    interviewDate: "2026-07-23T15:00:00Z",
  },
  {
    id: "demo-2",
    companyName: "Vercel",
    domain: "vercel.com",
    jobTitle: "Staff Frontend Architect",
    status: "Offer",
    location: "Remote",
    salaryMin: 195000,
    salaryMax: 225000,
    salaryCurrency: "USD",
    employmentType: "Full-time",
    remoteStatus: "Remote",
    applicationDate: "2026-06-28",
    interviewDate: "2026-07-12T18:00:00Z",
  },
  {
    id: "demo-3",
    companyName: "Linear",
    domain: "linear.app",
    jobTitle: "Product Engineer",
    status: "Applied",
    location: "San Francisco, CA",
    salaryMin: 175000,
    salaryMax: 200000,
    salaryCurrency: "USD",
    employmentType: "Full-time",
    remoteStatus: "Hybrid",
    applicationDate: "2026-07-18",
    interviewDate: null,
  },
  {
    id: "demo-4",
    companyName: "Supabase",
    domain: "supabase.com",
    jobTitle: "Backend Infrastructure Lead",
    status: "Assessment",
    location: "Remote",
    salaryMin: 170000,
    salaryMax: 195000,
    salaryCurrency: "USD",
    employmentType: "Full-time",
    remoteStatus: "Remote",
    applicationDate: "2026-07-14",
    interviewDate: null,
  },
  {
    id: "demo-5",
    companyName: "Figma",
    domain: "figma.com",
    jobTitle: "Design Systems Engineer",
    status: "Saved",
    location: "New York, NY",
    salaryMin: 180000,
    salaryMax: 205000,
    salaryCurrency: "USD",
    employmentType: "Full-time",
    remoteStatus: "On-site",
    applicationDate: "2026-07-19",
    interviewDate: null,
  },
];

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

/**
 * Asymmetric Split Hero Section with Tabbed Interactive Dashboard Preview
 */
function AsymmetricHero() {
  const [activeTab, setActiveTab] = useState<"pipeline" | "applications" | "analytics">("pipeline");

  return (
    <section className="relative overflow-hidden bg-surface-secondary px-5 pb-20 pt-28 dark:bg-dark lg:px-8 lg:pb-28 lg:pt-36">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
          {/* Left Column: Asymmetric Copy + CTAs */}
          <div className="lg:col-span-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200/90 bg-white px-3 py-1 text-xs font-semibold text-ink-secondary shadow-sm dark:border-dark-border dark:bg-dark-surface dark:text-white/70">
              <span className="relative flex h-2 w-2">
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              <span>Production-Grade Application Tracking</span>
              <Lightning size={13} className="text-brand-600 dark:text-brand-400" />
            </div>

            <h1 className="mt-6 text-balance text-4xl font-extrabold leading-[1.08] tracking-tight text-ink dark:text-white/95 sm:text-5xl lg:text-6xl">
              Track every job application with surgical precision.
            </h1>

            <p className="mt-5 max-w-xl text-balance text-base leading-relaxed text-ink-secondary dark:text-white/60">
              Stop losing track of your applications in messy spreadsheets. Organize stages, save job links, paste job descriptions, and measure conversion velocity — all in one private, secure workspace.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link to="/register">
                <Button size="lg" icon={<ArrowRight size={16} />} className="shadow-lg shadow-brand-500/20 hover:shadow-brand-500/30">
                  Start Tracking Free
                </Button>
              </Link>
            </div>

          </div>

          {/* Right Column: Dynamic Interactive Mockup */}
          <div className="lg:col-span-6">
            <div className="relative rounded-2xl border border-slate-200/90 bg-white shadow-2xl ring-1 ring-slate-900/5 dark:border-dark-border dark:bg-dark-surface">
              {/* Browser Header Bar */}
              <div className="flex items-center justify-between border-b border-slate-200/80 px-4 py-3 dark:border-dark-border">
                <div className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-full bg-rose-400" />
                  <span className="h-3 w-3 rounded-full bg-amber-400" />
                  <span className="h-3 w-3 rounded-full bg-emerald-400" />
                </div>
                <div className="flex items-center gap-1 rounded-lg bg-surface-tertiary px-3 py-1 text-[11px] font-medium text-ink-secondary dark:bg-dark dark:text-white/60">
                  <span>careertrack.app/dashboard</span>
                </div>
                <span className="text-[11px] font-bold text-brand-600 dark:text-brand-400">Live Demo</span>
              </div>

              {/* View Switcher Tabs */}
              <div className="flex border-b border-slate-100 bg-surface-secondary/50 px-4 pt-2 dark:border-dark-border dark:bg-dark/40">
                {[
                  { id: "pipeline", label: "Kanban Pipeline", icon: <SquaresFour size={14} /> },
                  { id: "applications", label: "Applications", icon: <FileText size={14} /> },
                  { id: "analytics", label: "Analytics Stats", icon: <ChartBar size={14} /> },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id as typeof activeTab)}
                    className={`flex items-center gap-1.5 border-b-2 px-3 py-2 text-xs font-semibold transition-colors ${
                      activeTab === t.id
                        ? "border-brand-600 text-brand-600 dark:border-brand-400 dark:text-brand-400"
                        : "border-transparent text-ink-tertiary hover:text-ink dark:text-white/40 dark:hover:text-white"
                    }`}
                  >
                    {t.icon}
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Tab Content Display — Fixed height container so header & tabs stay stationary */}
              <div className="h-[210px] p-4 sm:p-5 overflow-hidden">
                {activeTab === "pipeline" && (
                  <div className="space-y-3 animate-fade-in">
                    <div className="grid grid-cols-3 gap-2">
                      <div className="rounded-lg bg-slate-50 p-2.5 dark:bg-dark">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Applied (6)</p>
                        <div className="mt-2 space-y-1.5">
                          <div className="rounded-md border border-slate-200 bg-white p-2 text-xs font-medium dark:border-dark-border dark:bg-dark-surface">
                            <p className="font-semibold text-ink dark:text-white">Linear</p>
                            <p className="text-[10px] text-ink-tertiary">Product Engineer</p>
                          </div>
                          <div className="rounded-md border border-slate-200 bg-white p-2 text-xs font-medium dark:border-dark-border dark:bg-dark-surface">
                            <p className="font-semibold text-ink dark:text-white">Cloudflare</p>
                            <p className="text-[10px] text-ink-tertiary">Systems Dev</p>
                          </div>
                        </div>
                      </div>
                      <div className="rounded-lg bg-purple-50/60 p-2.5 dark:bg-purple-500/10">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-purple-700 dark:text-purple-400">Interview (4)</p>
                        <div className="mt-2 space-y-1.5">
                          <div className="rounded-md border border-emerald-200 bg-white p-2 text-xs font-medium shadow-sm dark:border-emerald-500/30 dark:bg-dark-surface">
                            <p className="font-semibold text-ink dark:text-white">Stripe</p>
                            <p className="text-[10px] text-purple-600 dark:text-purple-400 font-medium">Jul 23 • 3:00 PM</p>
                          </div>
                        </div>
                      </div>
                      <div className="rounded-lg bg-emerald-50/60 p-2.5 dark:bg-emerald-500/10">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">Offer (2)</p>
                        <div className="mt-2 space-y-1.5">
                          <div className="rounded-md border border-amber-200 bg-white p-2 text-xs font-medium shadow-sm dark:border-amber-500/30 dark:bg-dark-surface">
                            <p className="font-semibold text-ink dark:text-white">Vercel</p>
                            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">$195,000 / yr</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "applications" && (
                  <div className="space-y-2 animate-fade-in">
                    {DEMO_APPLICATIONS.slice(0, 3).map((app) => (
                      <div
                        key={app.id}
                        className="flex items-center justify-between rounded-lg border border-slate-200/90 bg-white p-2.5 dark:border-dark-border dark:bg-dark"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={`https://logo.clearbit.com/${app.domain}`}
                            alt={app.companyName}
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = "none";
                            }}
                            className="h-6 w-6 rounded-md object-contain"
                          />
                          <div>
                            <p className="text-xs font-bold text-ink dark:text-white/90">{app.jobTitle}</p>
                            <p className="text-[11px] text-ink-tertiary dark:text-white/40">
                              {app.companyName} • {app.location}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                            app.status === "Interview"
                              ? "bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400"
                              : app.status === "Offer"
                              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                              : "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400"
                          }`}
                        >
                          {app.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === "analytics" && (
                  <div className="space-y-3 animate-fade-in">
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="rounded-lg border border-slate-200 bg-surface-secondary p-2.5 dark:border-dark-border dark:bg-dark">
                        <p className="text-[10px] font-bold uppercase text-ink-tertiary dark:text-white/40">Total Apps</p>
                        <p className="mt-1 text-lg font-extrabold text-ink dark:text-white">24</p>
                      </div>
                      <div className="rounded-lg border border-slate-200 bg-surface-secondary p-2.5 dark:border-dark-border dark:bg-dark">
                        <p className="text-[10px] font-bold uppercase text-ink-tertiary dark:text-white/40">Response Rate</p>
                        <p className="mt-1 text-lg font-extrabold text-brand-600 dark:text-brand-400">33.3%</p>
                      </div>
                      <div className="rounded-lg border border-slate-200 bg-surface-secondary p-2.5 dark:border-dark-border dark:bg-dark">
                        <p className="text-[10px] font-bold uppercase text-ink-tertiary dark:text-white/40">Avg Time</p>
                        <p className="mt-1 text-lg font-extrabold text-emerald-600 dark:text-emerald-400">25 Days</p>
                      </div>
                    </div>
                    <div className="rounded-lg border border-slate-200/80 bg-surface-secondary/50 p-2 text-center text-xs text-ink-secondary dark:border-dark-border dark:bg-dark">
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">+18 Active Roles</span> in Pipeline Stage Funnel
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Trust bar — moved out of hero into its own compact section
 */
function TrustBar() {
  return (
    <section className="border-t border-slate-200/80 bg-white dark:border-dark-border dark:bg-dark-surface">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-8 gap-y-2 px-5 py-4 text-xs text-ink-tertiary dark:text-white/40 lg:px-8">
        <div className="flex items-center gap-1.5">
          <ShieldCheck size={16} className="text-emerald-500" />
          <span>100% Private JWT Auth</span>
        </div>
        <div className="flex items-center gap-1.5">
          <CheckCircle size={16} className="text-brand-500" />
          <span>No Credit Card Required</span>
        </div>
        <div className="flex items-center gap-1.5">
          <ChartBar size={16} className="text-violet-500" />
          <span>Real-Time Analytics</span>
        </div>
      </div>
    </section>
  );
}

/**
 * Bento 2.0 Feature Matrix (Section 9 Specs)
 */
function BentoFeatureGrid() {
  const [typedText, setTypedText] = useState("Filter: Interview");

  useEffect(() => {
    const prompts = ["Filter: Interview", "Company: Stripe", "Salary: > $150k", "Source: Referral"];
    let idx = 0;
    const interval = setInterval(() => {
      idx = (idx + 1) % prompts.length;
      setTypedText(prompts[idx]);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="features" className="border-t border-slate-200/80 bg-white py-20 dark:border-dark-border dark:bg-dark-surface lg:py-24">
      <Reveal className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="mb-14 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-brand-600 dark:text-brand-400">Built for Serious Job Seekers</p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-ink dark:text-white/90 sm:text-4xl">
            Engineered to accelerate your search
          </h2>
          <p className="mt-3 text-base text-ink-secondary dark:text-white/50">
            A cohesive suite of specialized tools for managing every phase of your career transition.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3 lg:grid-cols-3">
          {/* Card 1: Intelligent Pipeline (Wide Span 2 cols) */}
          <div className="group relative rounded-2xl border border-slate-200/90 bg-surface-secondary/60 p-6 transition-all duration-200 hover:border-brand-500/40 hover:shadow-card-hover md:col-span-2 dark:border-dark-border dark:bg-dark">
            <div className="flex items-center justify-between">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                <SquaresFour size={22} weight="bold" />
              </span>
              <span className="rounded-full bg-slate-200/60 px-2.5 py-0.5 text-[11px] font-bold text-ink-secondary dark:bg-white/10 dark:text-white/70">
                Drag & Drop
              </span>
            </div>
            <h3 className="mt-5 text-lg font-bold text-ink dark:text-white/90">Visual Pipeline Management</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-secondary dark:text-white/50">
              Organize your job search visually across 6 status columns: Saved, Applied, Assessment, Interview, Rejected, and Offer. Drag applications smoothly as you advance.
            </p>

            <div className="mt-6 flex gap-3 overflow-hidden rounded-xl border border-slate-200/80 bg-white p-3 dark:border-dark-border dark:bg-dark-surface">
              {["Saved (3)", "Applied (6)", "Interview (4)", "Offer (2)"].map((stg, i) => (
                <div key={stg} className="flex-1 rounded-lg bg-surface-secondary p-2 text-center dark:bg-dark">
                  <p className={`text-[11px] font-bold ${i === 2 ? "text-emerald-600 dark:text-emerald-400" : "text-ink-secondary dark:text-white/60"}`}>
                    {stg}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Card 2: Command Input Cmd+K Typewriter */}
          <div className="group relative rounded-2xl border border-slate-200/90 bg-surface-secondary/60 p-6 transition-all duration-200 hover:border-brand-500/40 hover:shadow-card-hover dark:border-dark-border dark:bg-dark">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400">
              <MagnifyingGlass size={22} weight="bold" />
            </div>
            <h3 className="mt-5 text-lg font-bold text-ink dark:text-white/90">Global Command Palette</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-secondary dark:text-white/50">
              Press <kbd className="rounded bg-slate-200 px-1.5 py-0.5 text-xs font-mono font-bold dark:bg-white/10">Cmd+K</kbd> to search across companies, job titles, status filters, and navigation links instantaneously.
            </p>

            <div className="mt-6 rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-dark-border dark:bg-dark-surface">
              <div className="flex items-center gap-2 text-xs font-mono text-ink-secondary dark:text-white/70">
                <MagnifyingGlass size={14} className="text-brand-500" />
                <span>{typedText}</span>
                <span className="h-3.5 w-1 animate-pulse bg-brand-500" />
              </div>
            </div>
          </div>

          {/* Card 3: Interview Countdown Calendar */}
          <div className="group relative rounded-2xl border border-slate-200/90 bg-surface-secondary/60 p-6 transition-all duration-200 hover:border-brand-500/40 hover:shadow-card-hover dark:border-dark-border dark:bg-dark">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
              <CalendarCheck size={22} weight="bold" />
            </div>
            <h3 className="mt-5 text-lg font-bold text-ink dark:text-white/90">Interview Calendar</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-secondary dark:text-white/50">
              Never miss an interview. Schedule past and upcoming dates with real-time breathing indicators for today's interviews.
            </p>

            <div className="mt-6 flex items-center justify-between rounded-xl border border-emerald-200/80 bg-emerald-50/50 p-3 dark:border-emerald-500/30 dark:bg-emerald-500/10">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">Stripe Technical Round</span>
              </div>
              <span className="text-caption font-bold text-emerald-600 dark:text-emerald-400">Today • 3:00 PM</span>
            </div>
          </div>

          {/* Card 4: Analytics Funnel */}
          <div className="group relative rounded-2xl border border-slate-200/90 bg-surface-secondary/60 p-6 transition-all duration-200 hover:border-brand-500/40 hover:shadow-card-hover md:col-span-2 dark:border-dark-border dark:bg-dark">
            <div className="flex items-center justify-between">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
                <ChartBar size={22} weight="bold" />
              </span>
              <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400">Conversion Engine</span>
            </div>
            <h3 className="mt-5 text-lg font-bold text-ink dark:text-white/90">Actionable Analytics & Metrics</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-secondary dark:text-white/50">
              Track conversion velocity, response rates, source platform performance (LinkedIn vs Wellfound vs Referrals), and average days to interview.
            </p>

            <div className="mt-6 grid grid-cols-3 gap-3">
              <div className="rounded-xl border border-slate-200 bg-white p-3 text-center dark:border-dark-border dark:bg-dark-surface">
                <p className="text-[10px] font-bold uppercase text-ink-tertiary">Response Rate</p>
                <p className="mt-1 text-base font-extrabold text-ink dark:text-white">33.3%</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-3 text-center dark:border-dark-border dark:bg-dark-surface">
                <p className="text-[10px] font-bold uppercase text-ink-tertiary">Interview Rate</p>
                <p className="mt-1 text-base font-extrabold text-brand-600 dark:text-brand-400">25.0%</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-3 text-center dark:border-dark-border dark:bg-dark-surface">
                <p className="text-[10px] font-bold uppercase text-ink-tertiary">Avg Days to Interview</p>
                <p className="mt-1 text-base font-extrabold text-emerald-600 dark:text-emerald-400">25 Days</p>
              </div>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

/**
 * Realistic Social Proof & Metrics Section
 */
function StatsAndTestimonials() {
  return (
    <section id="stats" className="scroll-mt-14 border-t border-slate-200 bg-surface-secondary py-20 dark:border-dark-border dark:bg-dark lg:py-24">
      <Reveal className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="grid gap-8 text-center sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 dark:border-dark-border dark:bg-dark-surface">
            <p className="text-4xl font-extrabold tracking-tight text-brand-600 dark:text-brand-400">24+</p>
            <p className="mt-2 text-sm font-semibold text-ink dark:text-white/80">Seeded Demo Applications</p>
            <p className="mt-1 text-xs text-ink-tertiary dark:text-white/40">Across 7 months of real tech company data</p>
          </div>
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 dark:border-dark-border dark:bg-dark-surface">
            <p className="text-4xl font-extrabold tracking-tight text-emerald-600 dark:text-emerald-400">33.3%</p>
            <p className="mt-2 text-sm font-semibold text-ink dark:text-white/80">Average Response Rate</p>
            <p className="mt-1 text-xs text-ink-tertiary dark:text-white/40">Calculated directly from active interview funnel</p>
          </div>
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 dark:border-dark-border dark:bg-dark-surface">
            <p className="text-4xl font-extrabold tracking-tight text-violet-600 dark:text-violet-400">100%</p>
            <p className="mt-2 text-sm font-semibold text-ink dark:text-white/80">Private User Isolation</p>
            <p className="mt-1 text-xs text-ink-tertiary dark:text-white/40">JWT authentication with bcrypt security</p>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

/**
 * Interactive FAQ Accordion Section
 */
function FaqSection() {
  return (
    <section id="faq" className="scroll-mt-14 border-t border-slate-200 bg-white py-20 dark:border-dark-border dark:bg-dark-surface lg:py-24">
      <Reveal className="mx-auto max-w-4xl px-5 lg:px-8">
        <div className="mb-12 text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-600 dark:text-brand-400">Got Questions?</span>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-ink dark:text-white/90 sm:text-4xl">
            Frequently Asked Questions
          </h2>
        </div>

        {/* Reusable Accordion — animated grid-rows disclosure per the namethatui pattern */}
        <Accordion
          items={FAQ_ITEMS.map((item, idx) => ({
            id: `faq-${idx}`,
            trigger: item.question,
            children: item.answer,
          }))}
        />
      </Reveal>
    </section>
  );
}

/**
 * Rich Footer & CTA
 */
function CtaFooter() {
  return (
    <section className="border-t border-slate-200 bg-surface-secondary dark:border-dark-border dark:bg-dark">
      <div className="mx-auto max-w-7xl px-5 py-20 text-center lg:px-8 lg:py-24">
        <h2 className="mx-auto max-w-2xl text-balance text-3xl font-extrabold tracking-tight text-ink dark:text-white/90 sm:text-4xl">
          Take control of your job search today
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-base text-ink-secondary dark:text-white/50">
          Create your free account in under 60 seconds and start tracking roles with complete clarity.
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

      <footer className="border-t border-slate-200 bg-white py-10 dark:border-dark-border dark:bg-dark">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <LogoFull size={24} showSubtitle />
              <p className="mt-3 text-xs leading-relaxed text-ink-tertiary dark:text-white/40">
                Production-grade job application tracker for ambitious professionals.
              </p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-ink dark:text-white">Product</p>
              <ul className="mt-3 space-y-2 text-xs text-ink-secondary dark:text-white/50">
                <li><a href="#features" className="hover:text-ink dark:hover:text-white">Kanban Pipeline</a></li>
                <li><a href="#features" className="hover:text-ink dark:hover:text-white">Analytics Engine</a></li>
              </ul>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-ink dark:text-white">Resources</p>
              <ul className="mt-3 space-y-2 text-xs text-ink-secondary dark:text-white/50">
                <li><a href="#faq" className="hover:text-ink dark:hover:text-white">FAQ</a></li>
                <li><Link to="/login" className="hover:text-ink dark:hover:text-white">Sign In</Link></li>
                <li><Link to="/register" className="hover:text-ink dark:hover:text-white">Create Account</Link></li>
              </ul>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-ink dark:text-white">Project Credit</p>
              <p className="mt-3 text-xs text-ink-secondary dark:text-white/50">
                Built by <span className="font-bold text-ink dark:text-white">{SITE_OWNER.name}</span>
              </p>
              <p className="mt-1 text-xs text-ink-tertiary dark:text-white/40">Student ID: {SITE_OWNER.studentId}</p>
            </div>
          </div>

          <div className="mt-10 border-t border-slate-100 pt-6 text-center text-xs text-ink-tertiary dark:border-dark-border dark:text-white/40">
            © {new Date().getFullYear()} CareerTrack Lite. All rights reserved.
          </div>
        </div>
      </footer>
    </section>
  );
}

export function LandingPage() {
  const seo = useSEO({
    faq: FAQ_ITEMS.map((item) => ({ question: item.question, answer: item.answer })),
  });
  return (
    <div className="flex min-h-screen flex-col bg-surface-secondary text-ink dark:bg-dark dark:text-white">
      {seo}
      <Navigation />
      <main id="main-content" className="flex-1">
        <AsymmetricHero />
        <TrustBar />
        <BentoFeatureGrid />
        <StatsAndTestimonials />
        <FaqSection />
        <CtaFooter />
      </main>
    </div>
  );
}
