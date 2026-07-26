import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button, Input, LogoFull } from "../components/ui";
import { Eye, EyeSlash } from "@phosphor-icons/react";
import { Navigation } from "../components/Navigation";

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await register(name, email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setIsSubmitting(false);
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
              src="https://picsum.photos/seed/careertrack-signup/800/1200"
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
            <h2 className="text-2xl font-bold text-white">Stay organized</h2>
            <p className="mt-2 text-sm text-white/60 leading-relaxed max-w-sm">
              Keep every application, interview, and offer in one place. Know where you stand at a glance.
            </p>
          </div>
        </div>

        {/* Right - Form */}
        <div className="relative flex flex-1 items-center justify-center px-6 py-12 bg-white dark:bg-dark">
          <div className="w-full max-w-sm">
            <h1 className="text-2xl font-bold text-ink dark:text-white/90">Create your account</h1>
            <p className="mt-1.5 mb-8 text-sm text-ink-secondary dark:text-white/50">
              Already have an account?{" "}
              <Link to="/login" className="text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 font-medium transition-colors">
                Sign in
              </Link>
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                label="Full Name"
                required
                minLength={2}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
              />
              <Input
                label="Email Address"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />

              <div className="space-y-1.5">
                <label className="block text-label uppercase tracking-wider text-ink-secondary">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    className="block w-full rounded-lg border border-slate-300 dark:border-dark-border bg-white dark:bg-dark-surface px-3 py-2.5 pr-10 text-body text-ink dark:text-white/80 placeholder:text-ink-tertiary dark:placeholder:text-white/30 transition-all duration-150 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-ink-tertiary dark:text-white/40 hover:text-ink-secondary dark:hover:text-white/60 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="rounded-lg border border-rose-200 dark:border-rose-500/20 bg-rose-50 dark:bg-rose-500/10 px-4 py-3">
                  <p className="text-sm text-rose-700 dark:text-rose-300">{error}</p>
                </div>
              )}

              <Button type="submit" isLoading={isSubmitting} className="w-full">
                {isSubmitting ? "Creating account..." : "Create account"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
