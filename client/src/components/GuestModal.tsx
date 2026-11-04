import React, { useEffect } from "react";
import {
  X,
  HardDrive,
  CloudUpload,
  LogOut,
  Trash2,
  CheckCircle2,
  Shield,
} from "lucide-react";

interface GuestModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskCount: number;
  onOpenAuth: () => void;
  onExitGuest: () => void;
  onClearGuestTasks: () => void;
}

export const GuestModal: React.FC<GuestModalProps> = ({
  isOpen,
  onClose,
  taskCount,
  onOpenAuth,
  onExitGuest,
  onClearGuestTasks,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleClear = () => {
    if (window.confirm("Are you sure you want to delete all local guest tasks?")) {
      onClearGuestTasks();
      onClose();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="guest-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
    >
      <div
        className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-md transition-opacity animate-fade-in"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md bg-app-surface border border-app-border rounded-2xl shadow-2xl overflow-hidden z-10 animate-scale-in">
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-app-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <HardDrive strokeWidth={1.5} className="w-5 h-5" />
            </div>
            <div>
              <h2
                id="guest-modal-title"
                className="text-base font-semibold text-app-text tracking-tight"
              >
                Guest Mode (Local Storage)
              </h2>
              <p className="text-xs text-app-text-muted">
                Offline-ready local workspace
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close guest modal"
            className="apple-press p-1.5 rounded-lg text-app-text-muted hover:text-app-text hover:bg-app-bg transition-colors"
          >
            <X strokeWidth={1.5} className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="p-3.5 rounded-xl bg-app-bg border border-app-border space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-app-text-muted flex items-center gap-1.5">
                <Shield strokeWidth={1.5} className="w-3.5 h-3.5" />
                <span>Storage Location</span>
              </span>
              <span className="font-semibold text-app-text">
                Device Local Storage
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-app-text-muted flex items-center gap-1.5">
                <CheckCircle2 strokeWidth={1.5} className="w-3.5 h-3.5" />
                <span>Local Tasks Saved</span>
              </span>
              <span className="font-semibold text-app-text tabular-nums">
                {taskCount} {taskCount === 1 ? "task" : "tasks"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-app-text-muted">Database Sync</span>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 font-medium text-[11px]">
                Disabled (Local Only)
              </span>
            </div>
          </div>

          <p className="text-xs text-app-text-secondary leading-relaxed">
            You are operating in standalone guest mode. All task creations, edits, and
            completions are saved immediately to your browser without network
            calls. Sign in anytime to sync your tasks across devices.
          </p>

          <div className="pt-2 space-y-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenAuth();
              }}
              className="apple-press w-full py-2.5 px-4 rounded-xl bg-app-accent text-white text-xs font-semibold shadow-xs hover:opacity-95 transition-all inline-flex items-center justify-center gap-2"
            >
              <CloudUpload strokeWidth={1.5} className="w-4 h-4" />
              <span>Sign In to Sync Across Devices</span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleClear}
                className="apple-press py-2.5 px-3 rounded-xl bg-app-bg border border-app-border text-app-danger hover:border-app-danger/40 text-xs font-medium transition-all inline-flex items-center justify-center gap-1.5"
              >
                <Trash2 strokeWidth={1.5} className="w-3.5 h-3.5" />
                <span>Clear Tasks</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onExitGuest();
                }}
                className="apple-press py-2.5 px-3 rounded-xl bg-app-bg border border-app-border text-app-text-secondary hover:text-app-text hover:border-app-border text-xs font-medium transition-all inline-flex items-center justify-center gap-1.5"
              >
                <LogOut strokeWidth={1.5} className="w-3.5 h-3.5" />
                <span>Exit Guest Mode</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
