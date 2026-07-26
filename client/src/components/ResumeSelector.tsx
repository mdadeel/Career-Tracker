import { useState, useEffect, useRef } from "react";
import { resumeService } from "../services/resumeService";
import { FileText, CaretDown } from "@phosphor-icons/react";
import { ResumeUploader } from "./ResumeUploader";

interface ResumeItem {
  id: string;
  fileName: string;
}

interface ResumeSelectorProps {
  value?: string | null;
  onChange: (resumeId: string | null) => void;
}

export function ResumeSelector({ value, onChange }: ResumeSelectorProps) {
  const [resumes, setResumes] = useState<ResumeItem[]>([]);
  const [open, setOpen] = useState(false);
  const [showUploader, setShowUploader] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selected = resumes.find((r) => r.id === value);

  useEffect(() => {
    resumeService.list().then(setResumes).catch(() => {});
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleUploaded = (resume: ResumeItem) => {
    setResumes((prev) => [resume, ...prev]);
    onChange(resume.id);
    setShowUploader(false);
    setOpen(false);
  };

  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-2 rounded-lg border border-slate-300 dark:border-dark-border bg-white dark:bg-dark-surface px-3 py-2 text-xs text-left text-ink dark:text-white/80 hover:border-slate-400 dark:hover:border-white/20 transition-colors"
      >
        <FileText size={14} className="shrink-0 text-ink-tertiary" />
        <span className="flex-1 truncate">
          {selected ? selected.fileName : "Select a resume..."}
        </span>
        {value && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onChange(null); }}
            className="rounded p-0.5 text-ink-tertiary hover:text-rose-500"
          >
            &times;
          </button>
        )}
        <CaretDown size={12} className="shrink-0 text-ink-tertiary" />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface shadow-lg">
          {resumes.length === 0 && !showUploader && (
            <p className="p-3 text-xs text-ink-tertiary text-center">No resumes uploaded yet</p>
          )}

          {resumes.length > 0 && (
            <div className="max-h-40 overflow-y-auto py-1">
              {resumes.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => { onChange(r.id); setOpen(false); }}
                  className={`flex w-full items-center gap-2 px-3 py-2 text-xs text-left hover:bg-slate-50 dark:hover:bg-white/5 transition-colors ${
                    r.id === value ? "bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-400" : "text-ink dark:text-white/70"
                  }`}
                >
                  <FileText size={14} className="shrink-0" />
                  <span className="truncate">{r.fileName}</span>
                </button>
              ))}
            </div>
          )}

          <div className="border-t border-slate-100 dark:border-white/5 p-2">
            {showUploader ? (
              <ResumeUploader onUploaded={handleUploaded} />
            ) : (
              <button
                type="button"
                onClick={() => setShowUploader(true)}
                className="w-full rounded-md px-3 py-1.5 text-xs font-medium text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-500/10 transition-colors"
              >
                + Upload new resume
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
