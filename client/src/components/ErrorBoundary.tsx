import { Component, createRef, type ReactNode, type ErrorInfo } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private retryButtonRef = createRef<HTMLButtonElement>();

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an unhandled error:", error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  componentDidUpdate(_prevProps: ErrorBoundaryProps, prevState: ErrorBoundaryState) {
    // Focus the retry button when the error boundary activates
    if (!prevState.hasError && this.state.hasError && this.retryButtonRef.current) {
      this.retryButtonRef.current.focus();
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center p-8" role="alert">
          <div className="max-w-md rounded-xl border border-rose-200 dark:border-rose-500/20 bg-rose-50 dark:bg-rose-500/10 p-6 text-center">
            <div className="mb-3 flex justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-500/20">
                <svg className="h-6 w-6 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
              </div>
            </div>
            <h3 className="text-sm font-semibold text-rose-800 dark:text-rose-200">Something went wrong</h3>
            <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">
              {this.state.error?.message || "An unexpected error occurred while rendering this section."}
            </p>
            <div className="mt-4 flex items-center justify-center gap-3">
              <button
                ref={this.retryButtonRef}
                onClick={() => this.setState({ hasError: false, error: null })}
                className="inline-flex items-center gap-1.5 rounded-lg bg-white dark:bg-dark-surface px-3 py-1.5 text-xs font-medium text-ink dark:text-white/80 border border-slate-300 dark:border-dark-border hover:bg-surface-secondary dark:hover:bg-white/5 transition-colors"
              >
                Try again
              </button>
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-rose-700 transition-colors"
              >
                Reload page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
