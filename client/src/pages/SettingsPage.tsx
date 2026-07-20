import { useState, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../hooks/useTheme";
import { useToast } from "../context/ToastContext";
import { authService } from "../services/authService";
import { Eye, EyeSlash, Sun, Moon, Warning, Spinner } from "@phosphor-icons/react";

/* ─── Password toggle icon ─── */
function PasswordToggle({ visible, onToggle }: { visible: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-ink-tertiary dark:text-white/40 hover:text-ink-secondary dark:hover:text-white/60 transition-colors"
      aria-label={visible ? "Hide passwords" : "Show passwords"}
      tabIndex={-1}
    >
      {visible ? <EyeSlash size={16} /> : <Eye size={16} />}
    </button>
  );
}

/* ─── Password strength ─── */
interface StrengthResult {
  score: number;    // 0–4
  label: string;
  color: string;
  barColor: string;
}

function getPasswordStrength(password: string): StrengthResult {
  if (!password) {
    return { score: 0, label: "", color: "", barColor: "" };
  }

  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  // Normalize to 0–4 scale
  const normalized = Math.min(score, 4);

  const levels: Record<number, { label: string; color: string; barColor: string }> = {
    1: { label: "Weak",       color: "text-rose-600 dark:text-rose-400",     barColor: "bg-rose-500" },
    2: { label: "Fair",       color: "text-orange-600 dark:text-orange-400", barColor: "bg-orange-500" },
    3: { label: "Strong",     color: "text-emerald-600 dark:text-emerald-400", barColor: "bg-emerald-500" },
    4: { label: "Very Strong", color: "text-emerald-700 dark:text-emerald-300", barColor: "bg-emerald-600" },
  };

  return { ...(levels[normalized] || levels[1]), score: normalized };
}

function PasswordStrengthIndicator({ password }: { password: string }) {
  const strength = useMemo(() => getPasswordStrength(password), [password]);

  if (!password) return null;

  return (
    <div className="mt-2 space-y-1">
      {/* Segmented bar */}
      <div className="flex gap-1 h-1">
        {[1, 2, 3, 4].map((segment) => {
          const filled = strength.score >= segment;
          return (
            <div
              key={segment}
              className={`flex-1 rounded-full transition-all duration-300 ${
                filled ? strength.barColor : "bg-slate-200 dark:bg-white/[0.08]"
              }`}
            />
          );
        })}
      </div>
      {/* Label */}
      <p className={`text-[11px] font-medium transition-all duration-300 ${strength.color}`}>
        {strength.label}
      </p>
    </div>
  );
}

export function SettingsPage() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { addToast } = useToast();
  const [copied, setCopied] = useState(false);

  // ── Password change form ──
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [showPasswords, setShowPasswords] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    if (!currentPassword) {
      setPasswordError("Current password is required");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }

    if (currentPassword === newPassword) {
      setPasswordError("New password must be different from current password");
      return;
    }

    setIsChangingPassword(true);
    try {
      await authService.changePassword({ currentPassword, newPassword });
      addToast("Password changed successfully", "success");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to change password";
      setPasswordError(message);
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleCopyUserId = async () => {
    if (!user?.id) return;
    try {
      await navigator.clipboard.writeText(user.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement("textarea");
      textarea.value = user.id;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="mx-auto max-w-5xl py-5 lg:py-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-base font-semibold text-ink dark:text-white/90">Settings</h1>
        <p className="mt-0.5 text-sm text-ink-secondary dark:text-white/50">
          Manage your account preferences and configuration
        </p>
      </div>

      {/* Two-column layout: Profile + Appearance left, Change Password right */}
      <div className="grid gap-6 lg:grid-cols-2 items-start">
        {/* Left column */}
        <div className="space-y-6">
          {/* Profile Section */}
          <section className="rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 dark:border-dark-border">
              <h2 className="text-sm font-semibold text-ink dark:text-white/85">Profile</h2>
            </div>
            <div className="px-5 py-4 space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-500/20 text-base font-bold text-brand-600 dark:text-brand-400">
                  {user?.name?.charAt(0)?.toUpperCase() || "U"}
                </div>
                <div>
                  <p className="text-sm font-medium text-ink dark:text-white/85">{user?.name}</p>
                  <p className="text-xs text-ink-secondary dark:text-white/50">{user?.email}</p>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-ink-secondary dark:text-white/50 mb-1">Name</label>
                  <p className="text-sm text-ink dark:text-white/80">{user?.name || "—"}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-ink-secondary dark:text-white/50 mb-1">Email</label>
                  <p className="text-sm text-ink dark:text-white/80">{user?.email || "—"}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-ink-secondary dark:text-white/50 mb-1">User ID</label>
                  <div className="flex items-center gap-2">
                    <code className="text-xs font-mono text-ink-secondary dark:text-white/60 truncate max-w-[160px]">{user?.id || "—"}</code>
                    <button onClick={handleCopyUserId} className="shrink-0 rounded-md px-2 py-1 text-[11px] font-medium text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-500/10 transition-colors">
                      {copied ? "Copied!" : "Copy"}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-ink-secondary dark:text-white/50 mb-1">Member Since</label>
                  <p className="text-sm text-ink dark:text-white/80">
                    {user?.createdAt
                      ? new Date(user.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
                      : "—"}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Appearance Section */}
          <section className="rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 dark:border-dark-border">
              <h2 className="text-sm font-semibold text-ink dark:text-white/85">Appearance</h2>
            </div>
            <div className="px-5 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-ink dark:text-white/85">Theme</p>
                  <p className="text-xs text-ink-secondary dark:text-white/50 mt-0.5">
                    {theme === "dark" ? "Dark mode is active" : "Light mode is active"}
                  </p>
                </div>
                <button
                  onClick={toggleTheme}
                  className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border border-slate-300 dark:border-white/[0.12] transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-dark"
                  role="switch"
                  aria-checked={theme === "dark"}
                  aria-label="Toggle dark mode"
                >
                  <span className={`pointer-events-none inline-flex h-4 w-4 items-center justify-center rounded-full bg-white shadow-sm ring-0 transition-transform duration-200 ${theme === "dark" ? "translate-x-[22px]" : "translate-x-[2px]"}`}>
                    {theme === "dark" ? (
                      <Sun size={10} className="text-slate-600" />
                    ) : (
                      <Moon size={10} className="text-slate-600" />
                    )}
                  </span>
                </button>
              </div>
            </div>
          </section>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Change Password Section */}
          <section className="rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 dark:border-dark-border">
              <h2 className="text-sm font-semibold text-ink dark:text-white/85">Change Password</h2>
            </div>
            <form onSubmit={handleChangePassword} className="px-5 py-4 space-y-4">
              <div>
                <label htmlFor="current-password" className="block text-xs font-medium text-ink-secondary dark:text-white/50 mb-1.5">Current Password</label>
                <div className="relative">
                  <input id="current-password" name="currentPassword" type={showPasswords ? "text" : "password"} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="w-full rounded-lg border border-slate-300 dark:border-dark-border bg-white dark:bg-dark-surface px-3 py-2 pr-9 text-sm text-ink dark:text-white/80 placeholder:text-ink-tertiary dark:placeholder:text-white/30 transition-all duration-150 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none" placeholder="Enter current password" autoComplete="current-password" />
                  <PasswordToggle visible={showPasswords} onToggle={() => setShowPasswords((v) => !v)} />
                </div>
              </div>
              <div>
                <label htmlFor="new-password" className="block text-xs font-medium text-ink-secondary dark:text-white/50 mb-1.5">New Password</label>
                <div className="relative">
                  <input id="new-password" name="newPassword" type={showPasswords ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full rounded-lg border border-slate-300 dark:border-dark-border bg-white dark:bg-dark-surface px-3 py-2 pr-9 text-sm text-ink dark:text-white/80 placeholder:text-ink-tertiary dark:placeholder:text-white/30 transition-all duration-150 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none" placeholder="At least 6 characters" autoComplete="new-password" />
                  <PasswordToggle visible={showPasswords} onToggle={() => setShowPasswords((v) => !v)} />
                </div>
                <PasswordStrengthIndicator password={newPassword} />
              </div>
              <div>
                <label htmlFor="confirm-password" className="block text-xs font-medium text-ink-secondary dark:text-white/50 mb-1.5">Confirm New Password</label>
                <div className="relative">
                  <input id="confirm-password" name="confirmPassword" type={showPasswords ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full rounded-lg border border-slate-300 dark:border-dark-border bg-white dark:bg-dark-surface px-3 py-2 pr-9 text-sm text-ink dark:text-white/80 placeholder:text-ink-tertiary dark:placeholder:text-white/30 transition-all duration-150 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none" placeholder="Re-enter new password" autoComplete="new-password" />
                  <PasswordToggle visible={showPasswords} onToggle={() => setShowPasswords((v) => !v)} />
                </div>
              </div>

              {passwordError && (
                <div className="flex items-center gap-2 rounded-lg bg-rose-50 dark:bg-rose-500/10 px-3 py-2" role="alert">
                  <Warning size={16} className="shrink-0 text-rose-500" />
                  <span className="text-xs text-rose-700 dark:text-rose-400">{passwordError}</span>
                </div>
              )}

              <div className="flex items-center gap-2 pt-1">
                <button type="submit" disabled={isChangingPassword} className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-xs font-medium text-white shadow-sm transition-all hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed">
                  {isChangingPassword ? (
                    <>
                      <Spinner size={14} className="animate-spin" />
                      Changing...
                    </>
                  ) : (
                    "Update Password"
                  )}
                </button>
                {!isChangingPassword && (currentPassword || newPassword || confirmPassword) && (
                  <button type="button" onClick={() => { setCurrentPassword(""); setNewPassword(""); setConfirmPassword(""); setPasswordError(null); }} className="rounded-lg px-3 py-2 text-xs font-medium text-ink-secondary dark:text-white/50 hover:bg-slate-100 dark:hover:bg-white/[0.05] transition-colors">Cancel</button>
                )}
              </div>
            </form>
          </section>
        </div>
      </div>

      {/* Footer */}
      <p className="text-xs text-ink-tertiary dark:text-white/30 text-center">
        CareerTrack Lite v1.0.0
      </p>
    </div>
  );
}
