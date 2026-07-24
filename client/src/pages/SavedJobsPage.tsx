import { useState, useEffect, useMemo } from "react";
import { Button, EmptyState, Input, Dialog, Skeleton } from "../components/ui";
import { formatDate } from "../utils/format";
import { Plus, Bookmark, ArrowUpRight, Trash, StackSimple } from "@phosphor-icons/react";
import { applicationService } from "../services/applicationService";
import type { Application } from "../types";

interface SavedJob {
  id: string;
  companyName: string;
  jobTitle: string;
  jobUrl: string;
  notes: string;
  savedAt: string;
  status: "want-to-apply" | "applied" | "archived";
}

interface DisplayItem {
  id: string;
  companyName: string;
  jobTitle: string;
  jobUrl: string;
  notes: string;
  savedAt: string;
  status: string;
  /** Track whether this comes from the local bookmarks or the database. */
  source: "bookmark" | "database";
  /** Original DB application (if source="database") so we can open the detail panel */
  dbApp?: Application;
  /** Location info for DB apps */
  location?: string | null;
  employmentType?: string | null;
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

/** Convert a DB Application with "Saved" status into a display-friendly item. */
function appToDisplayItem(app: Application): DisplayItem {
  return {
    id: app.id,
    companyName: app.companyName,
    jobTitle: app.jobTitle,
    jobUrl: app.jobUrl || "",
    notes: app.notes || "",
    savedAt: app.createdAt,
    status: app.status,
    source: "database",
    dbApp: app,
    location: app.location,
    employmentType: app.employmentType,
  };
}

export function SavedJobsPage() {
  const [jobs, setJobs] = useState<SavedJob[]>(loadSavedJobs);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ companyName: "", jobTitle: "", jobUrl: "", notes: "" });
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  // Database-saved applications
  const [dbApps, setDbApps] = useState<Application[]>([]);
  const [isLoadingDb, setIsLoadingDb] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setIsLoadingDb(true);
    applicationService
      .getAll({ status: "Saved", limit: 50, sortBy: "newest" })
      .then((res) => {
        if (!cancelled) {
          setDbApps(res.applications);
          setIsLoadingDb(false);
        }
      })
      .catch(() => {
        if (!cancelled) setIsLoadingDb(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Merge local bookmarks + database-saved apps into one sorted list
  const displayItems = useMemo<DisplayItem[]>(() => {
    const localItems: DisplayItem[] = jobs.map((j) => ({
      ...j,
      source: "bookmark" as const,
    }));
    const dbItems: DisplayItem[] = dbApps.map(appToDisplayItem);

    // Merge and sort by savedAt descending (newest first)
    const merged = [...localItems, ...dbItems].sort(
      (a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()
    );

    // Deduplicate by companyName + jobTitle (case-insensitive)
    const seen = new Set<string>();
    return merged.filter((item) => {
      const key = `${item.companyName.toLowerCase()}|${item.jobTitle.toLowerCase()}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [jobs, dbApps]);

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

  const totalCount = displayItems.length;
  const bookmarkCount = jobs.length;
  const dbCount = dbApps.length;

  return (
    <div className="mx-auto max-w-5xl py-5 lg:py-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold text-ink dark:text-white/90">Saved Jobs</h1>
          <p className="mt-0.5 text-sm text-ink-secondary dark:text-white/50">
            {isLoadingDb ? (
              "Loading..."
            ) : (
              <>{totalCount} job{totalCount !== 1 ? "s" : ""} saved</>
            )}
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
      {totalCount > 0 && (
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-ink-secondary dark:text-white/50">
          <span>{bookmarkCount} bookmark{bookmarkCount !== 1 ? "s" : ""}</span>
          {dbCount > 0 && (
            <>
              <span className="text-ink-tertiary dark:text-white/30">·</span>
              <span>{dbCount} from tracker{dbCount !== 1 ? "s" : ""}</span>
            </>
          )}
          <span className="text-ink-tertiary dark:text-white/30">·</span>
          <span>{displayItems.filter((j) => j.status === "want-to-apply").length} Want to apply</span>
          <span className="text-ink-tertiary dark:text-white/30">·</span>
          <span>{displayItems.filter((j) => j.status === "Applied" || j.status === "applied").length} Applied</span>
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

      {/* Loading state for DB apps */}
      {isLoadingDb && dbApps.length === 0 && jobs.length === 0 ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface px-4 py-3">
              <Skeleton width={32} height={32} className="rounded-lg" />
              <div className="flex-1 space-y-1">
                <Skeleton width="45%" height={14} />
                <Skeleton width="25%" height={12} />
              </div>
            </div>
          ))}
        </div>
      ) : totalCount === 0 ? (
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
            "Mark applications as 'Saved' in the tracker and they'll appear here",
          ]}
        />
      ) : (
        <div className="space-y-2">
          {displayItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface px-4 py-3 transition-all hover:border-slate-300 dark:hover:border-white/20"
            >
              {/* Initial */}
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 dark:bg-brand-500/10 text-xs font-bold text-brand-600 dark:text-brand-400">
                {item.companyName.charAt(0)}
              </div>

              {/* Info */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-medium text-ink dark:text-white/80 truncate">{item.jobTitle}</p>
                  {item.source === "database" && (
                    <span className="inline-flex items-center gap-0.5 rounded bg-indigo-50 dark:bg-indigo-950/40 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20 shrink-0">
                      <StackSimple size={10} />
                      Tracker
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-ink-secondary dark:text-white/50">
                  <span className="truncate">{item.companyName}</span>
                  {(item.location || item.employmentType) && (
                    <>
                      <span className="text-ink-tertiary dark:text-white/30">·</span>
                      {item.location && <span className="truncate">{item.location}</span>}
                      {item.employmentType && <span className="shrink-0">{item.employmentType}</span>}
                    </>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="hidden items-center gap-2 sm:flex">
                {item.source === "bookmark" ? (
                  <select
                    value={item.status}
                    onChange={(e) => updateStatus(item.id, e.target.value as SavedJob["status"])}
                    className="rounded-lg border border-slate-300 dark:border-dark-border bg-white dark:bg-dark-surface px-2 py-1 text-[11px] text-ink dark:text-white/70 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  >
                    <option value="want-to-apply">Want to Apply</option>
                    <option value="applied">Applied</option>
                    <option value="archived">Archived</option>
                  </select>
                ) : (
                  <span className="inline-flex items-center rounded-full bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
                    Saved
                  </span>
                )}
                <span className="text-[11px] text-ink-tertiary dark:text-white/40">{formatDate(item.savedAt)}</span>
              </div>

              {/* Icon buttons */}
              <div className="flex items-center gap-1">
                {item.jobUrl && (
                  <a href={item.jobUrl} target="_blank" rel="noopener noreferrer"
                    className="rounded-md p-1.5 text-ink-tertiary dark:text-white/30 hover:bg-surface-tertiary dark:hover:bg-white/5 transition-colors"
                    title="Open job posting"
                  >
                    <ArrowUpRight size={16} />
                  </a>
                )}
                {item.source === "bookmark" && (
                  <button
                    onClick={() => setConfirmDelete(item.id)}
                    className="rounded-md p-1.5 text-ink-tertiary dark:text-white/30 hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:text-rose-500 transition-colors"
                    title="Remove bookmark"
                  >
                    <Trash size={16} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        title="Remove saved job?"
        description="This job will be removed from your bookmarked list."
        action={{ label: "Remove", variant: "danger", onClick: () => confirmDelete && removeJob(confirmDelete) }}
      />
    </div>
  );
}
