import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { applicationService } from "../services/applicationService";
import { useToast } from "../context/ToastContext";
import { Button } from "../components/ui";
import { ArrowLeft, Spinner, CheckCircle } from "@phosphor-icons/react";
import { ApplicationFormFields } from "../components/ApplicationFormFields";
import { createEmptyForm } from "../constants/applications";
import type { ApplicationFormData } from "../types";

const SAVE_DELAY = 1500;
const DRAFT_KEY = "app-form-draft";

export function ApplicationFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { addToast } = useToast();
  const isEditing = !!id;

  const [formData, setFormData] = useState<ApplicationFormData>(createEmptyForm());

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(isEditing);
  const [error, setError] = useState<string | null>(null);
  const [draftStatus, setDraftStatus] = useState<"saving" | "saved" | null>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout>>();

  // Restore draft for new forms
  useEffect(() => {
    if (isEditing) return;
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed._timestamp && Date.now() - parsed._timestamp < 86400000) {
          const { _timestamp, ...data } = parsed;
          setFormData(data);
        } else {
          localStorage.removeItem(DRAFT_KEY);
        }
      }
    } catch {}
  }, [isEditing]);

  // Debounce-save draft on form changes
  useEffect(() => {
    if (isEditing) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      try {
        localStorage.setItem(
          DRAFT_KEY,
          JSON.stringify({ ...formData, _timestamp: Date.now() })
        );
        setDraftStatus("saved");
        setTimeout(() => setDraftStatus(null), 2000);
      } catch {}
    }, SAVE_DELAY);
    setDraftStatus("saving");
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [formData, isEditing]);

  useEffect(() => {
    if (isEditing && id) {
      applicationService
        .getById(id)
        .then((app) => {
          setFormData({
            companyName: app.companyName,
            jobTitle: app.jobTitle,
            jobUrl: app.jobUrl || "",
            source: app.source,
            applicationDate: app.applicationDate.split("T")[0],
            status: app.status,
            notes: app.notes || "",
            jobDescription: app.jobDescription || "",
            resumeLink: app.resumeLink || "",
            resumeText: app.resumeText || "",
            interviewDate: app.interviewDate ? app.interviewDate.slice(0, 16) : "",
            salaryMin: app.salaryMin ? String(app.salaryMin) : "",
            salaryMax: app.salaryMax ? String(app.salaryMax) : "",
            salaryCurrency: app.salaryCurrency || "USD",
            location: app.location || "",
            employmentType: app.employmentType || "",
            remoteStatus: app.remoteStatus || "",
            companyLogo: app.companyLogo || "",
          });
        })
        .catch((err) => setError(err.message))
        .finally(() => setIsLoading(false));
    }
  }, [id, isEditing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      if (isEditing && id) {
        await applicationService.update(id, formData);
        addToast("Application updated", "success");
      } else {
        await applicationService.create(formData);
        addToast("Application created", "success");
        localStorage.removeItem(DRAFT_KEY);
      }
      navigate("/applications");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateField = <K extends keyof ApplicationFormData>(key: K, value: ApplicationFormData[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  if (isLoading) {
    return (
      <div className="py-5 lg:py-6 space-y-6">
        <div className="h-5 w-40 animate-pulse rounded bg-slate-200 dark:bg-white/10" />
        <div className="h-[30rem] animate-pulse rounded-xl bg-slate-200 dark:bg-white/5" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl py-5 lg:py-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate("/applications")}
          className="inline-flex items-center gap-1 text-xs font-medium text-ink-tertiary dark:text-white/40 hover:text-ink-secondary dark:hover:text-white/60 transition-colors mb-3"
        >
          <ArrowLeft size={14} />
          Back to applications
        </button>
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <h1 className="text-base font-semibold text-ink dark:text-white/90">
              {isEditing ? "Edit Application" : "New Application"}
            </h1>
            <p className="mt-0.5 text-sm text-ink-secondary dark:text-white/50">
              {isEditing ? "Update the details of your job application" : "Record a new job application to track"}
            </p>
          </div>
          {!isEditing && draftStatus && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-400 animate-fade-in">
              {draftStatus === "saving" ? (
                <Spinner size={12} className="animate-spin" />
              ) : (
                <CheckCircle size={12} />
              )}
              Draft {draftStatus === "saving" ? "saving..." : "saved"}
            </span>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <ApplicationFormFields
          formData={formData}
          onChange={updateField}
          wideLayout
        />

        {/* Error */}
        {error && (
          <div className="rounded-lg border border-rose-200 dark:border-rose-500/20 bg-rose-50 dark:bg-rose-500/10 px-4 py-3">
            <p className="text-sm text-rose-700 dark:text-rose-300">{error}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-1">
          <Button type="button" variant="secondary" onClick={() => navigate("/applications")}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            {isEditing ? "Save Changes" : "Create Application"}
          </Button>
        </div>
      </form>
    </div>
  );
}
