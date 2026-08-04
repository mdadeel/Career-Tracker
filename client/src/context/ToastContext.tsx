import { createContext, useContext, useState, useCallback, useRef, type ReactNode } from "react";

export type ToastType = "success" | "error" | "info";

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration: number;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (message: string, type?: ToastType, duration?: number) => void;
  removeToast: (id: string) => void;
  /** Pause the auto-dismiss timer for a toast (e.g. while hovered/focused). */
  pauseToast: (id: string) => void;
  /** Restart the auto-dismiss timer for a toast. */
  resumeToast: (id: string, duration: number) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const clearTimer = useCallback((id: string) => {
    const timer = timersRef.current[id];
    if (timer) {
      clearTimeout(timer);
      delete timersRef.current[id];
    }
  }, []);

  const removeToast = useCallback(
    (id: string) => {
      clearTimer(id);
      setToasts((prev) => prev.filter((t) => t.id !== id));
    },
    [clearTimer]
  );

  const addToast = useCallback(
    (message: string, type: ToastType = "info", duration = 4000) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setToasts((prev) => [...prev, { id, message, type, duration }]);
      if (duration > 0) {
        timersRef.current[id] = setTimeout(() => removeToast(id), duration);
      }
    },
    [removeToast]
  );

  const pauseToast = useCallback((id: string) => {
    clearTimer(id);
  }, [clearTimer]);

  const resumeToast = useCallback(
    (id: string, duration: number) => {
      if (duration <= 0 || timersRef.current[id]) return;
      timersRef.current[id] = setTimeout(() => removeToast(id), duration);
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, pauseToast, resumeToast }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
