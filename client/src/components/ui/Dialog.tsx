import { useEffect, useRef, useCallback, type ReactNode } from "react";
import { Button } from "./Button";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: ReactNode;
  action?: {
    label: string;
    onClick: () => void;
    variant?: "primary" | "danger";
    isLoading?: boolean;
  };
  cancelLabel?: string;
}

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  action,
  cancelLabel = "Cancel",
}: DialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Body scroll lock + focus trap + Escape key
  useEffect(() => {
    if (!open) return;

    previousFocusRef.current = document.activeElement as HTMLElement;
    document.body.style.overflow = "hidden";

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);

    // Focus the first focusable element inside the dialog
    requestAnimationFrame(() => {
      const dialog = dialogRef.current;
      if (!dialog) return;
      const firstFocusable = dialog.querySelector(FOCUSABLE_SELECTOR) as HTMLElement;
      firstFocusable?.focus();
    });

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleEscape);
      previousFocusRef.current?.focus();
    };
  }, [open, onClose]);

  // Focus trap — cycle focus within the dialog
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key !== "Tab") return;
    const dialog = dialogRef.current;
    if (!dialog) return;

    const focusable = dialog.querySelectorAll(FOCUSABLE_SELECTOR);
    if (focusable.length === 0) return;

    const first = focusable[0] as HTMLElement;
    const last = focusable[focusable.length - 1] as HTMLElement;

    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }, []);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={title}>
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      <div
        ref={dialogRef}
        onKeyDown={handleKeyDown}
        className="relative w-full max-w-md animate-scale-in rounded-2xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface p-6 shadow-dialog"
      >
        <h3 className="text-heading text-ink dark:text-white/90">{title}</h3>
        {description && (
          <p className="mt-1.5 text-body text-ink-secondary dark:text-white/50">{description}</p>
        )}
        {children && <div className="mt-4">{children}</div>}
        <div className="mt-6 flex items-center justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>
            {cancelLabel}
          </Button>
          {action && (
            <Button
              variant={action.variant === "danger" ? "danger" : "primary"}
              onClick={action.onClick}
              isLoading={action.isLoading}
            >
              {action.label}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
