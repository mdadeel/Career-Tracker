export const SITE = {
  name: "CareerTrack",
  legalName: "CareerTrack Lite",
  url: "https://careertrack.app",
  defaultTitle: "CareerTrack — Job Application Tracker, Pipeline & Analytics",
  defaultDescription:
    "CareerTrack is a free, private job application tracker. Organize applications, manage a kanban pipeline, track interviews and offers, and measure response rates with real-time analytics.",
  defaultOgImage: "https://careertrack.app/og-cover.png",
  author: "Shahnawas Adeel",
  language: "en",
  locale: "en_US",
  twitterHandle: "@careertrack",
} as const;

export function absoluteUrl(path: string): string {
  return `${SITE.url}${path.startsWith("/") ? path : `/${path}`}`;
}

export function pageTitle(title?: string): string {
  return title ? `${title} • CareerTrack` : SITE.defaultTitle;
}
