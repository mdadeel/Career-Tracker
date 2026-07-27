import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import * as Sentry from "@sentry/react";
import App from "./App";
import "./index.css";

// Initialize Sentry for client-side error monitoring
if (import.meta.env.VITE_SENTRY_DSN) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.MODE || "development",
    tracesSampleRate: 0.1,
    integrations: [Sentry.browserTracingIntegration()],
    // Only enable in production/staging to reduce dev noise
    enabled: import.meta.env.PROD,
  });
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Sentry.ErrorBoundary fallback={<ErrorFallback />}>
          <App />
        </Sentry.ErrorBoundary>
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>
);

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

