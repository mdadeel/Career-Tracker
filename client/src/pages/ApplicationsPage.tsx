import { useState, useEffect, useRef, useCallback, lazy, Suspense, memo, type FormEvent } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useApplications } from "../hooks/useApplications";
import { useToast } from "../context/ToastContext";
import {
  Badge,
  statusVariantMap,
  Skeleton,
  EmptyState,
  Button,
  Dialog,
  SparkleIcon,
  ToggleGroup,
  Alert,
} from "../components/ui";
import { ApplicationRow } from "../components/ApplicationRow";
import { ApplicationFormFields } from "../components/ApplicationFormFields";
import { AiAssistantDrawer } from "../components/AiAssistantDrawer";
import type { Application, ApplicationFormData } from "../types";
import {
  Plus,
  MagnifyingGlass,
  FileText,
  CaretLeft,
  CaretRight,
  X,
  ArrowUp,
  CalendarBlank,
  Spinner,
  CheckCircle,
  List,
  SquaresFour,
  Bookmark,
} from "@phosphor-icons/react";

const PipelinePage = lazy(() => import("./PipelinePage").then((m) => ({ default: m.PipelinePage })));
import { aiService } from "../services/ai.service";
import { api } from "../services/api";
import { formatDate, formatSalary, formatLocation } from "../utils/format";
import {
  createEmptyForm,
  FILTER_STATUSES,
  FILTER_SOURCES,
  SORT_OPTIONS,
} from "../constants/applications";

const ApplicationListItem = memo(function ApplicationListItem({
  app,
  onView,
  onEdit,
  onDelete,
  onAnalyzeMatch,
}: {
  app: Application;
  onView: (app: Application) => void;
  onEdit: (app: Application) => void;
  onDelete: (app: Application) => void;
  onAnalyzeMatch: (id: string) => void;
}) {
  return (
    <ApplicationRow
      application={app}
      onView={() => onView(app)}
      onEdit={() => onEdit(app)}
      onDelete={() => onDelete(app)}
      onAnalyzeMatch={() => onAnalyzeMatch(app.id)}
    />
  );
});

const MODAL_DRAFT_KEY = "app-form-modal-draft";
const SAVE_DELAY = 1500;

function ApplicationsSkeleton() {
  return (
    <div className="space-y-2" aria-busy="true" aria-label="Loading applications">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface px-3 py-2.5">
          <div className="h-9 w-9 rounded-lg bg-slate-100 dark:bg-white/5" />
          <div className="flex-1 space-y-1.5">
            <Skeleton width="35%" height={14} />
            <Skeleton width="20%" height={12} />
          </div>
          <Skeleton width={50} height={16} className="rounded-md" />
          <Skeleton width={50} height={16} className="rounded-md" />
        </div>
      ))}
    </div>
  );
}

