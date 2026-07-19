import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useDemoRateLimiter } from "../hooks/useDemoRateLimiter";
import { Button, Input, LogoFull } from "../components/ui";

const DEMO_EMAIL = "alex@example.com";
const DEMO_PASSWORD = "password123";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDemoLoggingIn, setIsDemoLoggingIn] = useState(false);
  const { state: rateLimit, recordAttempt } = useDemoRateLimiter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid credentials");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoLogin = async () => {
    if (!rateLimit.allowed) return;
    setError(null);
    recordAttempt();
    setIsDemoLoggingIn(true);
    try {
      await login(DEMO_EMAIL, DEMO_PASSWORD);
      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Demo login failed");
    } finally {
      setIsDemoLoggingIn(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left - Form */}
      <div className="flex flex-1 items-center justify-center px-6 py-12 bg-white dark:bg-dark">
        <div className="w-full max-w-sm">
          {/* Brand */}
          <div className="mb-10">
            <Link to="/" className="inline-flex items-center">
              <LogoFull size={32} showSubtitle />
            </Link>
          </div>

          <h1 className="text-lg font-semibold text-ink dark:text-white/90">Welcome back</h1>
          <p className="mt-1 mb-8 text-sm text-ink-secondary dark:text-white/50">
            Sign in to access your applications
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
            <Input
              label="Password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
            />

            {error && (
              <div className="rounded-lg border border-rose-200 dark:border-rose-500/20 bg-rose-50 dark:bg-rose-500/10 px-4 py-3">
                <p className="text-sm text-rose-700 dark:text-rose-300">{error}</p>
              </div>
            )}

            <Button type="submit" isLoading={isSubmitting} className="w-full">
              {isSubmitting ? "Signing in..." : "Sign in"}
            </Button>

            {/* Demo login divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-dark-border" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white dark:bg-dark px-2 text-ink-tertiary dark:text-white/40">or</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={isDemoLoggingIn || isSubmitting || !rateLimit.allowed}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-brand-200 dark:border-brand-500/25 bg-brand-50 dark:bg-brand-500/10 px-4 py-2.5 text-sm font-medium text-brand-700 dark:text-brand-300 shadow-sm transition-all hover:bg-brand-100 dark:hover:bg-brand-500/20 hover:border-brand-300 dark:hover:border-brand-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDemoLoggingIn ? (
                <>
                  <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Logging in...
                </>
              ) : !rateLimit.allowed ? (
                <>
                  <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                  </svg>
                  <span>
                    Cooldown —{" "}
                    <span className="font-mono tabular-nums">{rateLimit.cooldownSeconds}s</span>
                  </span>
                </>
              ) : (
                <>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                  </svg>
                  <span>
                    Demo Login —{" "}
                    <span className="font-mono opacity-75">{DEMO_EMAIL}</span>
                  </span>
                </>
              )}
            </button>

            {/* Rate limit status below the button */}
            {!rateLimit.allowed && (
              <div className="flex items-center gap-2 rounded-lg bg-amber-50 dark:bg-amber-500/10 px-3 py-2 border border-amber-200 dark:border-amber-500/20" role="alert" aria-live="polite">
                <svg className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
                <span className="text-xs text-amber-700 dark:text-amber-400">
                  Too many demo login attempts. Please wait{" "}
                  <span className="font-mono font-semibold tabular-nums">{rateLimit.cooldownSeconds}</span>{" "}
                  second{rateLimit.cooldownSeconds !== 1 ? "s" : ""} before trying again.
                </span>
              </div>
            )}

            {rateLimit.allowed && rateLimit.attemptsUsed > 0 && (
              <p className="text-[11px] text-ink-tertiary dark:text-white/40 text-center">
                {rateLimit.message}
              </p>
            )}
          </form>

          <p className="mt-6 text-center text-sm text-ink-secondary dark:text-white/50">
            Don&apos;t have an account?{" "}
            <Link to="/register" className="font-medium text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 transition-colors">
              Create one
            </Link>
          </p>
        </div>
      </div>

      {/* Right - Visual */}
      <div className="hidden lg:flex flex-1 items-center justify-center bg-gradient-to-br from-brand-600 to-brand-950 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.12),transparent_70%)]" />
        <div className="relative z-10 max-w-md text-center px-8">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm mb-6">
            <span className="text-2xl font-bold text-white">CT</span>
          </div>
          <h2 className="text-2xl font-bold text-white">Track your job search</h2>
          <p className="mt-3 text-sm text-brand-200 leading-relaxed">
            Organize applications, store job descriptions, track statuses, and gain insights into your pipeline.
          </p>
          <div className="mt-8 flex justify-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-white/40" />
            <span className="h-1.5 w-6 rounded-full bg-white/80" />
            <span className="h-1.5 w-1.5 rounded-full bg-white/40" />
          </div>
        </div>
      </div>
    </div>
  );
}
