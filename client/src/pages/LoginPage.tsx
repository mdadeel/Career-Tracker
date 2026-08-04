import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useDemoRateLimiter } from "../hooks/useDemoRateLimiter";
import { Button, Input, LogoFull, Alert } from "../components/ui";
import { Lightning, WarningCircle, Spinner, Eye, EyeSlash } from "@phosphor-icons/react";
import { Navigation } from "../components/Navigation";

const DEMO_EMAIL = "demo@careertrack.app";
const DEMO_PASSWORD = "demo@123";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDemoLoggingIn, setIsDemoLoggingIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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
    <div className="flex min-h-screen flex-col">
      <Navigation />
      <div className="flex flex-1">
        {/* Left - Visual */}
        <div className="hidden lg:flex flex-1 relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-800">
          {/* Image overlay */}
          <div className="absolute inset-0">
            <img
              src="https://picsum.photos/seed/careertrack-login/800/1200"
              alt=""
              className="w-full h-full object-cover opacity-60"
            />
          </div>

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-slate-900/30" />

          {/* Content */}
          <div className="relative z-10 flex flex-col justify-end p-12">
            <div className="mb-5">
              <LogoFull size={32} textClassName="text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">Track your job search</h2>
            <p className="mt-2 text-sm text-white/60 leading-relaxed max-w-sm">
              Organize applications, store job descriptions, track statuses, and gain insights into your pipeline.
            </p>
          </div>
        </div>

        {/* Right - Form */}
        <div className="relative flex flex-1 items-center justify-center px-6 py-12 bg-white dark:bg-dark">
          <div className="w-full max-w-sm">
            <h1 className="text-2xl font-bold text-ink dark:text-white/90">Welcome back</h1>
            <p className="mt-1.5 mb-8 text-sm text-ink-secondary dark:text-white/50">
              Don&apos;t have an account?{" "}
              <Link to="/register" className="text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 font-medium transition-colors">
                Sign up
              </Link>
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                label="Email Address"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />

              <Input
                label="Password"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                trailing={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-0.5 text-ink-tertiary dark:text-white/40 hover:text-ink-secondary dark:hover:text-white/60 transition-colors"
                    tabIndex={-1}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
                  </button>
                }
              />

              {error && <Alert variant="error">{error}</Alert>}

              <Button type="submit" isLoading={isSubmitting} className="w-full">
                {isSubmitting ? "Signing in..." : "Sign In"}
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
                    <Spinner size={14} className="animate-spin" />
                    Logging in...
                  </>
                ) : !rateLimit.allowed ? (
                  <>
                    <WarningCircle size={16} />
                    <span>
                      Cooldown —{" "}
                      <span className="font-mono tabular-nums">{rateLimit.cooldownSeconds}s</span>
                    </span>
                  </>
                ) : (
                  <>
                    <Lightning size={16} />
                    <span>
                      Demo Login —{" "}
                      <span className="font-mono opacity-75">{DEMO_EMAIL}</span>
                    </span>
                  </>
                )}
              </button>

              {/* Rate limit status below the button */}
              {!rateLimit.allowed && (
                <Alert variant="warning" role="status">
                  Too many demo login attempts. Please wait{" "}
                  <span className="font-mono font-semibold tabular-nums">{rateLimit.cooldownSeconds}</span>{" "}
                  second{rateLimit.cooldownSeconds !== 1 ? "s" : ""} before trying again.
                </Alert>
              )}

              {rateLimit.allowed && rateLimit.attemptsUsed > 0 && (
                <p className="text-[11px] text-ink-tertiary dark:text-white/40 text-center">
                  {rateLimit.message}
                </p>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
