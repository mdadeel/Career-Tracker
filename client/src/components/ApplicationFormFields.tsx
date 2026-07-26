import { useState } from "react";
import type { ApplicationFormData, ApplicationSource, ApplicationStatus } from "../types";
import { Input, Select, Textarea } from "./ui";
import { ResumeSelector } from "./ResumeSelector";
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
  wideLayout?: boolean;
}

function CollapsibleSection({ id, title, defaultOpen = true, children }: { id?: string; title: string; defaultOpen?: boolean; children: React.ReactNode }) {
  return (
    <details open={defaultOpen} className="group rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface overflow-hidden shadow-sm">
      <summary
        id={id}
        className="flex cursor-pointer items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-dark-border list-none hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors"
      >
        <h2 className="text-sm font-semibold text-ink dark:text-white/90">{title}</h2>
        <span className="text-ink-tertiary dark:text-white/40 group-open:rotate-180 transition-transform duration-200">▾</span>
      </summary>
      <div className="p-6 space-y-5">{children}</div>
    </details>
  );
}

function SectionDivider() {
  return <div className="border-t border-slate-100 dark:border-white/5" />;
}

export function ApplicationFormFields({
  formData,
  onChange,
  errors,
  wideLayout = false,
}: ApplicationFormFieldsProps) {
  const getError = (field: string) =>
    errors && Object.prototype.hasOwnProperty.call(errors, field) ? errors[field] : undefined;

  const [showAdvancedRole, setShowAdvancedRole] = useState(false);
  const [showAdvancedComp, setShowAdvancedComp] = useState(false);

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

  const interviewSection = formData.status === "Interview" && (
    <div className="rounded-lg border border-purple-200 dark:border-purple-500/20 bg-purple-50/50 dark:bg-purple-500/[0.04] p-4">
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

  const hasResumeSelected = !!formData.resumeId;

  if (wideLayout) {
    return (
      <>
        <AiJdParserBox onParsed={handleAiParsed} compact />

        <CollapsibleSection id="role-details-section" title="Role Details">
          <div className="grid gap-5 sm:grid-cols-2">
            <Input label="Company Name" required value={formData.companyName} onChange={(e) => onChange("companyName", e.target.value)} placeholder="e.g. Google, Meta, Local Startup" error={getError("companyName")} />
            <Input label="Job Title" required value={formData.jobTitle} onChange={(e) => onChange("jobTitle", e.target.value)} placeholder="e.g. Software Engineer, Product Manager" error={getError("jobTitle")} />
          </div>

          <SectionDivider />

          <div className="grid gap-5 sm:grid-cols-2">
            <Select label="Source" required value={formData.source} onChange={(e) => onChange("source", e.target.value as ApplicationSource)} options={SOURCE_OPTIONS} error={getError("source")} />
            <Input label="Application Date" type="date" required value={formData.applicationDate} onChange={(e) => onChange("applicationDate", e.target.value)} error={getError("applicationDate")} />
          </div>
          <Select label="Status" required value={formData.status} onChange={(e) => onChange("status", e.target.value as ApplicationStatus)} options={STATUS_OPTIONS} error={getError("status")} />

          <SectionDivider />

          <div className="grid gap-5 sm:grid-cols-2">
            <Input label="Location" value={formData.location} onChange={(e) => onChange("location", e.target.value)} placeholder="e.g. San Francisco, CA" />
            <Select label="Remote Status" value={formData.remoteStatus} onChange={(e) => onChange("remoteStatus", e.target.value)} options={REMOTE_STATUS_OPTIONS} />
          </div>
          <Select label="Employment Type" value={formData.employmentType} onChange={(e) => onChange("employmentType", e.target.value)} options={EMPLOYMENT_TYPE_OPTIONS} />

          {showAdvancedRole ? (
            <>
              <SectionDivider />
              <div className="space-y-5">
                <p className="text-[11px] font-medium text-ink-tertiary uppercase tracking-wider">Advanced</p>
                <Input label="Job Post URL" type="url" value={formData.jobUrl} onChange={(e) => onChange("jobUrl", e.target.value)} placeholder="https://..." error={getError("jobUrl")} />
              </div>
              <button
                type="button"
                onClick={() => setShowAdvancedRole(false)}
                className="text-xs font-medium text-ink-tertiary hover:text-ink-secondary transition-colors"
              >
                &minus; Hide advanced fields
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setShowAdvancedRole(true)}
              className="text-xs font-medium text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 transition-colors"
            >
              + Show advanced fields
            </button>
          )}
        </CollapsibleSection>

        <CollapsibleSection title="Compensation" defaultOpen={false}>
          <div className="grid gap-5 sm:grid-cols-3">
            <Input label="Salary Min" type="number" min={0} value={formData.salaryMin} onChange={(e) => onChange("salaryMin", e.target.value)} placeholder="e.g. 80000" />
            <Input label="Salary Max" type="number" min={0} value={formData.salaryMax} onChange={(e) => onChange("salaryMax", e.target.value)} placeholder="e.g. 120000" />
            <Select label="Currency" value={formData.salaryCurrency} onChange={(e) => onChange("salaryCurrency", e.target.value)} options={SALARY_CURRENCY_OPTIONS} />
          </div>

          {showAdvancedComp ? (
            <>
              <SectionDivider />
              <div className="space-y-5">
                <p className="text-[11px] font-medium text-ink-tertiary uppercase tracking-wider">Advanced</p>
                <Input label="Company Logo URL" type="url" value={formData.companyLogo} onChange={(e) => onChange("companyLogo", e.target.value)} placeholder="https://logo.clearbit.com/company.com" />
              </div>
              <button
                type="button"
                onClick={() => setShowAdvancedComp(false)}
                className="text-xs font-medium text-ink-tertiary hover:text-ink-secondary transition-colors"
              >
                &minus; Hide advanced fields
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setShowAdvancedComp(true)}
              className="text-xs font-medium text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 transition-colors"
            >
              + Show advanced fields
            </button>
          )}
        </CollapsibleSection>

        <CollapsibleSection title="Documents" defaultOpen={false}>
          <Textarea label="Job Description" value={formData.jobDescription} onChange={(e) => onChange("jobDescription", e.target.value)} placeholder="Paste the full job description here..." rows={5} showCharCount />
          <div>
            <label className="block text-xs font-medium text-ink-secondary dark:text-white/60 mb-1.5">Attached Resume</label>
            <ResumeSelector value={formData.resumeId} onChange={(id) => onChange("resumeId", id || "")} />
            {hasResumeSelected && (
              <p className="mt-1 text-[10px] text-ink-tertiary dark:text-white/40">
                Uploaded resume takes priority over custom text
              </p>
            )}
          </div>
          {!hasResumeSelected && (
            <Textarea label="Or paste custom resume text" value={formData.resumeText} onChange={(e) => onChange("resumeText", e.target.value)} placeholder="Paste custom resume text tailored for this role..." rows={4} showCharCount />
          )}
          <Input label="Resume Link" type="url" value={formData.resumeLink} onChange={(e) => onChange("resumeLink", e.target.value)} placeholder="https://drive.google.com/your-resume..." />
        </CollapsibleSection>

        {interviewSection}

        <CollapsibleSection title="Notes" defaultOpen={false}>
          {notesSection}
        </CollapsibleSection>
      </>
    );
  }

  return (
    <div className="space-y-4">
      {/* Company & Title */}
      <Input label="Company Name" required value={formData.companyName} onChange={(e) => onChange("companyName", e.target.value)} placeholder="e.g. Google, Meta, Local Startup" error={getError("companyName")} />
      <Input label="Job Title" required value={formData.jobTitle} onChange={(e) => onChange("jobTitle", e.target.value)} placeholder="e.g. Software Engineer, Product Manager" error={getError("jobTitle")} />
      <Input label="Job Post URL" type="url" value={formData.jobUrl} onChange={(e) => onChange("jobUrl", e.target.value)} placeholder="https://..." error={getError("jobUrl")} />

      <div className="grid gap-4 sm:grid-cols-2">
        <Select label="Source" required value={formData.source} onChange={(e) => onChange("source", e.target.value as ApplicationSource)} options={SOURCE_OPTIONS} error={getError("source")} />
        <Input label="Application Date" type="date" required value={formData.applicationDate} onChange={(e) => onChange("applicationDate", e.target.value)} error={getError("applicationDate")} />
      </div>
      <Select label="Status" required value={formData.status} onChange={(e) => onChange("status", e.target.value as ApplicationStatus)} options={STATUS_OPTIONS} error={getError("status")} />

      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Location" value={formData.location} onChange={(e) => onChange("location", e.target.value)} placeholder="e.g. San Francisco, CA" />
        <Select label="Remote Status" value={formData.remoteStatus} onChange={(e) => onChange("remoteStatus", e.target.value)} options={REMOTE_STATUS_OPTIONS} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Select label="Employment Type" value={formData.employmentType} onChange={(e) => onChange("employmentType", e.target.value)} options={EMPLOYMENT_TYPE_OPTIONS} />
        <Select label="Salary Currency" value={formData.salaryCurrency} onChange={(e) => onChange("salaryCurrency", e.target.value)} options={SALARY_CURRENCY_OPTIONS} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Salary Min" type="number" min={0} value={formData.salaryMin} onChange={(e) => onChange("salaryMin", e.target.value)} placeholder="e.g. 80000" />
        <Input label="Salary Max" type="number" min={0} value={formData.salaryMax} onChange={(e) => onChange("salaryMax", e.target.value)} placeholder="e.g. 120000" />
      </div>

      <Input label="Company Logo URL" type="url" value={formData.companyLogo} onChange={(e) => onChange("companyLogo", e.target.value)} placeholder="https://logo.clearbit.com/company.com" />

      {interviewSection}

      <Textarea label="Job Description" value={formData.jobDescription} onChange={(e) => onChange("jobDescription", e.target.value)} placeholder="Paste the full job description here..." rows={4} showCharCount />

      <div>
        <label className="block text-xs font-medium text-ink-secondary dark:text-white/60 mb-1.5">Attached Resume</label>
        <ResumeSelector value={formData.resumeId} onChange={(id) => onChange("resumeId", id || "")} />
      </div>
      {!hasResumeSelected && (
        <Textarea label="Or paste custom resume text" value={formData.resumeText} onChange={(e) => onChange("resumeText", e.target.value)} placeholder="Paste custom resume text tailored for this role..." rows={4} showCharCount />
      )}

      <Input label="Resume Link" type="url" value={formData.resumeLink} onChange={(e) => onChange("resumeLink", e.target.value)} placeholder="https://drive.google.com/your-resume..." />

      {notesSection}
    </div>
  );
}