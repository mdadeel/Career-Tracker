import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import App from "./App";
import "./index.css";

async function initSentry() {
  if (!import.meta.env.VITE_SENTRY_DSN) return null;
  // Lazy-load Sentry so it only enters the bundle when a DSN is configured.
  const Sentry = await import("@sentry/react");
  if (import.meta.env.PROD) {
    Sentry.init({
      dsn: import.meta.env.VITE_SENTRY_DSN,
      environment: import.meta.env.MODE || "production",
      tracesSampleRate: 0.1,
      integrations: [Sentry.browserTracingIntegration()],
    });
  }
  return Sentry;
}

function ErrorFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-secondary p-8">
      <div className="max-w-md text-center">
        <h1 className="text-display text-ink mb-2">Something went wrong</h1>
        <p className="text-body text-ink-secondary mb-6">
          An unexpected error occurred. Our team has been notified.
          Try refreshing the page.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="rounded-lg bg-brand-600 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-700"
        >
          Refresh page
        </button>
      </div>
    </div>
  );
}

initSentry().then((Sentry) => {
  type ErrorBoundaryProps = { children: React.ReactNode; fallback: React.ReactNode };
  const ErrorBoundary = (Sentry?.ErrorBoundary ??
    (({ children }: ErrorBoundaryProps) => <>{children}</>)) as React.ComponentType<ErrorBoundaryProps>;

  ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <HelmetProvider>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <ErrorBoundary fallback={<ErrorFallback />}>
            <App />
          </ErrorBoundary>
        </BrowserRouter>
      </HelmetProvider>
    </React.StrictMode>
  );
});
