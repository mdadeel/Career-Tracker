import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Spinner, CheckCircle, ArrowUpRight, Gear } from "@phosphor-icons/react";
import { aiService, MatchAnalysis, InterviewQuestion, EmailDraft } from "../services/ai.service";
import { Button } from "./ui";
import { SparkleIcon } from "./ui/SparkleIcon";

const AI_NOT_CONFIGURED_PREFIX = "AI_NOT_CONFIGURED:";

function isAiNotConfigured(msg: string) {
  return msg.startsWith(AI_NOT_CONFIGURED_PREFIX);
}

function AiSetupNotice() {
  const navigate = useNavigate();
  return (
    <div className="rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 p-3 space-y-2">
      <p className="text-xs font-medium text-amber-800 dark:text-amber-300">AI Provider Not Configured</p>
      <p className="text-[11px] text-amber-700 dark:text-amber-400 leading-relaxed">
        Add your API key in Settings to use AI features.
      </p>
      <button
        type="button"
        onClick={() => navigate("/settings")}
        className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-500/20 hover:bg-amber-200 dark:hover:bg-amber-500/30 px-3 py-1.5 rounded-lg transition-colors"
      >
        <Gear size={12} weight="fill" />
        Configure in Settings
      </button>
    </div>
  );
}

interface AiAssistantDrawerProps {
  applicationId: string;
  jobTitle: string;
  companyName: string;
}

