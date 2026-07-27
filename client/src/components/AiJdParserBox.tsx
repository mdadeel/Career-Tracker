import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Spinner, CheckCircle, Gear } from "@phosphor-icons/react";
import { aiService, ParsedJd } from "../services/ai.service";
import { Button } from "./ui";
import { SparkleIcon } from "./ui/SparkleIcon";

const AI_NOT_CONFIGURED_PREFIX = "AI_NOT_CONFIGURED:";

function isAiNotConfigured(msg: string) {
  return msg.startsWith(AI_NOT_CONFIGURED_PREFIX);
}

function AiSetupPrompt({ message }: { message: string }) {
  const navigate = useNavigate();
  return (
    <div className="rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 p-3 space-y-3">
      <div className="flex items-start gap-2.5">
        <span className="text-amber-500 shrink-0 mt-0.5">⚠</span>
        <div>
          <p className="text-xs font-medium text-amber-800 dark:text-amber-300">AI Provider Not Configured</p>
          <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-0.5 leading-relaxed">
            {message}
          </p>
        </div>
      </div>
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

interface AiJdParserBoxProps {
  onParsed: (parsed: ParsedJd, rawJd: string) => void;
  compact?: boolean;
}

export function AiJdParserBox({ onParsed, compact }: AiJdParserBoxProps) {
  const [jdText, setJdText] = useState("");
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showSetupPrompt, setShowSetupPrompt] = useState(false);

  const handleParse = async () => {
    if (!jdText.trim() || jdText.trim().length < 20) {
      setError("Please paste a valid job description (at least 20 characters).");
      return;
    }

    setIsParsing(true);
    setError(null);
    setIsSuccess(false);

    try {
      const result = await aiService.parseJobDescription(jdText);
      onParsed(result, jdText);
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to parse job description with AI.";
      if (isAiNotConfigured(msg)) {
        setShowSetupPrompt(true);
        setError(null);
      } else {
        setError(msg);
      }
    } finally {
      setIsParsing(false);
    }
  };

  if (compact) {
    return (
      <div className="rounded-xl border-2 border-indigo-200 dark:border-indigo-500/30 bg-gradient-to-br from-indigo-50/80 via-white to-purple-50/40 dark:from-indigo-950/30 dark:via-zinc-900/50 dark:to-purple-950/20 p-4 space-y-3 shadow-md shadow-indigo-500/5">
        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-indigo-100 dark:bg-indigo-500/20">
            <SparkleIcon className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
          </span>
          <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300">AI Auto-Fill</span>
          {isSuccess && (
            <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">
              <CheckCircle size={10} weight="fill" /> Done
            </span>
          )}
        </div>

        <textarea
          value={jdText}
          onChange={(e) => setJdText(e.target.value)}
          placeholder="Paste job description..."
          rows={2}
          className="w-full rounded-lg border border-indigo-200 dark:border-indigo-500/20 bg-white dark:bg-zinc-900/80 p-2.5 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-shadow"
        />

        {showSetupPrompt && <AiSetupPrompt message="Add your API key in Settings to use AI Auto-Fill." />}

        {error && (
          <div className="flex items-center gap-2 rounded-lg bg-rose-50 dark:bg-rose-500/10 px-2.5 py-1.5 text-[11px] text-rose-600 dark:text-rose-400 font-medium">
            <span>⚠</span> {error}
          </div>
        )}

        <Button
          type="button"
          size="sm"
          onClick={handleParse}
          disabled={isParsing || !jdText.trim()}
          className="!w-full bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5 text-xs font-semibold shadow-sm shadow-indigo-500/20"
        >
          {isParsing ? (
            <>
              <Spinner size={12} className="animate-spin" />
              Parsing...
            </>
          ) : (
            <>
              <SparkleIcon className="w-3 h-3" />
              Auto-Fill
            </>
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border-2 border-indigo-200 dark:border-indigo-500/30 bg-gradient-to-br from-indigo-50/80 via-white to-purple-50/40 dark:from-indigo-950/30 dark:via-zinc-900/50 dark:to-purple-950/20 p-5 space-y-4 shadow-md shadow-indigo-500/5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5 text-indigo-600 dark:text-indigo-400">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-500/20">
            <SparkleIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </span>
          <div>
            <h3 className="text-sm font-bold text-indigo-700 dark:text-indigo-300">AI Auto-Fill Assistant</h3>
            <p className="text-[11px] text-indigo-500/70 dark:text-indigo-400/60">Paste a job description to auto-populate fields</p>
          </div>
        </div>
        {isSuccess && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 px-3 py-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
            <CheckCircle size={14} weight="fill" /> Auto-filled!
          </span>
        )}
      </div>

      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
        Save time by pasting the full job description. Our AI will automatically extract the <strong>company name</strong>, <strong>job title</strong>, <strong>location</strong>, <strong>salary range</strong>, and other details.
      </p>

      <textarea
        value={jdText}
        onChange={(e) => setJdText(e.target.value)}
        placeholder="Paste the full job description text here..."
        rows={4}
        className="w-full rounded-lg border border-indigo-200 dark:border-indigo-500/20 bg-white dark:bg-zinc-900/80 p-3 text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-shadow"
      />

      {showSetupPrompt && <AiSetupPrompt message="Add your API key in Settings to use AI Auto-Fill." />}

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-rose-50 dark:bg-rose-500/10 px-3 py-2 text-xs text-rose-600 dark:text-rose-400 font-medium">
          <span>⚠</span> {error}
        </div>
      )}

      <Button
        type="button"
        size="md"
        onClick={handleParse}
        disabled={isParsing || !jdText.trim()}
        className="!w-full bg-indigo-600 hover:bg-indigo-700 text-white gap-2 !py-2.5 text-sm font-semibold shadow-md shadow-indigo-500/20"
      >
        {isParsing ? (
          <>
            <Spinner size={16} className="animate-spin" />
            Parsing Job Description...
          </>
        ) : (
          <>
            <SparkleIcon className="w-4 h-4" />
            Auto-Fill Form
          </>
        )}
      </Button>

      <p className="text-[11px] text-slate-400 dark:text-slate-500 text-center">
        Our AI will extract: company name, job title, location, salary range, and more
      </p>

      <div className="text-center">
        <button
          type="button"
          onClick={() => {
            const el = document.getElementById("role-details-section");
            el?.scrollIntoView({ behavior: "smooth" });
          }}
          className="text-xs text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors underline underline-offset-2"
        >
          Or fill manually &darr;
        </button>
      </div>
    </div>
  );
}
