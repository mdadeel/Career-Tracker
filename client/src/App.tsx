import { lazy, Suspense, type ReactNode } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ToastContainer } from "./components/ui/Toast";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { SidebarLayout } from "./components/ui/Sidebar";

// Lazy-loaded route-level pages — each is a separate JS chunk.
// All page components are named exports (export function Foo), so we
// map the module to { default: ... } for React.lazy compatibility.
const LandingPage = lazy(() =>
  import("./pages/LandingPage").then((m) => ({ default: m.LandingPage }))
);
const LoginPage = lazy(() =>
  import("./pages/LoginPage").then((m) => ({ default: m.LoginPage }))
);
const RegisterPage = lazy(() =>
  import("./pages/RegisterPage").then((m) => ({ default: m.RegisterPage }))
);
const DashboardPage = lazy(() =>
  import("./pages/DashboardPage").then((m) => ({ default: m.DashboardPage }))
);
const ApplicationsPage = lazy(() =>
  import("./pages/ApplicationsPage").then((m) => ({ default: m.ApplicationsPage }))
);
const ApplicationFormPage = lazy(() =>
  import("./pages/ApplicationFormPage").then((m) => ({ default: m.ApplicationFormPage }))
);
const AnalyticsPage = lazy(() =>
  import("./pages/AnalyticsPage").then((m) => ({ default: m.AnalyticsPage }))
);
const CalendarPage = lazy(() =>
  import("./pages/CalendarPage").then((m) => ({ default: m.CalendarPage }))
);
const SettingsPage = lazy(() =>
  import("./pages/SettingsPage").then((m) => ({ default: m.SettingsPage }))
);
const PipelinePage = lazy(() =>
  import("./pages/PipelinePage").then((m) => ({ default: m.PipelinePage }))
);
const SavedJobsPage = lazy(() =>
  import("./pages/SavedJobsPage").then((m) => ({ default: m.SavedJobsPage }))
);
const NotFoundPage = lazy(() =>
  import("./pages/NotFoundPage").then((m) => ({ default: m.NotFoundPage }))
);

function PageLoadingSpinner() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
    </div>
  );
}

function LazyPage({ children }: { children: ReactNode }) {
  return <Suspense fallback={<PageLoadingSpinner />}>{children}</Suspense>;
}

function AppRoutes() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-secondary">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/"
        element={user ? <Navigate to="/dashboard" replace /> : <LazyPage><LandingPage /></LazyPage>}
      />
      <Route
        path="/login"
        element={user ? <Navigate to="/dashboard" replace /> : <LazyPage><LoginPage /></LazyPage>}
      />
      <Route
        path="/register"
        element={user ? <Navigate to="/dashboard" replace /> : <LazyPage><RegisterPage /></LazyPage>}
      />

      {/* Protected Routes — wrapped in persistent SidebarLayout via layout route */}
      <Route
        element={
          <ProtectedRoute>
            <SidebarLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/pipeline" element={<PipelinePage />} />
        <Route path="/applications" element={<ApplicationsPage />} />
        <Route path="/applications/new" element={<ApplicationFormPage />} />
        <Route path="/applications/:id/edit" element={<ApplicationFormPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/saved-jobs" element={<SavedJobsPage />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<LazyPage><NotFoundPage /></LazyPage>} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <ErrorBoundary>
          <AppRoutes />
        </ErrorBoundary>
        <ToastContainer />
      </ToastProvider>
    </AuthProvider>
  );
}
