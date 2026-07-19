interface SkeletonProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular";
  width?: string | number;
  height?: string | number;
}

export function Skeleton({
  className = "",
  variant = "text",
  width,
  height,
}: SkeletonProps) {
  const baseClass = "animate-pulse bg-slate-200 dark:bg-white/[0.06]";

  const variants = {
    text: "rounded h-4",
    circular: "rounded-full",
    rectangular: "rounded-lg",
  };

  return (
    <div
      className={`${baseClass} ${variants[variant]} ${className}`}
      style={{ width, height }}
      role="presentation"
      aria-hidden="true"
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-card">
      <div className="flex items-center gap-4">
        <Skeleton variant="circular" width={48} height={48} />
        <div className="flex-1 space-y-2">
          <Skeleton width="60%" />
          <Skeleton width="40%" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-card"
        >
          <Skeleton width={80} height={24} className="rounded-full" />
          <div className="flex-1 space-y-1.5">
            <Skeleton width="45%" />
            <Skeleton width="30%" />
          </div>
          <Skeleton width={60} />
        </div>
      ))}
    </div>
  );
}
