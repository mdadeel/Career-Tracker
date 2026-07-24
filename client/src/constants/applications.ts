import type { ApplicationFormData, ApplicationSource, ApplicationStatus } from "../types";

export const SOURCE_OPTIONS: readonly { value: ApplicationSource; label: string }[] = [
  { value: "LinkedIn", label: "LinkedIn" },
  { value: "Bdjobs", label: "Bdjobs" },
  { value: "Indeed", label: "Indeed" },
  { value: "Wellfound", label: "Wellfound" },
  { value: "Facebook", label: "Facebook" },
  { value: "Referral", label: "Referral" },
  { value: "Other", label: "Other" },
] as const;

export const STATUS_OPTIONS: readonly { value: ApplicationStatus; label: string }[] = [
  { value: "Saved", label: "Saved" },
  { value: "Applied", label: "Applied" },
  { value: "Assessment", label: "Assessment" },
  { value: "Interview", label: "Interview" },
  { value: "Rejected", label: "Rejected" },
  { value: "Offer", label: "Offer" },
] as const;

export const FILTER_STATUSES: readonly { value: string; label: string }[] = [
  { value: "All", label: "All Statuses" },
  { value: "Saved", label: "Saved" },
  { value: "Applied", label: "Applied" },
  { value: "Assessment", label: "Assessment" },
  { value: "Interview", label: "Interview" },
  { value: "Rejected", label: "Rejected" },
  { value: "Offer", label: "Offer" },
] as const;

export const FILTER_SOURCES: readonly { value: string; label: string }[] = [
  { value: "All", label: "All Sources" },
  { value: "LinkedIn", label: "LinkedIn" },
  { value: "Bdjobs", label: "Bdjobs" },
  { value: "Indeed", label: "Indeed" },
  { value: "Wellfound", label: "Wellfound" },
  { value: "Facebook", label: "Facebook" },
  { value: "Referral", label: "Referral" },
  { value: "Other", label: "Other" },
] as const;

export const EMPLOYMENT_TYPE_OPTIONS: readonly { value: string; label: string }[] = [
  { value: "Full-time", label: "Full-time" },
  { value: "Part-time", label: "Part-time" },
  { value: "Contract", label: "Contract" },
  { value: "Internship", label: "Internship" },
  { value: "Freelance", label: "Freelance" },
] as const;

export const REMOTE_STATUS_OPTIONS: readonly { value: string; label: string }[] = [
  { value: "Remote", label: "Remote" },
  { value: "Hybrid", label: "Hybrid" },
  { value: "On-site", label: "On-site" },
] as const;

export const SALARY_CURRENCY_OPTIONS: readonly { value: string; label: string }[] = [
  { value: "USD", label: "USD ($)" },
  { value: "EUR", label: "EUR (€)" },
  { value: "GBP", label: "GBP (£)" },
  { value: "BDT", label: "BDT (৳)" },
  { value: "INR", label: "INR (₹)" },
  { value: "CAD", label: "CAD (C$)" },
  { value: "AUD", label: "AUD (A$)" },
] as const;

export const SORT_OPTIONS: readonly { value: string; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "status", label: "Status" },
] as const;

/** Returns a fresh empty form with today's date pre-filled. */
export function createEmptyForm(): ApplicationFormData {
  return {
    companyName: "",
    jobTitle: "",
    jobUrl: "",
    source: "LinkedIn",
    applicationDate: new Date().toISOString().split("T")[0],
    status: "Saved",
    notes: "",
    jobDescription: "",
    resumeLink: "",
    resumeText: "",
    interviewDate: "",
    salaryMin: "",
    salaryMax: "",
    salaryCurrency: "USD",
    location: "",
    employmentType: "",
    remoteStatus: "",
    companyLogo: "",
  };
}
