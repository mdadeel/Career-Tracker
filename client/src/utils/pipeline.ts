import type { RecentApplication } from "../types";

export interface PipelineStage {
  key: string;
  label: string;
  color: string;
}

export interface PipelineStageGroup extends PipelineStage {
  apps: RecentApplication[];
}

/** Ordered pipeline stages used across dashboard widgets. Keys are lowercase to match `status.toLowerCase()`. */
export const PIPELINE_STAGES: PipelineStage[] = [
  { key: "saved", label: "Saved", color: "bg-slate-400" },
  { key: "applied", label: "Applied", color: "bg-blue-500" },
  { key: "assessment", label: "Assessment", color: "bg-amber-500" },
  { key: "interview", label: "Interview", color: "bg-purple-500" },
  { key: "rejected", label: "Rejected", color: "bg-rose-500" },
  { key: "offer", label: "Offer", color: "bg-emerald-500" },
];

/**
 * Group recent applications by pipeline stage, preserving stage order and
 * dropping stages that have no applications. Matching is case-insensitive
 * (statuses are capitalized, e.g. "Interview" → key "interview").
 */
export function groupRecentByStage(recentApplications: RecentApplication[]): PipelineStageGroup[] {
  return PIPELINE_STAGES
    .map((s) => ({
      ...s,
      apps: recentApplications.filter((a) => a.status.toLowerCase() === s.key),
    }))
    .filter((s) => s.apps.length > 0);
}
