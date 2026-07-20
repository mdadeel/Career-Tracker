import { useState } from "react";
import { Button, EmptyState, Input, Dialog } from "../components/ui";
import { formatDate } from "../utils/format";
import { Plus, Bookmark, ArrowUpRight, Trash } from "@phosphor-icons/react";

interface SavedJob {
  id: string;
  companyName: string;
  jobTitle: string;
  jobUrl: string;
  notes: string;
  savedAt: string;
  status: "want-to-apply" | "applied" | "archived";
}

const STORAGE_KEY = "saved-jobs";

function loadSavedJobs(): SavedJob[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveSavedJobs(jobs: SavedJob[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs));
  } catch {}
}

export function SavedJobsPage() {
  const [jobs, setJobs] = useState<SavedJob[]>(loadSavedJobs);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ companyName: "", jobTitle: "", jobUrl: "", notes: "" });
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const addJob = () => {
    if (!form.companyName || !form.jobTitle) return;
    const newJob: SavedJob = {
      id: `saved-${Date.now()}`,
      ...form,
      savedAt: new Date().toISOString(),
      status: "want-to-apply",
    };
    const updated = [newJob, ...jobs];
    setJobs(updated);
    saveSavedJobs(updated);
    setForm({ companyName: "", jobTitle: "", jobUrl: "", notes: "" });
    setShowForm(false);
  };

  const removeJob = (id: string) => {
    const updated = jobs.filter((j) => j.id !== id);
    setJobs(updated);
    saveSavedJobs(updated);
    setConfirmDelete(null);
  };

  const updateStatus = (id: string, status: SavedJob["status"]) => {
    const updated = jobs.map((j) => (j.id === id ? { ...j, status } : j));
    setJobs(updated);
    saveSavedJobs(updated);
  };

  return (
    <div className="mx-auto max-w-5xl py-5 lg:py-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold text-ink dark:text-white/90">Saved Jobs</h1>
          <p className="mt-0.5 text-sm text-ink-secondary dark:text-white/50">
            {jobs.length} job{jobs.length !== 1 ? "s" : ""} saved
          </p>
        </div>
        <Button
          size="sm"
          icon={
            <Plus size={14} />
          }
          onClick={() => setShowForm(true)}
        >
          Save Job
        </Button>
      </div>

      {/* Quick stats */}
      {jobs.length > 0 && (
        <div className="flex gap-3 text-xs text-ink-secondary dark:text-white/50">
          <span>{jobs.filter((j) => j.status === "want-to-apply").length} Want to apply</span>
          <span className="text-ink-tertiary dark:text-white/30">·</span>
          <span>{jobs.filter((j) => j.status === "applied").length} Applied</span>
          <span className="text-ink-tertiary dark:text-white/30">·</span>
          <span>{jobs.filter((j) => j.status === "archived").length} Archived</span>
        </div>
      )}

      {/* Add form (inline) */}
      {showForm && (
        <div className="rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface p-4 space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <Input label="Company" value={form.companyName} onChange={(e) => setForm((f) => ({ ...f, companyName: e.target.value }))} placeholder="Company name" />
            <Input label="Job Title" value={form.jobTitle} onChange={(e) => setForm((f) => ({ ...f, jobTitle: e.target.value }))} placeholder="Job title" />
          </div>
          <Input label="Job URL" type="url" value={form.jobUrl} onChange={(e) => setForm((f) => ({ ...f, jobUrl: e.target.value }))} placeholder="https://..." />
          <div className="flex items-center justify-end gap-2">
            <Button variant="secondary" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button size="sm" onClick={addJob} disabled={!form.companyName || !form.jobTitle}>Save</Button>
          </div>
        </div>
      )}

      {/* Empty state */}
      {jobs.length === 0 ? (
        <EmptyState
          icon={
            <Bookmark size={28} />
          }
          title="No saved jobs yet"
          description="Save job listings you're interested in and track them here"
          action={{ label: "Save a Job", onClick: () => setShowForm(true) }}
          tips={[
            "Save jobs you find on LinkedIn, Indeed, or other platforms",
            "Add notes about why you're interested",
            "Move to 'Applied' when you submit your application",
          ]}
        />
      ) : (
        <div className="space-y-2">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="flex items-center gap-3 rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface px-4 py-3 transition-all hover:border-slate-300 dark:hover:border-white/20"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 dark:bg-brand-500/10 text-xs font-bold text-brand-600 dark:text-brand-400">
                {job.companyName.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-ink dark:text-white/80 truncate">{job.jobTitle}</p>
                <p className="text-xs text-ink-secondary dark:text-white/50 truncate">{job.companyName}</p>
              </div>
              <div className="hidden items-center gap-2 sm:flex">
                <select
                  value={job.status}
                  onChange={(e) => updateStatus(job.id, e.target.value as SavedJob["status"])}
                  className="rounded-lg border border-slate-300 dark:border-dark-border bg-white dark:bg-dark-surface px-2 py-1 text-[11px] text-ink dark:text-white/70 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                >
                  <option value="want-to-apply">Want to Apply</option>
                  <option value="applied">Applied</option>
                  <option value="archived">Archived</option>
                </select>
                <span className="text-[11px] text-ink-tertiary dark:text-white/40">{formatDate(job.savedAt)}</span>
              </div>
              <div className="flex items-center gap-1">
                {job.jobUrl && (
                  <a href={job.jobUrl} target="_blank" rel="noopener noreferrer"
                    className="rounded-md p-1.5 text-ink-tertiary dark:text-white/30 hover:bg-surface-tertiary dark:hover:bg-white/5 transition-colors"
                    title="Open job posting"
                  >
                    <ArrowUpRight size={16} />
                  </a>
                )}
                <button
                  onClick={() => setConfirmDelete(job.id)}
                  className="rounded-md p-1.5 text-ink-tertiary dark:text-white/30 hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:text-rose-500 transition-colors"
                  title="Remove"
                >
                  <Trash size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        title="Remove saved job?"
        description="This job will be removed from your saved list."
        action={{ label: "Remove", variant: "danger", onClick: () => confirmDelete && removeJob(confirmDelete) }}
      />
    </div>
  );
}
