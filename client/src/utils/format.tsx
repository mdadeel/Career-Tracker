import type { ReactNode } from "react";
import { Bookmark, ArrowUp, PencilLine, ChatCircle, XCircle, CheckCircle, FileText } from "@phosphor-icons/react";

/** Locale-aware salary range display. e.g. "$80K-$120K" or "€50K" */
export function formatSalary(
  min: number | null | undefined,
  max: number | null | undefined,
  currency = "USD"
): string | null {
  if (!min && !max) return null;

  const fmt = (val: number) => {
    if (val >= 1000) return `${Math.round(val / 1000)}K`;
    return String(val);
  };

  const symbols: Record<string, string> = {
    USD: "$",
    EUR: "€",
    GBP: "£",
    BDT: "৳",
    INR: "₹",
    CAD: "C$",
    AUD: "A$",
  };
  const sym = symbols[currency] || currency + " ";

  if (min && max) return `${sym}${fmt(min)}-${sym}${fmt(max)}`;
  if (min) return `${sym}${fmt(min)}+`;
  if (max) return `Up to ${sym}${fmt(max)}`;
  return null;
}

/** Format a location string, optionally appending remote status. */
export function formatLocation(
  location: string | null | undefined,
  remoteStatus: string | null | undefined
): string | null {
  if (!location && !remoteStatus) return null;
  const parts = [location, remoteStatus].filter(Boolean);
  return parts.join(" · ");
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    Saved: "bg-slate-100 text-slate-700 border-slate-200",
    Applied: "bg-blue-50 text-blue-700 border-blue-200",
    Assessment: "bg-amber-50 text-amber-700 border-amber-200",
    Interview: "bg-purple-50 text-purple-700 border-purple-200",
    Rejected: "bg-rose-50 text-rose-700 border-rose-200",
    Offer: "bg-emerald-50 text-emerald-700 border-emerald-200",
  };
  return colors[status] || "bg-slate-100 text-slate-700 border-slate-200";
}

export function getStatusIcon(status: string): ReactNode {
  const icons: Record<string, ReactNode> = {
    Saved: <Bookmark size={16} />,
    Applied: <ArrowUp size={16} />,
    Assessment: <PencilLine size={16} />,
    Interview: <ChatCircle size={16} />,
    Rejected: <XCircle size={16} />,
    Offer: <CheckCircle size={16} />,
  };
  return icons[status] || <FileText size={16} />;
}
