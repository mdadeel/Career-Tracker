import { api } from './api';

export interface ParsedJd {
  companyName: string;
  jobTitle: string;
  location?: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  employmentType?: string;
  remoteStatus?: string;
  extractedSkills: string[];
}

export interface MatchAnalysis {
  matchScore: number;
  matchingSkills: string[];
  missingSkills: string[];
  summary: string;
  recommendations: string[];
}

export interface InterviewQuestion {
  category: 'behavioral' | 'technical' | 'situational';
  question: string;
  tip: string;
}

export interface EmailDraft {
  subject: string;
  body: string;
}

export const aiService = {
  parseJobDescription: (jobDescription: string) =>
    api.post<ParsedJd>('/ai/parse-jd', { jobDescription }),

  analyzeMatch: (applicationId: string) =>
    api.post<MatchAnalysis>(`/ai/match-score/${applicationId}`, {}),

  generateInterviewPrep: (applicationId: string) =>
    api.post<InterviewQuestion[]>(`/ai/interview-prep/${applicationId}`, {}),

  generateOutreachEmail: (applicationId: string, type: 'follow_up' | 'thank_you' | 'cold_outreach') =>
    api.post<EmailDraft>('/ai/generate-email', { applicationId, type }),

  testAiConfig: (data: { aiProvider: string; aiApiKey?: string; aiBaseUrl?: string; aiModel?: string }) =>
    api.post<{ message: string }>('/ai/test-config', data),
};
