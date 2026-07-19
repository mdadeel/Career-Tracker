import { Link } from "react-router-dom";
import { Button } from "../components/ui";

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface-secondary px-4">
      <div className="text-center">
        <p className="text-7xl font-bold text-brand-600">404</p>
        <h1 className="mt-4 text-heading text-ink">Page not found</h1>
        <p className="mt-1.5 text-body text-ink-secondary">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <Link to="/dashboard">
            <Button>Go to Dashboard</Button>
          </Link>
          <Link to="/">
            <Button variant="secondary">Home</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