export function ApplicationsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const statusFromUrl = searchParams.get("status") || "All";
  const viewFromUrl = searchParams.get("view") || "list";

  const [activeView, setActiveView] = useState<"list" | "board" | "saved">(
    viewFromUrl === "board" ? "board" : statusFromUrl === "Saved" ? "saved" : "list"
  );

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

  // Auto-open application if ?id=... is present in URL query string
  useEffect(() => {
    const appId = searchParams.get("id") || searchParams.get("appId");
    if (appId && applications.length > 0) {
      const found = applications.find((a) => a.id === appId);
      if (found) {
        setSelectedApp(found);
      }
    }
  }, [searchParams, applications]);

  // Sync URL params to filter & view state
  useEffect(() => {
    const viewParam = searchParams.get("view");
    const statusParam = searchParams.get("status");

    if (viewParam === "board") {
      setActiveView("board");
    } else if (statusParam === "Saved") {
      setActiveView("saved");
      if (statusFilter !== "Saved") setStatusFilter("Saved");
    } else if (!viewParam && statusParam !== "Saved") {
      setActiveView("list");
      if (statusFilter === "Saved") setStatusFilter("All");
    }
  }, [searchParams]);

  const handleSwitchView = (newView: "list" | "board" | "saved") => {
    setActiveView(newView);
    const newParams = new URLSearchParams(searchParams);
    if (newView === "board") {
      newParams.set("view", "board");
      newParams.delete("status");
    } else if (newView === "saved") {
      newParams.delete("view");
      newParams.set("status", "Saved");
      setStatusFilter("Saved");
    } else {
      newParams.delete("view");
      newParams.delete("status");
      setStatusFilter("All");
    }
    setSearchParams(newParams);
  };

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

  const openFormModal = useCallback(async (app?: Application) => {
    if (app) {
      let data = app;
      try {
        data = await api.get<Application>(`/applications/${app.id}`);
      } catch {}
      setModalForm({
        companyName: data.companyName,
        jobTitle: data.jobTitle,
        jobUrl: data.jobUrl || "",
        source: data.source,
        applicationDate: data.applicationDate.split("T")[0],
        status: data.status,
        notes: data.notes || "",
        jobDescription: data.jobDescription || "",
        resumeLink: data.resumeLink || "",
        resumeText: data.resumeText || "",
        interviewDate: data.interviewDate ? data.interviewDate.slice(0, 16) : "",
        salaryMin: data.salaryMin ? String(data.salaryMin) : "",
        salaryMax: data.salaryMax ? String(data.salaryMax) : "",
        salaryCurrency: data.salaryCurrency || "USD",
        location: data.location || "",
        employmentType: data.employmentType || "",
        remoteStatus: data.remoteStatus || "",
        companyLogo: data.companyLogo || "",
      });
      setFormModal({ open: true, editApp: app });
    } else {
      setModalForm(createEmptyForm());
      setFormModal({ open: true });
    }
    setFormError(null);
    setModalDraftStatus(null);
  }, []);

  const handleView = useCallback((app: Application) => setSelectedApp(app), []);
  const handleDeleteTarget = useCallback((app: Application) => setDeleteTarget(app), []);
  const handleAnalyzeMatch = useCallback(async (id: string) => {
    try {
      addToast("Analyzing AI match score in background...", "info");
      await aiService.analyzeMatch(id);
      addToast("Match score updated!", "success");
      refresh();
    } catch (err: unknown) {
      addToast(err instanceof Error ? err.message : "Failed to analyze match score.", "error");
    }
  }, [addToast, refresh]);

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

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("All");
    setSourceFilter("All");
    setSortBy("newest");
  };

  const filtersActive = search || statusFilter !== "All" || sourceFilter !== "All";

  return (
    <div className="mx-auto max-w-5xl py-5 lg:py-6 space-y-5">
      {/* Header row */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-base font-semibold text-ink dark:text-white/90">Applications Hub</h1>
          <p className="mt-0.5 text-sm text-ink-secondary dark:text-white/50">{total} application{total !== 1 ? "s" : ""} tracked</p>
        </div>

        {/* View Switcher — reusable segmented control */}
        <ToggleGroup
          ariaLabel="View applications as"
          value={activeView}
          onChange={(v) => handleSwitchView(v)}
          options={[
            { value: "list", label: "List View", icon: <List size={15} weight="bold" /> },
            { value: "board", label: "Kanban Board", icon: <SquaresFour size={15} weight="bold" /> },
            { value: "saved", label: "Saved Jobs", icon: <Bookmark size={15} weight="bold" /> },
          ]}
        />

        <Button
          size="sm"
          icon={<Plus size={14} />}
          onClick={() => openFormModal()}
        >
          New Application
        </Button>
      </div>

      {/* Unified toolbar — fixed widths so nothing shifts on selection */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <MagnifyingGlass size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-tertiary dark:text-white/30" />
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

      {/* Error State — reusable Alert callout */}
      {error && (
        <Alert
          variant="error"
          title="Failed to load applications"
          action={
            <Button variant="secondary" size="sm" onClick={() => refresh()}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {/* Board / Kanban View */}
      {activeView === "board" ? (
        <Suspense fallback={<ApplicationsSkeleton />}>
          <PipelinePage />
        </Suspense>
      ) : isLoading ? (
        <ApplicationsSkeleton />
      ) : applications.length === 0 ? (
        <EmptyState
          icon={
            filtersActive ? <MagnifyingGlass size={28} /> : <FileText size={28} />
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
          {/* Column headers - hidden on mobile */}
          <div className="hidden md:flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-200/50 dark:bg-dark-surface/60 border border-slate-200 dark:border-dark-border/60 text-[10px] font-semibold uppercase tracking-wider text-ink-tertiary dark:text-white/40 mb-1">
            <div className="w-[45px] shrink-0" />
            <div className="flex-1 min-w-0 pl-2">Role</div>
            <div className="w-24 shrink-0 text-center">Status</div>
            <div className="w-20 shrink-0 text-center">Source</div>
            <div className="w-24 shrink-0 text-center">AI Match</div>
            <div className="w-12 shrink-0 text-center">Resume</div>
            <div className="w-20 shrink-0 text-right">Date</div>
            <div className="w-[72px] shrink-0" />
          </div>
          {applications.map((app) => (
            <ApplicationListItem
              key={app.id}
              app={app}
              onView={handleView}
              onEdit={openFormModal}
              onDelete={handleDeleteTarget}
              onAnalyzeMatch={handleAnalyzeMatch}
            />
          ))}
        </div>
      )}

      {/* Pagination — nav landmark with aria-current=page per the pagination pattern */}
      {activeView !== "board" && !isLoading && totalPages > 1 && (
        <nav aria-label="pagination" className="flex items-center justify-between pt-1">
          <p className="text-xs text-ink-tertiary dark:text-white/40">
            Page {page} of {totalPages}
            <span className="hidden sm:inline"> &middot; {total} total</span>
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => goToPage(page - 1)}
              disabled={page <= 1}
              aria-label="Previous page"
              className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-ink-secondary dark:text-white/50 transition-colors hover:bg-surface-tertiary dark:hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <CaretLeft size={14} />
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
                <span key={`e-${i}`} className="px-1.5 text-xs text-ink-tertiary dark:text-white/40" aria-hidden="true">...</span>
              ) : (
                <button
                  key={p}
                  onClick={() => goToPage(p as number)}
                  aria-current={p === page ? "page" : undefined}
                  aria-label={`Page ${p}`}
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
              aria-label="Next page"
              className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-ink-secondary dark:text-white/50 transition-colors hover:bg-surface-tertiary dark:hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <CaretRight size={14} />
            </button>
          </div>
        </nav>
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
                <X size={16} />
              </button>
            </div>

            <div className="p-5 space-y-5">
              {/* Status Stepper */}
              <div className="flex items-center justify-between px-1">
                {["Saved", "Applied", "Assessment", "Interview", "Offer"].map((s, i) => {
                  const statuses = ["Saved", "Applied", "Assessment", "Interview", "Offer"];
                  const currentIdx = statuses.indexOf(selectedApp.status);
                  const isActive = i <= currentIdx;
                  const isCurrent = selectedApp.status === s;
                  return (
                    <button
                      key={s}
                      onClick={() => {}}
                      className={`flex flex-col items-center gap-1 transition-opacity ${isCurrent ? "" : "opacity-50 hover:opacity-80"}`}
                      title={`Change status to ${s}`}
                    >
                      <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-bold ${
                        isCurrent
                          ? "bg-brand-600 text-white ring-2 ring-brand-200 dark:ring-brand-800"
                          : isActive
                          ? "bg-brand-100 dark:bg-brand-500/20 text-brand-600 dark:text-brand-400"
                          : "bg-slate-100 dark:bg-white/10 text-slate-400 dark:text-white/40"
                      }`}>
                        {i + 1}
                      </span>
                      <span className="text-[8px] font-medium text-ink-tertiary dark:text-white/40 whitespace-nowrap">{s}</span>
                    </button>
                  );
                })}
              </div>

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

              {/* Activity Timeline */}
              <div className="rounded-lg bg-surface-secondary dark:bg-white/[0.03] p-3 space-y-1.5">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-tertiary dark:text-white/40">Activity</p>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-[11px]">
                    <span className="h-1.5 w-1.5 rounded-full bg-brand-500 shrink-0" />
                    <span className="text-ink dark:text-white/70">Status: {selectedApp.status}</span>
                    <span className="ml-auto text-ink-tertiary dark:text-white/40">{formatDate(selectedApp.updatedAt)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px]">
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-300 dark:bg-white/20 shrink-0" />
                    <span className="text-ink-secondary dark:text-white/50">Application created</span>
                    <span className="ml-auto text-ink-tertiary dark:text-white/40">{formatDate(selectedApp.createdAt)}</span>
                  </div>
                </div>
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
              {(selectedApp.resumeLink || selectedApp.resumeId) && (
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-tertiary dark:text-white/40 mb-1">Resume</p>
                  {selectedApp.resumeId && (
                    <p className="inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 mb-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      Resume attached
                    </p>
                  )}
                  {selectedApp.resumeLink && (
                    <a href={selectedApp.resumeLink} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300"
                    >
                      <ArrowUp size={16} />
                      View Resume
                    </a>
                  )}
                </div>
              )}

              {/* Interview Date */}
              {selectedApp.status === "Interview" && selectedApp.interviewDate && (
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-tertiary dark:text-white/40 mb-1.5">Interview</p>
                  <div className="flex items-center gap-2 rounded-lg bg-purple-50 dark:bg-purple-500/10 p-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400">
                      <CalendarBlank size={16} />
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

              {/* Job Description - scrollable */}
              {selectedApp.jobDescription && (
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-tertiary dark:text-white/40 mb-1.5">Job Description</p>
                  <div className="max-h-60 overflow-y-auto rounded-lg border border-slate-200 dark:border-dark-border bg-surface-secondary dark:bg-white/[0.03] p-3">
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

              {/* AI Assistant Drawer */}
              <AiAssistantDrawer
                applicationId={selectedApp.id}
                jobTitle={selectedApp.jobTitle}
                companyName={selectedApp.companyName}
              />

              <p className="text-xs text-ink-tertiary dark:text-white/40 pt-2 border-t border-slate-100 dark:border-dark-border">
                Created {formatDate(selectedApp.createdAt)}
              </p>
            </div>

            {/* Footer actions - consolidated AI button */}
            <div className="sticky bottom-0 border-t border-slate-100 dark:border-dark-border bg-white dark:bg-dark-surface px-5 py-3 flex items-center justify-between gap-2">
              <Button
                variant="primary"
                size="sm"
                onClick={() => { const id = selectedApp.id; setSelectedApp(null); navigate(`/applications/${id}/copilot`); }}
                className="gap-1.5"
              >
                <SparkleIcon className="w-3.5 h-3.5" />
                Open AI Workspace
              </Button>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => { const app = selectedApp; setSelectedApp(null); openFormModal(app); }}>
                  Edit
                </Button>
                <Button variant="danger" size="sm" onClick={() => { setDeleteTarget(selectedApp); setSelectedApp(null); }}>
                  Delete
                </Button>
              </div>
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
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400 animate-fade-in">
                    {modalDraftStatus === "saving" ? (
                      <Spinner size={10} className="animate-spin" />
                    ) : (
                      <CheckCircle size={10} />
                    )}
                    {modalDraftStatus === "saving" ? "Saving" : "Saved"}
                  </span>
                )}
              </div>
              <button
                onClick={() => setFormModal({ open: false })}
                className="rounded-lg p-1 text-ink-tertiary dark:text-white/40 hover:bg-surface-tertiary dark:hover:bg-white/5 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-5 space-y-4">
              <ApplicationFormFields
                formData={modalForm}
                onChange={updateFormField}
                wideLayout
              />

              {/* Error — reusable Alert callout */}
              {formError && <Alert variant="error">{formError}</Alert>}

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
