import { useState } from "react";
import { Spinner, CheckCircle } from "@phosphor-icons/react";
import { aiService, ParsedJd } from "../services/ai.service";
import { Button } from "./ui";

interface AiJdParserBoxProps {
  onParsed: (parsed: ParsedJd, rawJd: string) => void;
}

export function AiJdParserBox({ onParsed }: AiJdParserBoxProps) {
  const [jdText, setJdText] = useState("");
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

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
    } catch (err: any) {
      setError(err?.message || "Failed to parse job description with AI.");
    } finally {
      setIsParsing(false);
    }
  };

  return (
    <div className="rounded-xl border border-indigo-100 dark:border-indigo-500/20 bg-gradient-to-br from-indigo-50/50 via-white to-purple-50/30 dark:from-indigo-950/20 dark:via-zinc-900/40 dark:to-purple-950/10 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
          <span className="text-base">✨</span>
          <h3 className="text-xs font-semibold uppercase tracking-wider">AI Auto-Fill Assistant</h3>
        </div>
        {isSuccess && (
          <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            <CheckCircle size={14} /> Fields Auto-filled!
          </span>
        )}
      </div>

      <p className="text-xs text-slate-600 dark:text-slate-400">
        Paste a raw Job Description below and AI will automatically extract the company, role, location, salary range, and requirements.
      </p>

      <textarea
        value={jdText}
        onChange={(e) => setJdText(e.target.value)}
        placeholder="Paste full Job Description text here..."
        rows={3}
        className="w-full rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-zinc-900/80 p-2.5 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
      />

      {error && (
        <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">{error}</p>
      )}

      <div className="flex justify-end">
        <Button
          type="button"
          size="sm"
          onClick={handleParse}
          disabled={isParsing || !jdText.trim()}
          className="bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5"
        >
          {isParsing ? (
            <>
              <Spinner size={14} className="animate-spin" />
              Parsing JD...
            </>
          ) : (
            <>
              <span>✨</span>
              Auto-Fill Form
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
