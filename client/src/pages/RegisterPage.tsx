import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useSEO } from "../hooks/useSEO";
import { Button, Input, LogoFull, Alert } from "../components/ui";
import { Eye, EyeSlash } from "@phosphor-icons/react";
import { Navigation } from "../components/Navigation";

export function RegisterPage() {
  const { register } = useAuth();
  const seo = useSEO();
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
      {seo}
      <Navigation />
      <main id="main-content" className="flex flex-1">
        {/* Left - Visual */}
        <div className="hidden lg:flex flex-1 relative overflow-hidden bg-surface-secondary border-r border-slate-200 dark:border-dark-border">
          {/* Content */}
          <div className="relative flex flex-col justify-end p-12">
            <div className="mb-5">
              <LogoFull size={32} textClassName="text-ink dark:text-white/90" />
            </div>
            <p className="text-2xl font-bold text-ink dark:text-white/90">Stay organized</p>
            <p className="mt-2 text-sm text-ink-secondary dark:text-white/50 leading-relaxed max-w-sm">
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

              <Input
                label="Password"
                type={showPassword ? "text" : "password"}
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
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
                {isSubmitting ? "Creating account..." : "Create account"}
              </Button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
