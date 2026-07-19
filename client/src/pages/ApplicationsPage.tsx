import { useState, useEffect, useRef, type FormEvent } from "react";
import { useSearchParams } from "react-router-dom";
import { useApplications } from "../hooks/useApplications";
import { useToast } from "../context/ToastContext";
import { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts";
import {
  Badge,
  statusVariantMap,
  Skeleton,
  EmptyState,
  Button,
  Dialog,
} from "../components/ui";
import { ApplicationFormFields } from "../components/ApplicationFormFields";
import { formatDate, formatSalary, formatLocation } from "../utils/format";
import {
  createEmptyForm,
  FILTER_STATUSES,
  FILTER_SOURCES,
  SORT_OPTIONS,
} from "../constants/applications";
import type { Application, ApplicationFormData } from "../types";

const MODAL_DRAFT_KEY = "app-form-modal-draft";
const SAVE_DELAY = 1500;

function ApplicationsSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface p-4">
          <Skeleton width={70} height={22} className="rounded-full" />
          <div className="flex-1 space-y-1.5">
            <Skeleton width="40%" height={14} />
            <Skeleton width="25%" height={12} />
          </div>
          <Skeleton width={60} height={12} />
        </div>
      ))}
    </div>
  );
}

export function ApplicationsPage() {
  const [searchParams] = useSearchParams();
  const statusFromUrl = searchParams.get("status") || "All";

  const {
    applications,
    isLoading,
    error,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    sourceFilter,
    setSourceFilter,
    sortBy,
    setSortBy,
    deleteApplication,
    createApplication,
    updateApplication,
    total,
    page,
    totalPages,
    goToPage,
    refresh,
  } = useApplications({ initialStatus: statusFromUrl });

  const { addToast } = useToast();

  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Application | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form modal state
  const [formModal, setFormModal] = useState<{ open: boolean; editApp?: Application }>({ open: false });
  const [modalForm, setModalForm] = useState<ApplicationFormData>(createEmptyForm());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [modalDraftStatus, setModalDraftStatus] = useState<"saving" | "saved" | null>(null);
  const modalSaveTimerRef = useRef<ReturnType<typeof setTimeout>>();

  // Sync URL params to filter state
  useEffect(() => {
    const status = searchParams.get("status");
    if (status && status !== statusFilter) {
      setStatusFilter(status);
    }
  }, [searchParams, statusFilter, setStatusFilter]);

  // Restore draft when opening modal for new application
  useEffect(() => {
    if (formModal.open && !formModal.editApp) {
      try {
        const raw = localStorage.getItem(MODAL_DRAFT_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed._timestamp && Date.now() - parsed._timestamp < 86400000) {
            const { _timestamp, ...data } = parsed;
            setModalForm(data);
          } else {
            localStorage.removeItem(MODAL_DRAFT_KEY);
          }
        }
      } catch {}
    }
  }, [formModal.open, formModal.editApp]);

  // Debounce-save modal draft on form changes
  useEffect(() => {
    if (!formModal.open || formModal.editApp) return;
    if (modalSaveTimerRef.current) clearTimeout(modalSaveTimerRef.current);
    modalSaveTimerRef.current = setTimeout(() => {
      try {
        localStorage.setItem(
          MODAL_DRAFT_KEY,
          JSON.stringify({ ...modalForm, _timestamp: Date.now() })
        );
        setModalDraftStatus("saved");
        setTimeout(() => setModalDraftStatus(null), 2000);
      } catch {}
    }, SAVE_DELAY);
    setModalDraftStatus("saving");
    return () => {
      if (modalSaveTimerRef.current) clearTimeout(modalSaveTimerRef.current);
    };
  }, [modalForm, formModal.open, formModal.editApp]);

  const openFormModal = (app?: Application) => {
    if (app) {
      setModalForm({
        companyName: app.companyName,
        jobTitle: app.jobTitle,
        jobUrl: app.jobUrl || "",
        source: app.source,
        applicationDate: app.applicationDate.split("T")[0],
        status: app.status,
        notes: app.notes || "",
        jobDescription: app.jobDescription || "",
        resumeLink: app.resumeLink || "",
        interviewDate: app.interviewDate ? app.interviewDate.slice(0, 16) : "",
        salaryMin: app.salaryMin ? String(app.salaryMin) : "",
        salaryMax: app.salaryMax ? String(app.salaryMax) : "",
        salaryCurrency: app.salaryCurrency || "USD",
        location: app.location || "",
        employmentType: app.employmentType || "",
        remoteStatus: app.remoteStatus || "",
        companyLogo: app.companyLogo || "",
      });
      setFormModal({ open: true, editApp: app });
    } else {
      setModalForm(createEmptyForm());
      setFormModal({ open: true });
    }
    setFormError(null);
    setModalDraftStatus(null);
  };

  const updateFormField = <K extends keyof ApplicationFormData>(key: K, value: ApplicationFormData[K]) => {
    setModalForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleFormSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);
    try {
      if (formModal.editApp) {
        await updateApplication(formModal.editApp.id, modalForm);
      } else {
        await createApplication(modalForm);
      }
      localStorage.removeItem(MODAL_DRAFT_KEY);
      setFormModal({ open: false });
      addToast(
        formModal.editApp ? "Application updated" : "Application created",
        "success"
      );
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Something went wrong");
    }
    setIsSubmitting(false);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteApplication(deleteTarget.id);
      addToast("Application deleted", "success");
      setSelectedApp(null);
    } catch {
      addToast("Failed to delete application", "error");
    }
    setIsDeleting(false);
    setDeleteTarget(null);
  };

  const searchInputRef = useRef<HTMLInputElement>(null);

  // ── Keyboard shortcuts ──
  useKeyboardShortcuts([
    {
      keys: ["n"],
      handler: () => openFormModal(),
      ignoreWhenEditing: true,
    },
    {
      keys: ["/"],
      handler: () => searchInputRef.current?.focus(),
      ignoreWhenEditing: true,
    },
    {
      keys: ["escape"],
      handler: () => {
        if (formModal.open) setFormModal({ open: false });
        else if (selectedApp) setSelectedApp(null);
        else if (deleteTarget) setDeleteTarget(null);
      },
    },
  ]);

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("All");
    setSourceFilter("All");
    setSortBy("newest");
  };

  const filtersActive = search || statusFilter !== "All" || sourceFilter !== "All";

  return (
    <div className="py-5 lg:py-6 space-y-5">
      {/* Header row */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-base font-semibold text-ink dark:text-white/90">Applications</h1>
          <p className="mt-0.5 text-sm text-ink-secondary dark:text-white/50">{total} application{total !== 1 ? "s" : ""} tracked</p>
        </div>
        <Button
          size="sm"
          icon={
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          }
          onClick={() => openFormModal()}
        >
          New Application
        </Button>
      </div>

      {/* Unified toolbar — fixed widths so nothing shifts on selection */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <svg
            className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-tertiary dark:text-white/30"
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search by company, title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-300 dark:border-dark-border bg-white dark:bg-dark-surface py-1.5 pl-8 pr-2.5 text-sm text-ink dark:text-white/80 placeholder:text-ink-tertiary dark:placeholder:text-white/30 transition-all duration-150 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
          />
        </div>

        {/* Status filter — fixed width */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-36 rounded-lg border border-slate-300 dark:border-dark-border bg-white dark:bg-dark-surface px-2.5 py-1.5 text-sm text-ink dark:text-white/80 transition-all duration-150 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
        >
          {FILTER_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>

        {/* Source filter — fixed width */}
        <select
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value)}
          className="w-36 rounded-lg border border-slate-300 dark:border-dark-border bg-white dark:bg-dark-surface px-2.5 py-1.5 text-sm text-ink dark:text-white/80 transition-all duration-150 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
        >
          {FILTER_SOURCES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>

        {/* Sort — fixed width */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="w-28 rounded-lg border border-slate-300 dark:border-dark-border bg-white dark:bg-dark-surface px-2.5 py-1.5 text-sm text-ink dark:text-white/80 transition-all duration-150 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        {/* Clear filters */}
        {filtersActive && (
          <button
            onClick={clearFilters}
            className="text-xs font-medium text-ink-secondary dark:text-white/50 hover:text-ink dark:hover:text-white/80 transition-colors px-2"
          >
            Clear
          </button>
        )}
      </div>

      {/* Error State */}
      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-rose-200 dark:border-rose-500/20 bg-rose-50 dark:bg-rose-500/10 px-4 py-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-500/20 text-rose-500">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-rose-800 dark:text-rose-300">Failed to load applications</p>
            <p className="text-xs text-rose-600 dark:text-rose-400 mt-0.5">{error}</p>
          </div>
          <Button variant="secondary" size="sm" onClick={() => refresh()}>Retry</Button>
        </div>
      )}

      {/* Loading State */}
      {isLoading ? (
        <ApplicationsSkeleton />
      ) : applications.length === 0 ? (
        <EmptyState
          icon={
            filtersActive ? (
              <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            ) : (
              <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            )
          }
          title={filtersActive ? "No matching applications" : "No applications yet"}
          description={filtersActive ? "Try adjusting your search or filters" : "Add your first job application to start tracking"}
          action={{ label: filtersActive ? "Clear filters" : "Add Application", onClick: filtersActive ? clearFilters : () => openFormModal() }}
          tips={
            !filtersActive
              ? [
                  "Paste the full job description to keep details organized",
                  "Update status as you progress through each stage",
                  "Add a resume link to track which version you used",
                ]
              : undefined
          }
        />
      ) : (
        /* Applications List */
        <div className="space-y-1.5">
          {applications.map((app) => (
            <div
              key={app.id}
              className="group flex items-center gap-3 rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface px-4 py-3 transition-all duration-150 hover:border-slate-300 dark:hover:border-white/20 hover:shadow-sm"
            >
              {/* Status badge */}
              <Badge variant={statusVariantMap[app.status] || "default"} dot={false}>
                {app.status}
              </Badge>

              {/* Main info */}
              <button
                onClick={() => setSelectedApp(app)}
                className="min-w-0 flex-1 text-left"
              >
                <p className="truncate text-sm font-medium text-ink dark:text-white/80">{app.jobTitle}</p>
                <p className="truncate text-xs text-ink-secondary dark:text-white/50 mt-0.5">{app.companyName}</p>
                {(app.location || app.employmentType) && (
                  <p className="truncate text-[11px] text-ink-tertiary dark:text-white/40 mt-0.5">
                    {app.location}{app.location && app.employmentType ? " · " : ""}{app.employmentType}
                  </p>
                )}
              </button>

              {/* Metadata badges */}
              <div className="hidden items-center gap-2 sm:flex">
                {(() => {
                  const salary = formatSalary(app.salaryMin, app.salaryMax, app.salaryCurrency);
                  return salary ? (
                    <span className="inline-flex items-center rounded-md bg-emerald-50 dark:bg-emerald-500/10 px-1.5 py-0.5 text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
                      {salary}
                    </span>
                  ) : null;
                })()}
                {app.jobDescription && (
                  <span className="inline-flex items-center rounded-md bg-slate-100 dark:bg-white/5 px-1.5 py-0.5 text-[11px] font-medium text-ink-tertiary dark:text-white/40">
                    JD
                  </span>
                )}
                {app.resumeLink && (
                  <span className="inline-flex items-center rounded-md bg-slate-100 dark:bg-white/5 px-1.5 py-0.5 text-[11px] font-medium text-ink-tertiary dark:text-white/40">
                    Resume
                  </span>
                )}
                <span className="text-xs text-ink-tertiary dark:text-white/40">{formatDate(app.applicationDate)}</span>
              </div>

              {/* Actions */}
              <div className="relative flex items-center">
                <button
                  onClick={() => setSelectedApp(app)}
                  className="rounded-md p-1.5 text-ink-tertiary dark:text-white/30 opacity-0 group-hover:opacity-100 transition-all duration-150 hover:bg-surface-tertiary dark:hover:bg-white/5"
                  title="View details"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
                <button
                  onClick={() => openFormModal(app)}
                  className="rounded-md p-1.5 text-ink-tertiary dark:text-white/30 opacity-0 group-hover:opacity-100 transition-all duration-150 hover:bg-surface-tertiary dark:hover:bg-white/5"
                  title="Edit"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                  </svg>
                </button>
                <button
                  onClick={() => setDeleteTarget(app)}
                  className="rounded-md p-1.5 text-ink-tertiary dark:text-white/30 opacity-0 group-hover:opacity-100 transition-all duration-150 hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:text-rose-500"
                  title="Delete"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!isLoading && totalPages > 1 && (
        <div className="flex items-center justify-between pt-1">
          <p className="text-xs text-ink-tertiary dark:text-white/40">
            Page {page} of {totalPages}
            <span className="hidden sm:inline"> &middot; {total} total</span>
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => goToPage(page - 1)}
              disabled={page <= 1}
              className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-ink-secondary dark:text-white/50 transition-colors hover:bg-surface-tertiary dark:hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            {(() => {
              const pages: (number | "...")[] = [];
              const delta = 2;
              const left = Math.max(2, page - delta);
              const right = Math.min(totalPages - 1, page + delta);
              pages.push(1);
              if (left > 2) pages.push("...");
              for (let i = left; i <= right; i++) pages.push(i);
              if (right < totalPages - 1) pages.push("...");
              if (totalPages > 1) pages.push(totalPages);
              return pages;
            })().map((p, i) =>
              p === "..." ? (
                <span key={`e-${i}`} className="px-1.5 text-xs text-ink-tertiary dark:text-white/40">...</span>
              ) : (
                <button
                  key={p}
                  onClick={() => goToPage(p as number)}
                  className={`min-w-[1.75rem] rounded-lg px-1.5 py-1 text-xs font-medium transition-colors ${
                    p === page
                      ? "bg-brand-600 text-white shadow-sm"
                      : "text-ink-secondary dark:text-white/50 hover:bg-surface-tertiary dark:hover:bg-white/5"
                  }`}
                >
                  {p}
                </button>
              )
            )}
            <button
              onClick={() => goToPage(page + 1)}
              disabled={page >= totalPages}
              className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-ink-secondary dark:text-white/50 transition-colors hover:bg-surface-tertiary dark:hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Detail Slide-over */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setSelectedApp(null)} />
          <div className="relative w-full max-w-lg animate-slide-in-right bg-white dark:bg-dark-surface border-l border-slate-200 dark:border-dark-border shadow-dialog overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 dark:border-dark-border bg-white dark:bg-dark-surface px-5 py-4">
              <h2 className="text-sm font-semibold text-ink dark:text-white/90">{selectedApp.jobTitle}</h2>
              <button
                onClick={() => setSelectedApp(null)}
                className="rounded-lg p-1 text-ink-tertiary dark:text-white/40 hover:bg-surface-tertiary dark:hover:bg-white/5 transition-colors"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-5 space-y-5">
              {/* Company + Status */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-ink dark:text-white/80">{selectedApp.companyName}</p>
                  <p className="text-xs text-ink-secondary dark:text-white/50 mt-0.5">{selectedApp.source}</p>
                </div>
                <Badge variant={statusVariantMap[selectedApp.status] || "default"} dot={false}>
                  {selectedApp.status}
                </Badge>
              </div>

              {/* Key info grid */}
              <div className="grid grid-cols-2 gap-4 rounded-lg bg-surface-secondary dark:bg-white/[0.03] p-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-tertiary dark:text-white/40">Applied</p>
                  <p className="mt-0.5 text-sm font-medium text-ink dark:text-white/80">{formatDate(selectedApp.applicationDate)}</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-tertiary dark:text-white/40">Source</p>
                  <p className="mt-0.5 text-sm font-medium text-ink dark:text-white/80">{selectedApp.source}</p>
                </div>
                {selectedApp.location && (
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-tertiary dark:text-white/40">Location</p>
                    <p className="mt-0.5 text-sm font-medium text-ink dark:text-white/80">
                      {formatLocation(selectedApp.location, selectedApp.remoteStatus)}
                    </p>
                  </div>
                )}
                {selectedApp.employmentType && (
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-tertiary dark:text-white/40">Type</p>
                    <p className="mt-0.5 text-sm font-medium text-ink dark:text-white/80">{selectedApp.employmentType}</p>
                  </div>
                )}
                {(() => {
                  const salary = formatSalary(selectedApp.salaryMin, selectedApp.salaryMax, selectedApp.salaryCurrency);
                  return salary ? (
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-tertiary dark:text-white/40">Salary</p>
                      <p className="mt-0.5 text-sm font-medium text-ink dark:text-white/80">{salary}</p>
                    </div>
                  ) : null;
                })()}
              </div>

              {/* Job URL */}
              {selectedApp.jobUrl && (
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-tertiary dark:text-white/40 mb-1">Job URL</p>
                  <a href={selectedApp.jobUrl} target="_blank" rel="noopener noreferrer"
                    className="block truncate text-sm font-medium text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 hover:underline"
                  >{selectedApp.jobUrl}</a>
                </div>
              )}

              {/* Resume */}
              {selectedApp.resumeLink && (
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-tertiary dark:text-white/40 mb-1">Resume</p>
                  <a href={selectedApp.resumeLink} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                    </svg>
                    View Resume
                  </a>
                </div>
              )}

              {/* Interview Date */}
              {selectedApp.status === "Interview" && selectedApp.interviewDate && (
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-tertiary dark:text-white/40 mb-1.5">Interview</p>
                  <div className="flex items-center gap-2 rounded-lg bg-purple-50 dark:bg-purple-500/10 p-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                      </svg>
                    </span>
                    <div>
                      <p className="text-sm font-medium text-purple-800 dark:text-purple-300">
                        {new Date(selectedApp.interviewDate).toLocaleDateString("en-US", {
                          weekday: "long",
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                      <p className="text-xs text-purple-600 dark:text-purple-400">
                        {new Date(selectedApp.interviewDate).toLocaleTimeString("en-US", {
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Job Description */}
              {selectedApp.jobDescription && (
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-tertiary dark:text-white/40 mb-1.5">Job Description</p>
                  <div className="max-h-48 overflow-y-auto rounded-lg border border-slate-200 dark:border-dark-border bg-surface-secondary dark:bg-white/[0.03] p-3">
                    <p className="whitespace-pre-wrap text-sm text-ink dark:text-white/70">{selectedApp.jobDescription}</p>
                  </div>
                </div>
              )}

              {/* Notes */}
              {selectedApp.notes && (
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-tertiary dark:text-white/40 mb-1.5">Notes</p>
                  <p className="whitespace-pre-wrap text-sm text-ink dark:text-white/70">{selectedApp.notes}</p>
                </div>
              )}

              <p className="text-xs text-ink-tertiary dark:text-white/40 pt-2 border-t border-slate-100 dark:border-dark-border">
                Created {formatDate(selectedApp.createdAt)}
              </p>
            </div>

            {/* Footer actions */}
            <div className="sticky bottom-0 border-t border-slate-100 dark:border-dark-border bg-white dark:bg-dark-surface px-5 py-3 flex items-center justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => { const app = selectedApp; setSelectedApp(null); openFormModal(app); }}>
                Edit
              </Button>
              <Button variant="danger" size="sm" onClick={() => { setDeleteTarget(selectedApp); setSelectedApp(null); }}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Application?"
        description="This action cannot be undone. The application will be permanently removed."
        action={{ label: "Delete", variant: "danger", onClick: handleDelete, isLoading: isDeleting }}
        cancelLabel="Cancel"
      />

      {/* Create / Edit Form Modal */}
      {formModal.open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto pt-8 pb-12">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setFormModal({ open: false })} />
          <div className="relative w-full max-w-xl animate-scale-in rounded-2xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface shadow-dialog">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-dark-border px-5 py-4">
              <div className="flex items-center gap-3">
                <h2 className="text-sm font-semibold text-ink dark:text-white/90">
                  {formModal.editApp ? "Edit Application" : "New Application"}
                </h2>
                {!formModal.editApp && modalDraftStatus && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:text-emerald-400 animate-fade-in">
                    {modalDraftStatus === "saving" ? (
                      <svg className="h-2.5 w-2.5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    ) : (
                      <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                    {modalDraftStatus === "saving" ? "Saving" : "Saved"}
                  </span>
                )}
              </div>
              <button
                onClick={() => setFormModal({ open: false })}
                className="rounded-lg p-1 text-ink-tertiary dark:text-white/40 hover:bg-surface-tertiary dark:hover:bg-white/5 transition-colors"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-5 space-y-4">
              <ApplicationFormFields
                formData={modalForm}
                onChange={updateFormField}
              />

              {/* Error */}
              {formError && (
                <div className="rounded-lg border border-rose-200 dark:border-rose-500/20 bg-rose-50 dark:bg-rose-500/10 px-4 py-3">
                  <p className="text-sm text-rose-700 dark:text-rose-300">{formError}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-1 border-t border-slate-100 dark:border-dark-border">
                <Button type="button" variant="secondary" size="sm" onClick={() => setFormModal({ open: false })}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" isLoading={isSubmitting}>
                  {formModal.editApp ? "Save Changes" : "Create Application"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
