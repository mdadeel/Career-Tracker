import type { ApplicationFormData, ApplicationSource, ApplicationStatus } from "../types";
import { Input, Select, Textarea } from "./ui";
import {
  SOURCE_OPTIONS,
  STATUS_OPTIONS,
  EMPLOYMENT_TYPE_OPTIONS,
  REMOTE_STATUS_OPTIONS,
  SALARY_CURRENCY_OPTIONS,
} from "../constants/applications";

import { AiJdParserBox } from "./AiJdParserBox";
import type { ParsedJd } from "../services/ai.service";

interface ApplicationFormFieldsProps {
  formData: ApplicationFormData;
  onChange: <K extends keyof ApplicationFormData>(key: K, value: ApplicationFormData[K]) => void;
  errors?: Record<string, string>;
  /** When true, renders the two-column Basic Information + Documents layout */
  wideLayout?: boolean;
}

/**
 * Reusable form fields for creating and editing job applications.
 * Used both in the page-level form (ApplicationFormPage) and
 * the modal form (ApplicationsPage) to eliminate duplication.
 */
export function ApplicationFormFields({
  formData,
  onChange,
  errors,
  wideLayout = false,
}: ApplicationFormFieldsProps) {
  const getError = (field: string) =>
    errors && Object.prototype.hasOwnProperty.call(errors, field) ? errors[field] : undefined;

  const handleAiParsed = (parsed: ParsedJd, rawJd: string) => {
    if (parsed.companyName && parsed.companyName !== "Unknown") onChange("companyName", parsed.companyName);
    if (parsed.jobTitle && parsed.jobTitle !== "Unknown") onChange("jobTitle", parsed.jobTitle);
    if (parsed.location) onChange("location", parsed.location);
    if (parsed.salaryMin) onChange("salaryMin", String(parsed.salaryMin));
    if (parsed.salaryMax) onChange("salaryMax", String(parsed.salaryMax));
    if (parsed.salaryCurrency) onChange("salaryCurrency", parsed.salaryCurrency);
    if (parsed.employmentType) onChange("employmentType", parsed.employmentType);
    if (parsed.remoteStatus) onChange("remoteStatus", parsed.remoteStatus);
    if (rawJd) onChange("jobDescription", rawJd);
  };

  const fields = (
    <>
      {/* Company & Title */}
      <Input
        label="Company Name"
        required
        value={formData.companyName}
        onChange={(e) => onChange("companyName", e.target.value)}
        placeholder="e.g. Google, Meta, Local Startup"
        error={getError("companyName")}
      />
      <Input
        label="Job Title"
        required
        value={formData.jobTitle}
        onChange={(e) => onChange("jobTitle", e.target.value)}
        placeholder="e.g. Software Engineer, Product Manager"
        error={getError("jobTitle")}
      />
      <Input
        label="Job Post URL"
        type="url"
        value={formData.jobUrl}
        onChange={(e) => onChange("jobUrl", e.target.value)}
        placeholder="https://..."
        error={getError("jobUrl")}
      />

      {/* Source, Date */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Select
          label="Source"
          required
          value={formData.source}
          onChange={(e) => onChange("source", e.target.value as ApplicationSource)}
          options={SOURCE_OPTIONS}
          error={getError("source")}
        />
        <Input
          label="Application Date"
          type="date"
          required
          value={formData.applicationDate}
          onChange={(e) => onChange("applicationDate", e.target.value)}
          error={getError("applicationDate")}
        />
      </div>
      <Select
        label="Status"
        required
        value={formData.status}
        onChange={(e) => onChange("status", e.target.value as ApplicationStatus)}
        options={STATUS_OPTIONS}
        error={getError("status")}
      />

      {/* Location & Remote */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Location"
          value={formData.location}
          onChange={(e) => onChange("location", e.target.value)}
          placeholder="e.g. San Francisco, CA"
        />
        <Select
          label="Remote Status"
          value={formData.remoteStatus}
          onChange={(e) => onChange("remoteStatus", e.target.value)}
          options={REMOTE_STATUS_OPTIONS}
        />
      </div>

      {/* Employment Type */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Select
          label="Employment Type"
          value={formData.employmentType}
          onChange={(e) => onChange("employmentType", e.target.value)}
          options={EMPLOYMENT_TYPE_OPTIONS}
        />
        <Select
          label="Salary Currency"
          value={formData.salaryCurrency}
          onChange={(e) => onChange("salaryCurrency", e.target.value)}
          options={SALARY_CURRENCY_OPTIONS}
        />
      </div>

      {/* Salary Range */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Salary Min"
          type="number"
          min={0}
          value={formData.salaryMin}
          onChange={(e) => onChange("salaryMin", e.target.value)}
          placeholder="e.g. 80000"
        />
        <Input
          label="Salary Max"
          type="number"
          min={0}
          value={formData.salaryMax}
          onChange={(e) => onChange("salaryMax", e.target.value)}
          placeholder="e.g. 120000"
        />
      </div>

      {/* Company Logo URL */}
      <Input
        label="Company Logo URL"
        type="url"
        value={formData.companyLogo}
        onChange={(e) => onChange("companyLogo", e.target.value)}
        placeholder="https://logo.clearbit.com/company.com"
      />
    </>
  );

  const documentsSection = (
    <>
      <Textarea
        label="Job Description"
        value={formData.jobDescription}
        onChange={(e) => onChange("jobDescription", e.target.value)}
        placeholder="Paste the full job description here..."
        rows={wideLayout ? 5 : 4}
        showCharCount
      />
      <Textarea
        label="Custom Resume Text (Optional)"
        value={formData.resumeText}
        onChange={(e) => onChange("resumeText", e.target.value)}
        placeholder="Paste custom resume text tailored for this role (overrides default profile)..."
        rows={wideLayout ? 4 : 3}
        showCharCount
      />
      <Input
        label="Resume Link"
        type="url"
        value={formData.resumeLink}
        onChange={(e) => onChange("resumeLink", e.target.value)}
        placeholder="https://drive.google.com/your-resume..."
      />
    </>
  );

  const interviewSection = formData.status === "Interview" && (
    <div className="rounded-lg border border-purple-200 dark:border-purple-500/20 bg-purple-50/50 dark:bg-purple-500/[0.04] p-3">
      <p className="text-xs font-semibold text-purple-700 dark:text-purple-400 mb-3">Interview Details</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Date"
          type="date"
          value={formData.interviewDate?.split("T")[0] || ""}
          onChange={(e) => {
            const date = e.target.value;
            const time = formData.interviewDate?.split("T")[1] || "10:00";
            onChange("interviewDate", date ? `${date}T${time}` : "");
          }}
        />
        <Input
          label="Time"
          type="time"
          value={formData.interviewDate?.split("T")[1]?.slice(0, 5) || ""}
          onChange={(e) => {
            const date = formData.interviewDate?.split("T")[0] || "";
            onChange("interviewDate", date ? `${date}T${e.target.value}` : "");
          }}
        />
      </div>
    </div>
  );

  const notesSection = (
    <Textarea
      label="Notes"
      value={formData.notes}
      onChange={(e) => onChange("notes", e.target.value)}
      placeholder="Job requirements, contacts, interview notes..."
      rows={wideLayout ? 4 : 3}
      showCharCount
    />
  );

  if (wideLayout) {
    return (
      <>
        <AiJdParserBox onParsed={handleAiParsed} />
        {/* Basic Information + Documents — side by side */}
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface">
            <div className="px-5 py-3.5 border-b border-slate-100 dark:border-dark-border">
              <h2 className="text-sm font-semibold text-ink dark:text-white/90">Basic Information</h2>
            </div>
            <div className="p-5 space-y-4">{fields}</div>
          </div>
          <div className="rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface">
            <div className="px-5 py-3.5 border-b border-slate-100 dark:border-dark-border">
              <h2 className="text-sm font-semibold text-ink dark:text-white/90">Documents</h2>
            </div>
            <div className="p-5 space-y-4">{documentsSection}</div>
          </div>
        </div>

        {interviewSection}

        {/* Notes */}
        <div className="rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface">
          <div className="px-5 py-3.5 border-b border-slate-100 dark:border-dark-border">
            <h2 className="text-sm font-semibold text-ink dark:text-white/90">Notes</h2>
          </div>
          <div className="p-5">{notesSection}</div>
        </div>
      </>
    );
  }

  return (
    <div className="space-y-4">
      {fields}

      {interviewSection}

      <Textarea
        label="Job Description"
        value={formData.jobDescription}
        onChange={(e) => onChange("jobDescription", e.target.value)}
        placeholder="Paste the full job description here..."
        rows={4}
        showCharCount
      />

      <Input
        label="Resume Link"
        type="url"
        value={formData.resumeLink}
        onChange={(e) => onChange("resumeLink", e.target.value)}
        placeholder="https://drive.google.com/your-resume..."
      />

      {notesSection}
    </div>
  );
}
