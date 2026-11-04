import React from "react";
import {
  Sun,
  Moon,
  WifiOff,
  CloudOff,
  ArrowDownToLine,
  RefreshCw,
  User as UserIcon,
  LogOut,
  HardDrive,
} from "lucide-react";
import { Theme } from "../hooks/useTheme";
import { User } from "../types/auth";

interface HeaderProps {
  activeCount: number;
  completedCount: number;
  totalCount: number;
  theme: Theme;
  resolvedTheme: "light" | "dark";
  onToggleTheme: () => void;
  isOffline: boolean;
  pendingSyncCount?: number;
  isInstallable?: boolean;
  onInstall?: () => void;
  onSyncNow?: () => void;
  user?: User | null;
  isGuest?: boolean;
  onOpenAuth?: () => void;
  onOpenProfile?: () => void;
  onOpenGuestModal?: () => void;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeCount,
  completedCount,
  totalCount,
  resolvedTheme,
  onToggleTheme,
  isOffline,
  pendingSyncCount = 0,
  isInstallable,
  onInstall,
  onSyncNow,
  user,
  isGuest,
  onOpenAuth,
  onOpenProfile,
  onOpenGuestModal,
  onLogout,
}) => {
  const currentDate = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  }).format(new Date());

  const progressPercent =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <header className="pt-8 pb-5">
      {(isOffline || pendingSyncCount > 0) && (
        <div className="mb-4 flex items-center justify-between gap-3 rounded-xl bg-app-surface border border-app-border px-3.5 py-2 text-xs text-app-text-secondary shadow-xs">
          <div className="flex items-center gap-2 min-w-0">
            {isOffline ? (
              <WifiOff strokeWidth={1.5} className="w-3.5 h-3.5 text-app-danger flex-shrink-0" />
            ) : (
              <CloudOff strokeWidth={1.5} className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
            )}
            <span className="truncate">
              {isOffline
                ? "Offline mode: changes saved to local storage"
                : "Database offline: buffering changes locally"}
            </span>
          </div>

          {pendingSyncCount > 0 && (
            <button
              type="button"
              onClick={onSyncNow}
              className="apple-press inline-flex items-center gap-1.5 text-[11px] font-medium text-app-text px-2 py-0.5 rounded-md bg-app-bg border border-app-border flex-shrink-0 hover:border-app-accent/40"
              title="Click to retry sync with server"
            >
              <RefreshCw strokeWidth={1.5} className="w-2.5 h-2.5 text-amber-500" />
              <span>{pendingSyncCount} pending</span>
            </button>
          )}
        </div>
      )}

      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-widest text-app-text-muted">
            {currentDate}
          </p>
          <div className="flex items-center gap-2 sm:gap-3 mt-1.5">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-app-accent flex items-center justify-center text-white shadow-xs ring-1 ring-black/5 dark:ring-white/10 flex-shrink-0">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="w-4 h-4 sm:w-5 sm:h-5"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <div className="flex flex-wrap items-baseline gap-1.5 sm:gap-3 min-w-0">
              <h1 className="text-xl sm:text-4xl font-extrabold tracking-tight text-app-text">
                Slate <span className="text-xs sm:text-xl font-normal text-app-text-muted">(Task List)</span>
              </h1>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-app-surface border border-app-border text-[10px] sm:text-xs font-semibold text-app-text-secondary tabular-nums shadow-xs">
                {activeCount} {activeCount === 1 ? "task" : "tasks"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          {user ? (
            <div className="inline-flex items-center gap-1 h-9 sm:h-10 px-1.5 rounded-xl bg-app-surface border border-app-border text-xs shadow-2xs">
              <button
                type="button"
                onClick={onOpenProfile}
                aria-label="Open profile settings"
                title="Profile and sessions"
                className="apple-press inline-flex items-center gap-1.5 h-7 sm:h-8 px-1.5 rounded-lg hover:bg-app-bg transition-colors"
              >
                <span className="w-6 h-6 rounded-md bg-app-accent/15 text-app-accent font-semibold flex items-center justify-center text-[11px] uppercase">
                  {user.name ? user.name[0] : "U"}
                </span>
                <span className="hidden sm:inline font-medium text-app-text max-w-[90px] truncate">
                  {user.name}
                </span>
              </button>
              <div className="w-px h-3.5 bg-app-border" />
              <button
                type="button"
                onClick={onLogout}
                aria-label="Sign out"
                title="Sign out"
                className="apple-press w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-app-text-muted hover:text-app-danger rounded-lg hover:bg-app-bg transition-colors"
              >
                <LogOut strokeWidth={1.5} className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : isGuest ? (
            <div className="inline-flex items-center gap-1 h-9 sm:h-10 px-1.5 rounded-xl bg-app-surface border border-app-border text-xs shadow-2xs">
              <button
                type="button"
                onClick={onOpenGuestModal}
                aria-label="Guest Mode: Local Storage only"
                title="Guest Mode: Local Storage only. Click for details."
                className="apple-press inline-flex items-center gap-1.5 h-7 sm:h-8 px-1.5 rounded-lg hover:bg-app-bg transition-colors"
              >
                <span className="w-6 h-6 rounded-md bg-amber-500/15 text-amber-600 dark:text-amber-400 font-semibold flex items-center justify-center text-[11px]">
                  <HardDrive strokeWidth={1.5} className="w-3.5 h-3.5" />
                </span>
                <span className="font-medium text-app-text">Guest</span>
                <span className="text-[10px] text-app-text-muted hidden sm:inline">(Local)</span>
              </button>
              <div className="w-px h-3.5 bg-app-border" />
              <button
                type="button"
                onClick={onLogout}
                aria-label="Exit guest mode"
                title="Exit guest mode and return to sign in"
                className="apple-press w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-app-text-muted hover:text-app-danger rounded-lg hover:bg-app-bg transition-colors"
              >
                <LogOut strokeWidth={1.5} className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenAuth}
              aria-label="Sign in to sync across devices"
              className="apple-press inline-flex items-center gap-1.5 h-9 sm:h-10 px-3 sm:px-3.5 rounded-xl bg-app-surface border border-app-border text-xs font-medium text-app-text hover:border-app-accent/50 shadow-2xs transition-all"
            >
              <UserIcon strokeWidth={1.5} className="w-3.5 h-3.5 text-app-accent" />
              <span>Sign In</span>
            </button>
          )}

          {isInstallable && onInstall && (
            <button
              type="button"
              onClick={onInstall}
              aria-label="Install Slate as standalone app"
              className="apple-press inline-flex items-center gap-1.5 h-9 sm:h-10 px-3 sm:px-3.5 rounded-xl bg-app-surface border border-app-border text-xs font-medium text-app-text hover:border-app-accent/50 shadow-2xs transition-all"
            >
              <ArrowDownToLine strokeWidth={1.5} className="w-3.5 h-3.5 text-app-accent" />
              <span className="hidden sm:inline">Install</span>
            </button>
          )}

          <button
            type="button"
            onClick={onToggleTheme}
            aria-label="Toggle color theme"
            className="apple-press flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-app-surface border border-app-border text-app-text-secondary hover:text-app-text hover:border-app-accent/40 shadow-2xs transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-app-accent"
          >
            {resolvedTheme === "dark" ? (
              <Sun strokeWidth={1.5} className="w-4 h-4" />
            ) : (
              <Moon strokeWidth={1.5} className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {totalCount > 0 && (
        <div className="mt-5 pt-3.5 border-t border-app-border">
          <div className="flex items-center justify-between text-xs font-medium text-app-text-secondary mb-2 tabular-nums">
            <span>
              {completedCount} of {totalCount} completed
            </span>
            <span className="font-bold text-app-text">{progressPercent}%</span>
          </div>
          <div className="h-2 w-full bg-app-surface-secondary border border-app-border/40 rounded-full overflow-hidden p-0.5 shadow-inner">
            <div
              className="h-full bg-app-accent rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}
    </header>
  );
};
