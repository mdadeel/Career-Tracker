import { absoluteUrl } from "./site";

export interface PageMeta {
  /** Page title WITHOUT brand suffix — suffixed automatically. */
  title: string;
  description: string;
  path: string;
  /** Crawlers should index this page. False for authenticated/app pages. */
  index?: boolean;
  ogType?: "website" | "article" | "profile";
  keywords?: string;
  /** Optional extra JSON-LD schema blocks keyed by type. */
  schema?: ("softwareApp" | "organization" | "breadcrumb" | "webSite" | "faq")[];
}

export const ROUTES: Record<string, PageMeta> = {
  "/": {
    title: "Job Application Tracker & Pipeline Analytics",
    description:
      "CareerTrack is a free, private job application tracker. Organize applications, manage a kanban pipeline, track interviews and offers, and measure response rates with real-time analytics.",
    path: "/",
    keywords:
      "job tracker, application tracking system, job search pipeline, kanban job board, interview calendar, career track",
    schema: ["webSite", "organization", "softwareApp"],
  },
  "/login": {
    title: "Sign In",
    description: "Sign in to CareerTrack to manage your job applications, pipeline, and analytics.",
    path: "/login",
    index: false,
  },
  "/register": {
    title: "Create Your Account",
    description: "Create a free CareerTrack account and start tracking job applications, interviews, and offers today.",
    path: "/register",
    index: false,
  },
  "/dashboard": {
    title: "Dashboard",
    description: "Your CareerTrack dashboard — weekly activity, application metrics, and upcoming interviews at a glance.",
    path: "/dashboard",
    index: false,
  },
  "/applications": {
    title: "Applications",
    description: "Browse and manage all your job applications, from saved to offer.",
    path: "/applications",
    index: false,
  },
  "/applications/new": {
    title: "Add Application",
    description: "Add a new job application to your CareerTrack pipeline.",
    path: "/applications/new",
    index: false,
  },
  "/analytics": {
    title: "Analytics",
    description: "Deep insights into your job search — response rates, interview conversion, offers, and monthly velocity.",
    path: "/analytics",
    index: false,
  },
  "/calendar": {
    title: "Calendar",
    description: "Your interview schedule — upcoming and past interviews at a glance.",
    path: "/calendar",
    index: false,
  },
  "/resumes": {
    title: "Resumes",
    description: "Store and manage your resume versions and job description links.",
    path: "/resumes",
    index: false,
  },
  "/settings": {
    title: "Settings",
    description: "Manage your CareerTrack profile, appearance, AI provider, and security settings.",
    path: "/settings",
    index: false,
  },
  "/404": {
    title: "Page Not Found",
    description: "The page you're looking for doesn't exist or has been moved.",
    path: "/404",
    index: false,
  },
};

export function getMetaForPath(pathname: string): PageMeta {
  // Exact match first, then prefix match for dynamic detail routes.
  const exact = ROUTES[pathname];
  if (exact) return exact;
  if (pathname.startsWith("/applications/new")) {
    return { ...ROUTES["/applications/new"], path: pathname };
  }
  if (pathname.startsWith("/applications/") && pathname.endsWith("/edit")) {
    return {
      ...ROUTES["/applications"],
      title: "Edit Application",
      path: pathname,
    };
  }
  if (pathname.startsWith("/applications/")) {
    return {
      ...ROUTES["/applications"],
      title: "Application",
      path: pathname,
    };
  }
  return ROUTES["/404"];
}

export function toCanonical(pathname: string): string {
  const meta = getMetaForPath(pathname);
  return absoluteUrl(meta.path);
}

export function breadcrumbFromPath(pathname: string) {
  const parts = pathname.split("/").filter(Boolean);
  const crumbs = parts.map((part, i) => ({
    name: part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, " "),
    path: "/" + parts.slice(0, i + 1).join("/"),
  }));
  if (pathname !== "/") crumbs.unshift({ name: "Home", path: "/" });
  return crumbs;
}
