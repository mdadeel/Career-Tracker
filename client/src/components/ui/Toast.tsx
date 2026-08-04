import { useToast, type ToastType } from "../../context/ToastContext";
import { CheckCircle, XCircle, Info, X } from "@phosphor-icons/react";

const iconMap: Record<ToastType, JSX.Element> = {
  success: <CheckCircle size={16} className="text-emerald-500" weight="fill" />,
  error: <XCircle size={16} className="text-rose-500" weight="fill" />,
  info: <Info size={16} className="text-blue-500" weight="fill" />,
};

const borderMap: Record<ToastType, string> = {
  success:
    "border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-300",
  error:
    "border-rose-200 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-500/10 text-rose-800 dark:text-rose-300",
  info:
    "border-blue-200 dark:border-blue-500/30 bg-blue-50 dark:bg-blue-500/10 text-blue-800 dark:text-blue-300",
};

export function ToastContainer() {
  const { toasts, removeToast, pauseToast, resumeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    // role="status" live region — screen readers announce new toasts
    <div
      className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm"
      role="status"
      aria-live="polite"
      aria-label="Notifications"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-start gap-3 rounded-xl border px-4 py-3 shadow-elevated animate-fade-in-up ${borderMap[toast.type]}`}
          // Pause auto-dismiss while hovered or focused, resume on leave
          onMouseEnter={() => pauseToast(toast.id)}
          onMouseLeave={() => resumeToast(toast.id, toast.duration)}
          onFocus={() => pauseToast(toast.id)}
          onBlur={() => resumeToast(toast.id, toast.duration)}
        >
          <span className="mt-0.5 shrink-0">{iconMap[toast.type]}</span>
          <p className="flex-1 text-sm font-medium">{toast.message}</p>
          <button
            onClick={() => removeToast(toast.id)}
            className="shrink-0 rounded p-0.5 transition-colors hover:bg-black/5 dark:hover:bg-white/5"
            aria-label="Dismiss"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
