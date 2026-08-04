import { useEffect, useRef, type ReactNode } from "react";
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

/**
 * Canonical modal dialog built on the native <dialog> element.
 * - opened with showModal() → browser top layer, inert page behind, ::backdrop scrim
 * - Escape closes natively via the `cancel` event
 * - focus is returned to the invoking control on close
 * - body scroll is locked while open
 */
export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  action,
  cancelLabel = "Cancel",
}: DialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Open/close the native dialog and lock body scroll
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      if (typeof dialog.showModal === "function" && !dialog.open) {
        dialog.showModal();
      } else {
        dialog.setAttribute("open", "");
      }
      document.body.style.overflow = "hidden";
    } else if (dialog.open) {
      dialog.close();
      document.body.style.overflow = "";
      previousFocusRef.current?.focus();
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Native Escape handling — the dialog fires `cancel`, which we let close it, then sync state.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const handleCancel = (e: Event) => {
      // Let the native dialog close; keep parent state in sync
      e.preventDefault();
      dialog.close();
      onClose();
    };
    dialog.addEventListener("cancel", handleCancel);
    return () => dialog.removeEventListener("cancel", handleCancel);
  }, [onClose]);

  // Light-dismiss on scrim (::backdrop) click — native dialogs don't do this automatically.
  // Only dismiss when the click lands outside the dialog box itself (bounding-rect check).
  const handleClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const rect = dialog.getBoundingClientRect();
    const inBox =
      e.clientX >= rect.left &&
      e.clientX <= rect.right &&
      e.clientY >= rect.top &&
      e.clientY <= rect.bottom;
    if (!inBox) onClose();
  };

  return (
    <dialog
      ref={dialogRef}
      onClick={handleClick}
      aria-label={title}
      className="
        m-auto w-full max-w-md rounded-2xl border border-slate-200 dark:border-dark-border
        bg-white dark:bg-dark-surface p-6 shadow-dialog open:animate-scale-in
      "
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
    </dialog>
  );
}