export function AiAssistantDrawer({ applicationId }: AiAssistantDrawerProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"match" | "interview" | "email">("match");

  // Match State
  const [matchData, setMatchData] = useState<MatchAnalysis | null>(null);
  const [isMatchLoading, setIsMatchLoading] = useState(false);
  const [matchError, setMatchError] = useState<string | null>(null);

  // Interview Prep State
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [isInterviewLoading, setIsInterviewLoading] = useState(false);
  const [interviewError, setInterviewError] = useState<string | null>(null);

  // Email State
  const [emailType, setEmailType] = useState<"follow_up" | "thank_you" | "cold_outreach">("follow_up");
  const [emailDraft, setEmailDraft] = useState<EmailDraft | null>(null);
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showSetupNotice, setShowSetupNotice] = useState(false);

  const fetchMatch = async () => {
    setIsMatchLoading(true);
    setMatchError(null);
    try {
      const data = await aiService.analyzeMatch(applicationId);
      setMatchData(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to analyze match score.";
      if (isAiNotConfigured(msg)) {
        setShowSetupNotice(true);
      } else {
        setMatchError(msg);
      }
    } finally {
      setIsMatchLoading(false);
    }
  };

  const fetchInterview = async () => {
    setIsInterviewLoading(true);
    setInterviewError(null);
    try {
      const data = await aiService.generateInterviewPrep(applicationId);
      setQuestions(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to generate interview prep.";
      if (isAiNotConfigured(msg)) {
        setShowSetupNotice(true);
      } else {
        setInterviewError(msg);
      }
    } finally {
      setIsInterviewLoading(false);
    }
  };

  const fetchEmail = async () => {
    setIsEmailLoading(true);
    setEmailError(null);
    try {
      const draft = await aiService.generateOutreachEmail(applicationId, emailType);
      setEmailDraft(draft);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to generate email draft.";
      if (isAiNotConfigured(msg)) {
        setShowSetupNotice(true);
      } else {
        setEmailError(msg);
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

  return (
    <div className="mt-6 rounded-2xl border border-indigo-200/80 dark:border-indigo-500/30 bg-gradient-to-b from-indigo-50/40 to-slate-50/50 dark:from-indigo-950/20 dark:to-zinc-900/50 p-5 space-y-4 shadow-sm">
      {/* Header bar with title and prominent Open Full Page button */}
      <div className="flex items-center justify-between gap-3 border-b border-indigo-100 dark:border-white/10 pb-3.5">
        <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300">
          <SparkleIcon className="w-4.5 h-4.5 text-indigo-500 animate-pulse" />
          <h3 className="font-bold text-sm tracking-tight">AI Career Copilot</h3>
        </div>

        <button
          type="button"
          onClick={() => navigate(`/applications/${applicationId}/copilot`)}
          className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:shadow-indigo-500/20 transition-all cursor-pointer group shrink-0"
        >
          <span>Open Full Page</span>
          <ArrowUpRight size={14} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-white/90 dark:bg-zinc-800 p-1 rounded-xl border border-slate-200 dark:border-white/10 text-xs shadow-inner">
        <button
          onClick={() => { setActiveTab("match"); if (!matchData) fetchMatch(); }}
          className={`flex-1 py-1.5 rounded-lg font-medium transition-all text-center ${
            activeTab === "match"
              ? "bg-indigo-600 text-white shadow-sm font-semibold"
              : "text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white"
          }`}
        >
          Match Score
        </button>
        <button
          onClick={() => { setActiveTab("interview"); if (questions.length === 0) fetchInterview(); }}
          className={`flex-1 py-1.5 rounded-lg font-medium transition-all text-center ${
            activeTab === "interview"
              ? "bg-indigo-600 text-white shadow-sm font-semibold"
              : "text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white"
          }`}
        >
          Interview Prep
        </button>
        <button
          onClick={() => { setActiveTab("email"); if (!emailDraft) fetchEmail(); }}
          className={`flex-1 py-1.5 rounded-lg font-medium transition-all text-center ${
            activeTab === "email"
              ? "bg-indigo-600 text-white shadow-sm font-semibold"
              : "text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white"
          }`}
        >
          Outreach Email
        </button>
      </div>

      {showSetupNotice && <AiSetupNotice />}

      {/* MATCH TAB */}
      {activeTab === "match" && (
        <div className="space-y-4">
          {!matchData && !isMatchLoading && (
            <div className="text-center py-6">
              <p className="text-xs text-slate-500 mb-3">Analyze how well your resume matches this job description.</p>
              <Button size="sm" onClick={fetchMatch} className="bg-indigo-600 text-white">
                Analyze Match
              </Button>
            </div>
          )}

          {isMatchLoading && (
            <div className="flex items-center justify-center py-8 gap-2 text-xs text-indigo-600 font-medium">
              <Spinner size={16} className="animate-spin" /> Analyzing resume & JD requirements...
            </div>
          )}

          {matchError && <p className="text-xs text-rose-600">{matchError}</p>}

          {matchData && (
            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-4 bg-white dark:bg-zinc-800 p-3 rounded-lg border border-slate-200 dark:border-white/10">
                <div className="flex flex-col items-center justify-center bg-indigo-50 dark:bg-indigo-950/40 p-3 rounded-xl min-w-[70px]">
                  <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{matchData.matchScore}%</span>
                  <span className="text-[10px] text-indigo-500 uppercase tracking-wider font-semibold">Match</span>
                </div>
                <div>
                  <p className="font-medium text-slate-800 dark:text-slate-200">{matchData.summary}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-emerald-50/50 dark:bg-emerald-950/20 p-3 rounded-lg border border-emerald-200/50 dark:border-emerald-500/20">
                  <h4 className="font-semibold text-emerald-800 dark:text-emerald-300 mb-1.5">Matching Skills</h4>
                  <div className="flex flex-wrap gap-1">
                    {matchData.matchingSkills.map((s, idx) => (
                      <span key={idx} className="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded text-[11px]">
                        ✓ {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="bg-amber-50/50 dark:bg-amber-950/20 p-3 rounded-lg border border-amber-200/50 dark:border-amber-500/20">
                  <h4 className="font-semibold text-amber-800 dark:text-amber-300 mb-1.5">Missing Skills</h4>
                  <div className="flex flex-wrap gap-1">
                    {matchData.missingSkills.map((s, idx) => (
                      <span key={idx} className="bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded text-[11px]">
                        ! {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {matchData.recommendations?.length > 0 && (
                <div className="bg-white dark:bg-zinc-800 p-3 rounded-lg border border-slate-200 dark:border-white/10 space-y-1">
                  <h4 className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    <SparkleIcon className="w-3.5 h-3.5 text-indigo-500" /> Key Recommendations
                  </h4>
                  <ul className="list-disc list-inside text-slate-600 dark:text-slate-400 space-y-0.5 pl-1">
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

      {/* INTERVIEW PREP TAB */}
      {activeTab === "interview" && (
        <div className="space-y-3 text-xs">
          {isInterviewLoading && (
            <div className="flex items-center justify-center py-8 gap-2 text-indigo-600 font-medium">
              <Spinner size={16} className="animate-spin" /> Generating practice questions...
            </div>
          )}

          {interviewError && <p className="text-rose-600">{interviewError}</p>}

          {!isInterviewLoading && questions.length > 0 && (
            <div className="space-y-2.5">
              {questions.map((q, idx) => (
                <div key={idx} className="bg-white dark:bg-zinc-800 p-3 rounded-lg border border-slate-200 dark:border-white/10 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="uppercase text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
                      {q.category}
                    </span>
                    <span className="text-slate-400 text-[10px]">Q{idx + 1}</span>
                  </div>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">{q.question}</p>
                  <p className="text-slate-500 dark:text-slate-400 italic bg-slate-50 dark:bg-zinc-900/60 p-2 rounded">
                    <strong>STAR Tip:</strong> {q.tip}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* EMAIL TAB */}
      {activeTab === "email" && (
        <div className="space-y-3 text-xs">
          <div className="flex items-center gap-2">
            <select
              value={emailType}
              onChange={(e) => setEmailType(e.target.value as "follow_up" | "thank_you" | "cold_outreach")}
              className="rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-zinc-800 px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200"
            >
              <option value="follow_up">Application Follow-up</option>
              <option value="thank_you">Post-Interview Thank You</option>
              <option value="cold_outreach">Recruiter Cold Outreach</option>
            </select>
            <Button size="sm" onClick={fetchEmail} disabled={isEmailLoading} className="bg-indigo-600 text-white">
              {isEmailLoading ? <Spinner size={14} className="animate-spin" /> : "Generate Draft"}
            </Button>
          </div>

          {emailError && <p className="text-rose-600">{emailError}</p>}

          {emailDraft && (
            <div className="bg-white dark:bg-zinc-800 p-3 rounded-lg border border-slate-200 dark:border-white/10 space-y-2">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-2">
                <span className="font-medium text-slate-700 dark:text-slate-300">Subject: {emailDraft.subject}</span>
                <button
                  onClick={() => copyToClipboard(`Subject: ${emailDraft.subject}\n\n${emailDraft.body}`)}
                  className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
                >
                  {copied ? <CheckCircle size={14} /> : null}
                  {copied ? "Copied!" : "Copy All"}
                </button>
              </div>
              <textarea
                readOnly
                value={emailDraft.body}
                rows={6}
                className="w-full bg-slate-50 dark:bg-zinc-900/60 p-2.5 rounded border border-slate-200 dark:border-white/5 text-slate-700 dark:text-slate-300 font-mono text-[11px] focus:outline-none"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
