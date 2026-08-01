import { useState, useEffect } from "react";
import { resumeService } from "../services/resumeService";
import { useToast } from "../context/ToastContext";
import { ResumeUploader } from "./ResumeUploader";
import { Spinner, TrashSimple, FileText, CaretDown, CheckCircle } from "@phosphor-icons/react";
import type { Resume } from "../types";

export function ResumeManager() {
  const { addToast } = useToast();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);

  const loadResumes = async () => {
    setIsLoading(true);
    try {
      const data = await resumeService.list();
      setResumes(data);
    } catch {
      addToast("Failed to load resumes", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadResumes(); }, []);

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      await resumeService.delete(id);
      setResumes((prev) => prev.filter((r) => r.id !== id));
      if (expandedId === id) setExpandedId(null);
      addToast("Resume deleted", "success");
    } catch (err: unknown) {
      addToast(err instanceof Error ? err.message : "Failed to delete resume", "error");
    } finally {
      setDeleting(null);
    }
  };

  const handleUploaded = () => {
    loadResumes();
  };

  const handleSaveText = async (id: string) => {
    setSavingId(id);
    try {
      const updated = await resumeService.update(id, { textContent: editText });
      setResumes((prev) => prev.map((r) => (r.id === id ? { ...r, textContent: updated.textContent } : r)));
      setEditingId(null);
      addToast("Resume text updated", "success");
    } catch (err: unknown) {
      addToast(err instanceof Error ? err.message : "Failed to update resume", "error");
    } finally {
      setSavingId(null);
    }
  };

  const startEditing = (r: Resume) => {
    setEditingId(r.id);
    setEditText(r.textContent || "");
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditText("");
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  const [primaryId, setPrimaryId] = useState<string | null>(null);

  const togglePrimary = (id: string) => {
    setPrimaryId((prev) => (prev === id ? null : id));
    addToast(primaryId === id ? "Default resume unset" : "Set as primary resume for AI matching", "info");
  };

  const extractSkills = (text?: string | null) => {
    if (!text) return [];
    const techList = ["React", "TypeScript", "JavaScript", "Node.js", "Python", "SQL", "PostgreSQL", "Tailwind", "Vite", "GraphQL", "AWS", "Docker", "Git", "REST API", "Next.js"];
    return techList.filter((tech) => new RegExp(`\\b${tech}\\b`, "i").test(text));
  };

  return (
    <div className="space-y-3">
      <ResumeUploader onUploaded={handleUploaded} />

      {isLoading ? (
        <div className="flex items-center justify-center py-4">
          <Spinner size={16} className="animate-spin text-ink-tertiary" />
        </div>
      ) : resumes.length === 0 ? (
        <p className="text-xs text-ink-tertiary text-center py-2">
          No resumes uploaded yet. Drop a file above to get started.
        </p>
      ) : (
        <div className="space-y-2">
          {resumes.map((r) => {
            const skills = extractSkills(r.textContent);
            const isPrimary = primaryId === r.id || (primaryId === null && r === resumes[0]);
            return (
              <div key={r.id} className={`rounded-xl border transition-all overflow-hidden ${isPrimary ? "border-brand-500/50 bg-brand-500/5 dark:bg-brand-500/10 shadow-xs" : "border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface"}`}>
                <div className="flex items-center gap-3 px-3.5 py-2.5">
                  <button
                    type="button"
                    onClick={() => togglePrimary(r.id)}
                    className={`p-1 rounded-md transition-colors ${isPrimary ? "text-amber-500" : "text-slate-300 dark:text-white/20 hover:text-amber-400"}`}
                    title={isPrimary ? "Primary Resume (Used for AI Match)" : "Set as Primary Resume"}
                  >
                    ★
                  </button>

                  <button
                    type="button"
                    onClick={() => setExpandedId(expandedId === r.id ? null : r.id)}
                    className="flex items-center gap-2 flex-1 min-w-0 text-left"
                  >
                    <CaretDown
                      size={12}
                      className={`shrink-0 text-ink-tertiary transition-transform ${expandedId === r.id ? "rotate-0" : "-rotate-90"}`}
                    />
                    <FileText size={16} className="shrink-0 text-indigo-500" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-semibold text-ink dark:text-white/90 truncate">
                          {r.fileName}
                        </p>
                        {isPrimary && (
                          <span className="px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[9px] font-bold">
                            Primary
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-ink-tertiary dark:text-white/40">
                        {formatSize(r.fileSize)} &middot; {r.textContent ? `${r.textContent.split(/\s+/).filter(Boolean).length} words` : "parsed"}
                      </p>
                    </div>
                  </button>
                  {r.fileUrl && (
                    <a
                      href={r.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-md p-1.5 text-ink-tertiary dark:text-white/30 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                      title="Download resume file"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 256 256" fill="currentColor" className="block">
                        <path d="M216 176v40a8 8 0 0 1-8 8H48a8 8 0 0 1-8-8v-40a8 8 0 0 1 16 0v32h144v-32a8 8 0 0 1 16 0ZM96 96h24v-64a8 8 0 0 1 16 0v64h24a8 8 0 0 1 5.66 13.66l-32 32a8 8 0 0 1-11.32 0l-32-32A8 8 0 0 1 96 96Z" />
                      </svg>
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDelete(r.id)}
                    disabled={deleting === r.id}
                    className="rounded-md p-1.5 text-ink-tertiary dark:text-white/30 hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:text-rose-500 disabled:opacity-50 transition-colors"
                  >
                    {deleting === r.id ? (
                      <Spinner size={14} className="animate-spin" />
                    ) : (
                      <TrashSimple size={14} />
                    )}
                  </button>
                </div>

                {expandedId === r.id && (
                  <div className="border-t border-slate-100 dark:border-white/5 p-3.5 space-y-3 bg-slate-50/50 dark:bg-white/[0.01]">
                    {skills.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-tertiary dark:text-white/40">Extracted Skills:</span>
                        <div className="flex flex-wrap gap-1">
                          {skills.map((s) => (
                            <span key={s} className="px-2 py-0.5 rounded-md bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20 text-[10px] font-medium">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  {editingId === r.id ? (
                    <>
                      <textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        rows={8}
                        className="w-full rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-zinc-900/60 p-2.5 text-xs text-ink dark:text-white/80 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30 font-mono leading-relaxed resize-y"
                      />
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          type="button"
                          onClick={cancelEditing}
                          className="rounded-md px-3 py-1.5 text-xs font-medium text-ink-secondary dark:text-white/60 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveText(r.id)}
                          disabled={savingId === r.id}
                          className="rounded-md bg-brand-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-brand-700 disabled:opacity-50 transition-colors flex items-center gap-1.5"
                        >
                          {savingId === r.id ? (
                            <Spinner size={12} className="animate-spin" />
                          ) : (
                            <CheckCircle size={12} weight="bold" />
                          )}
                          {savingId === r.id ? "Saving..." : "Save"}
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <pre className="text-xs text-ink dark:text-white/70 font-sans leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto">
                        {r.textContent || "(No text extracted)"}
                      </pre>
                      {r.textContent && (
                        <button
                          type="button"
                          onClick={() => startEditing(r)}
                          className="text-xs font-medium text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 transition-colors"
                        >
                          Edit text
                        </button>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
        </div>
      )}
    </div>
  );
}
