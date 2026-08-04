import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { applicationService } from "../services/applicationService";
import { aiService, MatchAnalysis, InterviewQuestion, EmailDraft } from "../services/ai.service";
import { useToast } from "../context/ToastContext";
import { Button, Badge, statusVariantMap, SparkleIcon, Tabs } from "../components/ui";
import {
  ArrowLeft,
  Spinner,
  CheckCircle,
} from "@phosphor-icons/react";
import type { Application } from "../types";
import { formatDate, formatSalary, formatLocation } from "../utils/format";

const AI_NOT_CONFIGURED_PREFIX = "AI_NOT_CONFIGURED:";

function isAiNotConfigured(msg: string) {
  return msg.startsWith(AI_NOT_CONFIGURED_PREFIX);
}

export function ApplicationAiDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [application, setApplication] = useState<Application | null>(null);
  const [isLoadingApp, setIsLoadingApp] = useState(true);
  const [appError, setAppError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<"match" | "interview" | "email">("match");

  // AI Match State
  const [matchData, setMatchData] = useState<MatchAnalysis | null>(null);
  const [isMatchLoading, setIsMatchLoading] = useState(false);

  // Interview Prep State
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [isInterviewLoading, setIsInterviewLoading] = useState(false);

  // Email State
  const [emailType, setEmailType] = useState<"follow_up" | "thank_you" | "cold_outreach">("follow_up");
  const [emailDraft, setEmailDraft] = useState<EmailDraft | null>(null);
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!id) return;
    setIsLoadingApp(true);
    applicationService
      .getById(id)
      .then((app) => {
        setApplication(app);
        if (app.aiAnalysis) {
          setMatchData(app.aiAnalysis as MatchAnalysis);
        }
      })
      .catch((err) => setAppError(err.message))
      .finally(() => setIsLoadingApp(false));
  }, [id]);

  const handleAnalyzeMatch = async (forceRegenerate = false) => {
    if (!id) return;
    setIsMatchLoading(true);
    try {
      const data = await aiService.analyzeMatch(id);
      setMatchData(data);
      if (application) {
        setApplication({ ...application, aiMatchScore: data.matchScore, aiAnalysis: data });
      }
      addToast(forceRegenerate ? "Match score re-analyzed & saved!" : "Match score calculated & saved!", "success");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to analyze match score.";
      if (isAiNotConfigured(msg)) {
        addToast("AI provider not configured. Go to Settings to add your API key.", "error");
        navigate("/settings");
      } else {
        addToast(msg, "error");
      }
    } finally {
      setIsMatchLoading(false);
    }
  };

  const handleFetchInterview = async () => {
    if (!id) return;
    setIsInterviewLoading(true);
    try {
      const data = await aiService.generateInterviewPrep(id);
      setQuestions(data);
      addToast("Interview prep questions generated!", "success");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to generate interview prep.";
      if (isAiNotConfigured(msg)) {
        addToast("AI provider not configured. Go to Settings to add your API key.", "error");
        navigate("/settings");
      } else {
        addToast(msg, "error");
      }
    } finally {
      setIsInterviewLoading(false);
    }
  };

  const handleFetchEmail = async () => {
    if (!id) return;
    setIsEmailLoading(true);
    try {
      const draft = await aiService.generateOutreachEmail(id, emailType);
      setEmailDraft(draft);
      addToast("Outreach email draft created!", "success");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to generate email draft.";
      if (isAiNotConfigured(msg)) {
        addToast("AI provider not configured. Go to Settings to add your API key.", "error");
        navigate("/settings");
      } else {
        addToast(msg, "error");
      }
    } finally {
      setIsEmailLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoadingApp) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner size={24} className="animate-spin text-brand-600" />
      </div>
    );
  }

  if (appError || !application) {
    return (
      <div className="mx-auto max-w-4xl py-8 space-y-4">
        <p className="text-sm text-rose-600">{appError || "Application not found"}</p>
        <Button onClick={() => navigate("/applications")}>Back to Applications</Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl py-5 lg:py-6 space-y-6">
      {/* Back button & Header */}
      <div>
        <button
          onClick={() => navigate("/applications")}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-tertiary dark:text-white/40 hover:text-ink-secondary dark:hover:text-white/60 transition-colors mb-3"
        >
          <ArrowLeft size={14} />
          Back to Applications
        </button>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-dark-surface p-5 rounded-2xl border border-slate-200 dark:border-dark-border shadow-sm">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-ink dark:text-white">{application.jobTitle}</h1>
              <Badge variant={statusVariantMap[application.status] || "default"}>
                {application.status}
              </Badge>
              {matchData?.matchScore !== undefined && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20">
                  <SparkleIcon className="w-3 h-3" /> {matchData.matchScore}% Match
                </span>
              )}
            </div>
            <p className="text-sm font-medium text-ink-secondary dark:text-white/60 flex items-center gap-2">
              💼 {application.companyName} • <span className="text-xs text-ink-tertiary">{application.source}</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={() => navigate(`/applications/${application.id}/edit`)}>
              Edit Application
            </Button>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Full Job Description Left | AI Copilot Suite Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Full Job Description & Specs */}
        <div className="lg:col-span-5 space-y-5">
          {/* Key Specs Card */}
          <div className="rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface p-4 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-tertiary dark:text-white/40">Application Overview</h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-ink-tertiary dark:text-white/40 block">Applied Date</span>
                <span className="font-medium text-ink dark:text-white/80">{formatDate(application.applicationDate)}</span>
              </div>
              {application.location && (
                <div>
                  <span className="text-ink-tertiary dark:text-white/40 block">Location</span>
                  <span className="font-medium text-ink dark:text-white/80">{formatLocation(application.location, application.remoteStatus)}</span>
                </div>
              )}
              {(application.salaryMin || application.salaryMax) && (
                <div>
                  <span className="text-ink-tertiary dark:text-white/40 block">Salary Range</span>
                  <span className="font-medium text-ink dark:text-white/80">
                    {formatSalary(application.salaryMin, application.salaryMax, application.salaryCurrency)}
                  </span>
                </div>
              )}
              {application.resumeLink && (
                <div>
                  <span className="text-ink-tertiary dark:text-white/40 block">Resume Link</span>
                  <a href={application.resumeLink} target="_blank" rel="noreferrer" className="text-brand-600 dark:text-brand-400 font-medium hover:underline inline-flex items-center gap-1">
                    🔗 View Resume
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Full Job Description Container */}
          <div className="rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface p-5 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-tertiary dark:text-white/40">Full Job Description</h3>
            {application.jobDescription ? (
              <div className="prose prose-xs dark:prose-invert max-h-[500px] overflow-y-auto pr-2 text-xs leading-relaxed text-ink dark:text-white/80 whitespace-pre-wrap">
                {application.jobDescription}
              </div>
            ) : (
              <p className="text-xs text-ink-tertiary italic">No job description text saved for this application.</p>
            )}
          </div>
        </div>

        {/* Right Column: AI Career Copilot Interactive Workspace */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-xl border border-indigo-200/80 dark:border-indigo-500/20 bg-white dark:bg-dark-surface p-5 space-y-4 shadow-sm">
            {/* Copilot Header Tabs — reusable accessible Tabs */}
            <div className="flex items-center justify-between gap-4 border-b border-slate-100 dark:border-white/10 pb-3">
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                <SparkleIcon className="w-5 h-5" />
                <h2 className="font-bold text-sm">AI Career Copilot Workspace</h2>
              </div>

              <Tabs
                ariaLabel="Copilot tools"
                idPrefix="copilot-workspace"
                active={activeTab}
                onChange={(tab) => {
                  setActiveTab(tab);
                  if (tab === "match" && !matchData && !isMatchLoading) handleAnalyzeMatch();
                  if (tab === "interview" && questions.length === 0 && !isInterviewLoading) handleFetchInterview();
                  if (tab === "email" && !emailDraft && !isEmailLoading) handleFetchEmail();
                }}
                tabs={[
                  { value: "match", label: "Match Score" },
                  { value: "interview", label: "Interview Prep" },
                  { value: "email", label: "Outreach Email" },
                ]}
              />
            </div>

            {/* TAB 1: MATCH SCORE & SKILLS GAP */}
            {activeTab === "match" && (
              <div role="tabpanel" id="copilot-workspace-panel-match" aria-labelledby="copilot-workspace-tab-match" className="space-y-4 pt-1">
                {!matchData && !isMatchLoading && (
                  <div className="text-center py-10 space-y-3">
                    <p className="text-xs text-slate-500">Calculate how well your saved resume profile aligns with this role.</p>
                    <Button size="sm" onClick={() => handleAnalyzeMatch(false)} className="bg-indigo-600 text-white">
                      🎯 Analyze Match Score
                    </Button>
                  </div>
                )}

                {isMatchLoading && (
                  <div className="flex flex-col items-center justify-center py-12 gap-2 text-xs text-indigo-600 font-medium">
                    <Spinner size={24} className="animate-spin" />
                    <span>Analyzing resume requirements against job description...</span>
                  </div>
                )}

                {matchData && !isMatchLoading && (
                  <div className="space-y-4 text-xs">
                    <div className="flex items-center justify-between bg-slate-50 dark:bg-zinc-900/60 p-4 rounded-xl border border-slate-200 dark:border-white/10">
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col items-center justify-center bg-indigo-600 text-white p-3 rounded-xl min-w-[75px]">
                          <span className="text-2xl font-black">{matchData.matchScore}%</span>
                          <span className="text-[10px] uppercase font-semibold">Match</span>
                        </div>
                        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed max-w-md">{matchData.summary}</p>
                      </div>

                      <button
                        onClick={() => handleAnalyzeMatch(true)}
                        className="inline-flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
                        title="Re-run analysis"
                      >
                        🔄 Re-analyze
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-emerald-50/60 dark:bg-emerald-950/20 p-4 rounded-xl border border-emerald-200 dark:border-emerald-500/20 space-y-2">
                        <h4 className="font-bold text-emerald-800 dark:text-emerald-300 text-xs">Matching Skills</h4>
                        <div className="flex flex-wrap gap-1.5">
                          {matchData.matchingSkills.map((s, idx) => (
                            <span key={idx} className="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 px-2.5 py-1 rounded-md text-[11px] font-medium">
                              ✓ {s}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="bg-amber-50/60 dark:bg-amber-950/20 p-4 rounded-xl border border-amber-200 dark:border-amber-500/20 space-y-2">
                        <h4 className="font-bold text-amber-800 dark:text-amber-300 text-xs">Missing Skills</h4>
                        <div className="flex flex-wrap gap-1.5">
                          {matchData.missingSkills.map((s, idx) => (
                            <span key={idx} className="bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 px-2.5 py-1 rounded-md text-[11px] font-medium">
                              ! {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {matchData.recommendations?.length > 0 && (
                      <div className="bg-white dark:bg-zinc-800 p-4 rounded-xl border border-slate-200 dark:border-white/10 space-y-2">
                        <h4 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 text-xs">
                          <SparkleIcon className="w-3.5 h-3.5 text-indigo-500" /> Tailoring Recommendations
                        </h4>
                        <ul className="list-disc list-inside text-slate-600 dark:text-slate-400 space-y-1 pl-1 text-xs">
                          {matchData.recommendations.map((rec, i) => (
                            <li key={i}>{rec}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: INTERVIEW PREPARATION */}
            {activeTab === "interview" && (
              <div role="tabpanel" id="copilot-workspace-panel-interview" aria-labelledby="copilot-workspace-tab-interview" className="space-y-4 pt-1">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-500">Practice questions generated specifically for this JD.</p>
                  <Button size="sm" onClick={handleFetchInterview} disabled={isInterviewLoading} className="bg-indigo-600 text-white">
                    {isInterviewLoading ? <Spinner size={14} className="animate-spin" /> : <>🔄 Regenerate</>}
                  </Button>
                </div>

                {isInterviewLoading && (
                  <div className="flex flex-col items-center justify-center py-12 gap-2 text-xs text-indigo-600 font-medium">
                    <Spinner size={24} className="animate-spin" />
                    <span>Generating tailored behavioral & technical interview questions...</span>
                  </div>
                )}

                {!isInterviewLoading && questions.length > 0 && (
                  <div className="space-y-3">
                    {questions.map((q, idx) => (
                      <div key={idx} className="bg-slate-50 dark:bg-zinc-900/60 p-4 rounded-xl border border-slate-200 dark:border-white/10 space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="uppercase text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                            {q.category}
                          </span>
                          <span className="text-slate-400 text-[11px] font-semibold">Question {idx + 1}</span>
                        </div>
                        <p className="font-bold text-slate-900 dark:text-white text-sm">{q.question}</p>
                        <div className="bg-white dark:bg-zinc-800 p-3 rounded-lg border border-slate-200/60 dark:border-white/5 text-slate-600 dark:text-slate-300 leading-relaxed">
                          <strong className="text-indigo-600 dark:text-indigo-400 font-semibold">STAR Tip: </strong>
                          {q.tip}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: OUTREACH EMAIL DRAFT */}
            {activeTab === "email" && (
              <div role="tabpanel" id="copilot-workspace-panel-email" aria-labelledby="copilot-workspace-tab-email" className="space-y-4 pt-1">
                <div className="flex items-center gap-3">
                  <select
                    value={emailType}
                    onChange={(e) => setEmailType(e.target.value as "follow_up" | "thank_you" | "cold_outreach")}
                    className="rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-zinc-800 px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 font-medium"
                  >
                    <option value="follow_up">Application Follow-up</option>
                    <option value="thank_you">Post-Interview Thank You</option>
                    <option value="cold_outreach">Recruiter Cold Outreach</option>
                  </select>
                  <Button size="sm" onClick={handleFetchEmail} disabled={isEmailLoading} className="bg-indigo-600 text-white">
                    {isEmailLoading ? <Spinner size={14} className="animate-spin" /> : "Generate Email Draft"}
                  </Button>
                </div>

                {isEmailLoading && (
                  <div className="flex flex-col items-center justify-center py-12 gap-2 text-xs text-indigo-600 font-medium">
                    <Spinner size={24} className="animate-spin" />
                    <span>Drafting personalized email...</span>
                  </div>
                )}

                {emailDraft && !isEmailLoading && (
                  <div className="bg-slate-50 dark:bg-zinc-900/60 p-4 rounded-xl border border-slate-200 dark:border-white/10 space-y-3 text-xs">
                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-2.5">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">Subject: {emailDraft.subject}</span>
                      <button
                        onClick={() => copyToClipboard(`Subject: ${emailDraft.subject}\n\n${emailDraft.body}`)}
                        className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
                      >
                        {copied ? <CheckCircle size={16} /> : null}
                        {copied ? "Copied!" : "Copy Draft"}
                      </button>
                    </div>
                    <textarea
                      readOnly
                      value={emailDraft.body}
                      rows={8}
                      className="w-full bg-white dark:bg-zinc-800 p-3 rounded-lg border border-slate-200 dark:border-white/5 text-slate-800 dark:text-slate-200 font-mono text-[11px] leading-relaxed focus:outline-none"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
