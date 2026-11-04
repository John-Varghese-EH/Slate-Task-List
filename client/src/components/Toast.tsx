import React, { useEffect } from "react";
import { X } from "lucide-react";
import { ToastMessage } from "../hooks/useTasks";

interface ToastProps {
  toast: ToastMessage | null;
  onDismiss: () => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  useEffect(() => {
    if (!toast) return;

    const timeout = setTimeout(() => {
      onDismiss();
    }, 4500);

    return () => clearTimeout(timeout);
  }, [toast, onDismiss]);

  if (!toast) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 max-w-sm w-[calc(100%-2rem)] sm:w-auto animate-in fade-in slide-in-from-bottom-2 duration-200">
      <div className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-app-surface border border-app-border shadow-lg text-xs font-medium text-app-text">
        <span className="truncate">{toast.message}</span>

        <div className="flex items-center gap-2 flex-shrink-0">
          {toast.actionLabel && toast.onAction && (
            <button
              type="button"
              onClick={toast.onAction}
              className="px-2 py-1 rounded bg-app-accent text-white font-medium hover:opacity-90 transition-opacity"
            >
              {toast.actionLabel}
            </button>
          )}

          <button
            type="button"
            onClick={onDismiss}
            aria-label="Dismiss notification"
            className="text-app-text-muted hover:text-app-text p-0.5 rounded transition-colors"
          >
            <X strokeWidth={1.5} className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
