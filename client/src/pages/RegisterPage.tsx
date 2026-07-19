import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button, Input } from "../components/ui";

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    <div className="flex min-h-screen">
      {/* Left - Form */}
      <div className="flex flex-1 items-center justify-center px-6 py-12 bg-white dark:bg-dark">
        <div className="w-full max-w-sm">
          {/* Brand */}
          <div className="mb-10">
            <Link to="/" className="inline-flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500 text-sm font-bold text-white shadow-sm">
                CT
              </span>
              <span className="text-base font-semibold tracking-tight text-ink dark:text-white/90">CareerTrack</span>
            </Link>
          </div>

          <h1 className="text-lg font-semibold text-ink dark:text-white/90">Create your account</h1>
          <p className="mt-1 mb-8 text-sm text-ink-secondary dark:text-white/50">
            Start tracking your job applications today
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              required
              minLength={2}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
            />
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
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
            />

            {error && (
              <div className="rounded-lg border border-rose-200 dark:border-rose-500/20 bg-rose-50 dark:bg-rose-500/10 px-4 py-3">
                <p className="text-sm text-rose-700 dark:text-rose-300">{error}</p>
              </div>
            )}

            <Button type="submit" isLoading={isSubmitting} className="w-full">
              {isSubmitting ? "Creating account..." : "Create account"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-ink-secondary dark:text-white/50">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 transition-colors">
              Sign in
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
          <h2 className="text-2xl font-bold text-white">Stay organized</h2>
          <p className="mt-3 text-sm text-brand-200 leading-relaxed">
            Keep every application, interview, and offer in one place. Know where you stand at a glance.
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
