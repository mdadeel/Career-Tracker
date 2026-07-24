export type ApplicationStatus =
  | "Saved"
  | "Applied"
  | "Assessment"
  | "Interview"
  | "Rejected"
  | "Offer";

export type ApplicationSource =
  | "LinkedIn"
  | "Bdjobs"
  | "Indeed"
  | "Wellfound"
  | "Facebook"
  | "Referral"
  | "Other";

export interface Application {
  id: string;
  companyName: string;
  jobTitle: string;
  jobUrl: string | null;
  source: ApplicationSource;
  applicationDate: string;
  status: ApplicationStatus;
  notes: string | null;
  jobDescription: string | null;
  resumeLink: string | null;
  resumeText?: string | null;
  interviewDate: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryCurrency: string;
  location: string | null;
  employmentType: string | null;
  remoteStatus: string | null;
  companyLogo: string | null;
  aiMatchScore?: number | null;
  aiAnalysis?: any;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  resumeText?: string | null;
  skills?: string[];
  aiProvider?: string | null;
  aiApiKey?: string | null;
  aiBaseUrl?: string | null;
  aiModel?: string | null;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface SourceBreakdown {
  source: string;
  count: number;
  percentage: number;
}

export interface DashboardStats {
  total: number;
  saved: number;
  applied: number;
  assessment: number;
  interview: number;
  rejected: number;
  offer: number;
  responseRate: number;
  offerRate: number;
  interviewRate: number;
  rejectionRate: number;
  sourceBreakdown: SourceBreakdown[];
  avgTimeToInterview: number | null;
  recentApplications: RecentApplication[];
}

export interface RecentApplication {
  id: string;
  companyName: string;
  jobTitle: string;
  status: ApplicationStatus;
  applicationDate: string;
  interviewDate: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryCurrency: string;
  location: string | null;
  employmentType: string | null;
  remoteStatus: string | null;
  createdAt: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
}

export interface PaginatedApplications {
  applications: Application[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApplicationFormData {
  companyName: string;
  jobTitle: string;
  jobUrl: string;
  source: ApplicationSource;
  applicationDate: string;
  status: ApplicationStatus;
  notes: string;
  jobDescription: string;
  resumeLink: string;
  resumeText?: string;
  interviewDate: string;
  salaryMin: string;
  salaryMax: string;
  salaryCurrency: string;
  location: string;
  employmentType: string;
  remoteStatus: string;
  companyLogo: string;
}
