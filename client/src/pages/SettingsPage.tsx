import { useState, useMemo, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../hooks/useTheme";
import { useToast } from "../context/ToastContext";
import { authService } from "../services/authService";
import { aiService } from "../services/ai.service";
import { ResumeManager } from "../components/ResumeManager";
import { Alert } from "../components/ui";
import { Eye, EyeSlash, Sun, Moon, Warning, Spinner, CheckCircle, Lightning } from "@phosphor-icons/react";

/* ─── Password toggle icon ─── */
function PasswordToggle({ visible, onToggle }: { visible: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-ink-tertiary dark:text-white/40 hover:text-ink-secondary dark:hover:text-white/60 transition-colors"
      aria-label={visible ? "Hide key" : "Show key"}
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
      <p className={`text-[11px] font-medium transition-all duration-300 ${strength.color}`}>
        {strength.label}
      </p>
    </div>
  );
}

export function SettingsPage() {
  const { user, updateUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { addToast } = useToast();

  const [resumeInput, setResumeInput] = useState(user?.resumeText || "");
  const [isSavingResume, setIsSavingResume] = useState(false);

  // ── AI Provider Configuration State ──
  const [aiProvider, setAiProvider] = useState(user?.aiProvider || "system_default");
  const [aiApiKey, setAiApiKey] = useState("");
  const [aiApiKeyChanged, setAiApiKeyChanged] = useState(false);
  const [aiBaseUrl, setAiBaseUrl] = useState(user?.aiBaseUrl || "");
  const [aiModel, setAiModel] = useState(user?.aiModel || "");
  const [showApiKey, setShowApiKey] = useState(false);
  const hasExistingKey = !!(user?.aiApiKey && user.aiApiKey.startsWith("••"));

  const [isSavingAiConfig, setIsSavingAiConfig] = useState(false);
  const [isTestingAiConfig, setIsTestingAiConfig] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    if (user) {
      setResumeInput(user.resumeText || "");
      setAiProvider(user.aiProvider || "system_default");
      // Never pre-fill the masked key — keep the input blank
      setAiApiKey("");
      setAiApiKeyChanged(false);
      setAiBaseUrl(user.aiBaseUrl || "");
      setAiModel(user.aiModel || "");
    }
  }, [user]);

  const handleSaveResume = async () => {
    setIsSavingResume(true);
    try {
      const updatedUser = await authService.updateResume(resumeInput);
      updateUser(updatedUser);
      addToast("Resume profile saved successfully!", "success");
    } catch (err: unknown) {
      addToast(err instanceof Error ? err.message : "Failed to save resume profile", "error");
    } finally {
      setIsSavingResume(false);
    }
  };

  const handleTestAiConfig = async () => {
    if (aiProvider !== "system_default" && !aiApiKey && !hasExistingKey) {
      addToast("Please enter an API key first.", "error");
      return;
    }
    setIsTestingAiConfig(true);
    setTestResult(null);
    try {
      const payload: { aiProvider: string; aiApiKey?: string; aiBaseUrl?: string; aiModel?: string } = {
        aiProvider,
        aiBaseUrl,
        aiModel,
      };
      // Only send key if user typed a new one; otherwise backend uses stored key
      if (aiApiKeyChanged && aiApiKey) {
        payload.aiApiKey = aiApiKey;
      }
      const res = await aiService.testAiConfig(payload);
      setTestResult({ success: true, message: res.message || "Connection successful!" });
      addToast("AI Provider connection verified!", "success");
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { message?: string } }; message?: string };
      const msg = apiErr?.response?.data?.message || apiErr?.message || "Connection failed";
      setTestResult({ success: false, message: msg });
      addToast(msg, "error");
    } finally {
      setIsTestingAiConfig(false);
    }
  };

  const handleSaveAiConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingAiConfig(true);
    try {
      const payload: { aiProvider: string; aiApiKey?: string; aiBaseUrl?: string; aiModel?: string } = {
        aiProvider,
        aiBaseUrl,
        aiModel,
      };
      // Only send aiApiKey if user actually typed a new one
      if (aiApiKeyChanged && aiApiKey) {
        payload.aiApiKey = aiApiKey;
      } else if (aiApiKeyChanged && !aiApiKey) {
        // User cleared the field explicitly
        payload.aiApiKey = "";
      }
      const updatedUser = await authService.updateAiConfig(payload);
      updateUser(updatedUser);
      setAiApiKeyChanged(false);
      setAiApiKey("");
      addToast("AI Provider & API Keys saved successfully!", "success");
    } catch (err: unknown) {
      addToast(err instanceof Error ? err.message : "Failed to save AI configuration", "error");
    } finally {
      setIsSavingAiConfig(false);
    }
  };

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

    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters");
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
          Manage your account preferences, custom AI API keys, and configuration
        </p>
      </div>

      {/* Two-column layout: Profile + Appearance left, AI Settings + Change Password right */}
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
                <div className="flex-1">
                  <p className="text-sm font-medium text-ink dark:text-white/85">{user?.name}</p>
                  <p className="text-xs text-ink-secondary dark:text-white/50">{user?.email}</p>
                </div>
                <button
                  onClick={() => addToast("Profile editing is not available yet", "info")}
                  className="rounded-lg px-3 py-1.5 text-[11px] font-medium text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-500/10 transition-colors"
                >
                  Edit
                </button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
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

          {/* Resume / AI Profile Section */}
          <section className="rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 dark:border-dark-border flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-ink dark:text-white/85">AI Resume Profile</h2>
                <p className="text-xs text-ink-secondary dark:text-white/50 mt-0.5">
                  Upload resumes for AI-powered job matching. Your uploaded resumes are parsed and used for match scoring.
                </p>
              </div>
            </div>
            <div className="p-5 space-y-4">
              <ResumeManager />

              <details className="group rounded-lg border border-slate-200 dark:border-white/10 overflow-hidden">
                <summary className="flex cursor-pointer items-center justify-between px-3 py-2 text-xs font-medium text-ink-secondary dark:text-white/60 hover:bg-slate-50 dark:hover:bg-white/[0.02] list-none transition-colors">
                  Default resume text (fallback)
                  <span className="text-ink-tertiary group-open:rotate-180 transition-transform">▾</span>
                </summary>
                <div className="p-3 space-y-2 border-t border-slate-100 dark:border-white/5">
                  <div className="relative">
                    <textarea
                      value={resumeInput}
                      onChange={(e) => setResumeInput(e.target.value)}
                      placeholder="Paste your full resume text or key technical skills here..."
                      rows={4}
                      className="w-full rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-zinc-900/60 p-3 text-xs text-ink dark:text-white/80 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                    />
                    <span className="absolute bottom-2 right-2 text-[10px] text-ink-tertiary dark:text-white/40 tabular-nums">
                      {resumeInput.split(/\s+/).filter(Boolean).length} words
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-ink-tertiary dark:text-white/30">
                      {resumeInput !== (user?.resumeText || "") ? "Unsaved changes" : "Last saved"}
                    </span>
                    <button
                      type="button"
                      onClick={handleSaveResume}
                      disabled={isSavingResume}
                      className="rounded-lg bg-brand-600 px-3.5 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-brand-700 disabled:opacity-50 transition-colors flex items-center gap-1.5"
                    >
                      {isSavingResume ? <Spinner size={14} className="animate-spin" /> : null}
                      {isSavingResume ? "Saving..." : "Save"}
                    </button>
                  </div>
                </div>
              </details>
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
          {/* AI Provider & API Keys Configuration Section */}
          <section className="rounded-xl border border-indigo-200/80 dark:border-indigo-500/20 bg-white dark:bg-dark-surface overflow-hidden shadow-sm">
            <div className="px-5 py-4 border-b border-indigo-100 dark:border-white/10 flex items-center justify-between bg-indigo-50/40 dark:bg-indigo-950/20">
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                <Lightning size={18} />
                <h2 className="text-sm font-semibold">AI Provider & API Keys</h2>
              </div>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                aiProvider === "system_default"
                  ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300"
                  : "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300"
              }`}>
                {aiProvider === "system_default" ? "Built-in" : "Custom Keys"}
              </span>
            </div>

            <form onSubmit={handleSaveAiConfig} className="p-5 space-y-4">
              {/* Provider Selector */}
              <div>
                <label className="block text-xs font-medium text-ink-secondary dark:text-white/60 mb-1.5">
                  AI Service Provider
                </label>
                <select
                  value={aiProvider}
                  onChange={(e) => setAiProvider(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 dark:border-dark-border bg-white dark:bg-dark-surface px-3 py-2 text-xs text-ink dark:text-white/80 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
                >
                  <option value="system_default">CareerTrack AI (default)</option>
                  <option value="google">Google Gemini (Direct API)</option>
                  <option value="openai">Official OpenAI (ChatGPT API)</option>
                  <option value="openrouter">OpenRouter (Multi-model Router)</option>
                  <option value="custom">Custom Endpoint (OpenAI-Compatible / Ollama / DashScope)</option>
                </select>
                <p className="mt-1 text-[11px] text-ink-tertiary dark:text-white/40">
                  {aiProvider === "system_default" && "Uses pre-configured default server model."}
                  {aiProvider === "google" && "Uses Google AI Studio Gemini key directly."}
                  {aiProvider === "openai" && "Uses official OpenAI API key & models."}
                  {aiProvider === "openrouter" && "Access 200+ models on OpenRouter."}
                  {aiProvider === "custom" && "Connect any local or custom OpenAI-compatible server."}
                </p>
              </div>

              {/* Dynamic Key Input */}
              {aiProvider !== "system_default" && (
                <div className="space-y-3 pt-1 border-t border-slate-100 dark:border-white/5">
                  <div>
                    <label className="block text-xs font-medium text-ink-secondary dark:text-white/60 mb-1.5">
                      API Key
                      {hasExistingKey && !aiApiKeyChanged && (
                        <span className="ml-2 text-[10px] font-normal text-emerald-600 dark:text-emerald-400">✓ Key saved</span>
                      )}
                    </label>
                    <div className="relative">
                      <input
                        type={showApiKey ? "text" : "password"}
                        value={aiApiKey}
                        onChange={(e) => { setAiApiKey(e.target.value); setAiApiKeyChanged(true); }}
                        placeholder={
                          hasExistingKey
                            ? "••••••••  (leave blank to keep current key)"
                            : aiProvider === "google" ? "AIzaSy..." : aiProvider === "openai" ? "sk-proj-..." : "sk-or-v1-..."
                        }
                        className="w-full rounded-lg border border-slate-300 dark:border-dark-border bg-white dark:bg-dark-surface px-3 py-2 pr-9 text-xs text-ink dark:text-white/80 placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none font-mono"
                      />
                      <PasswordToggle visible={showApiKey} onToggle={() => setShowApiKey(!showApiKey)} />
                    </div>
                  </div>

                  {/* Base URL (Visible for Custom Provider) */}
                  {aiProvider === "custom" && (
                    <div>
                      <label className="block text-xs font-medium text-ink-secondary dark:text-white/60 mb-1.5">
                        Base URL
                      </label>
                      <input
                        type="url"
                        value={aiBaseUrl}
                        onChange={(e) => setAiBaseUrl(e.target.value)}
                        placeholder="https://dashscope.aliyuncs.com/compatible-mode/v1 or http://localhost:11434/v1"
                        className="w-full rounded-lg border border-slate-300 dark:border-dark-border bg-white dark:bg-dark-surface px-3 py-2 text-xs text-ink dark:text-white/80 placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none font-mono"
                      />
                    </div>
                  )}

                  {/* Model Name Input */}
                  <div>
                    <label className="block text-xs font-medium text-ink-secondary dark:text-white/60 mb-1.5">
                      Model Name (Optional Override)
                    </label>
                    <input
                      type="text"
                      value={aiModel}
                      onChange={(e) => setAiModel(e.target.value)}
                      placeholder={
                        aiProvider === "google"
                          ? "gemini-2.5-flash"
                          : aiProvider === "openai"
                          ? "gpt-4o-mini"
                          : aiProvider === "openrouter"
                          ? "google/gemini-2.5-flash-lite:free"
                          : "qwen3.7-plus"
                      }
                      className="w-full rounded-lg border border-slate-300 dark:border-dark-border bg-white dark:bg-dark-surface px-3 py-2 text-xs text-ink dark:text-white/80 placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none font-mono"
                    />
                  </div>
                </div>
              )}

              {/* Connection Test Result Badge */}
              {testResult && (
                <div
                  className={`flex items-center gap-2 p-2.5 rounded-lg text-xs font-medium ${
                    testResult.success
                      ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/20"
                      : "bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-500/20"
                  }`}
                >
                  {testResult.success ? <CheckCircle size={16} /> : <Warning size={16} />}
                  <span>{testResult.message}</span>
                </div>
              )}

              {/* Form Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-white/5">
                <button
                  type="button"
                  onClick={handleTestAiConfig}
                  disabled={isTestingAiConfig}
                  className="rounded-lg border border-slate-300 dark:border-white/10 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5 disabled:opacity-50 transition-colors flex items-center gap-1.5"
                >
                  {isTestingAiConfig ? <Spinner size={14} className="animate-spin" /> : null}
                  {isTestingAiConfig ? "Testing..." : "Test Connection"}
                </button>

                <button
                  type="submit"
                  disabled={isSavingAiConfig}
                  className="rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center gap-1.5"
                >
                  {isSavingAiConfig ? <Spinner size={14} className="animate-spin" /> : null}
                  {isSavingAiConfig ? "Saving..." : "Save AI Settings"}
                </button>
              </div>
            </form>
          </section>

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

              {passwordError && <Alert variant="error">{passwordError}</Alert>}

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
