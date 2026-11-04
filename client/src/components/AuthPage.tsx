import React from "react";
import { Sun, Moon, ArrowDownToLine } from "lucide-react";
import { RegisterPayload, LoginPayload } from "../types/auth";
import { AuthCard } from "./AuthCard";

interface AuthPageProps {
  onLogin: (payload: LoginPayload) => Promise<boolean>;
  onRegister: (payload: RegisterPayload) => Promise<boolean>;
  onContinueAsGuest: () => void;
  resolvedTheme: "light" | "dark";
  onToggleTheme: () => void;
  isInstallable?: boolean;
  onInstall?: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({
  onLogin,
  onRegister,
  onContinueAsGuest,
  resolvedTheme,
  onToggleTheme,
  isInstallable,
  onInstall,
}) => {
  return (
    <div className="min-h-screen bg-app-bg text-app-text flex flex-col justify-between transition-colors duration-200">
      {/* Top navigation bar */}
      <nav className="w-full max-w-6xl mx-auto px-4 sm:px-8 pt-6 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-app-accent flex items-center justify-center text-white shadow-xs ring-1 ring-black/5 dark:ring-white/10 flex-shrink-0">
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="font-bold tracking-tight text-lg text-app-text leading-tight">
              Slate
            </span>
            <span className="text-[11px] font-medium text-app-text-muted tracking-tight">
              Task List
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
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
            aria-label="Toggle theme"
            className="apple-press flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-app-surface border border-app-border text-app-text-secondary hover:text-app-text hover:border-app-accent/40 shadow-2xs transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-app-accent"
          >
            {resolvedTheme === "dark" ? (
              <Sun strokeWidth={1.5} className="w-4 h-4" />
            ) : (
              <Moon strokeWidth={1.5} className="w-4 h-4" />
            )}
          </button>
        </div>
      </nav>

      {/* Hero section: adaptive mobile-first hierarchy */}
      <main className="w-full max-w-6xl mx-auto px-4 sm:px-8 py-4 sm:py-16 flex-1 flex flex-col justify-center">
        {/* Mobile-only concise title banner */}
        <div className="lg:hidden text-center mb-5 space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-app-text leading-tight">
            Organize with clarity.
          </h1>
          <p className="text-xs text-app-text-muted max-w-xs mx-auto">
            Fast, local-first task management.
          </p>
        </div>

        <div className="w-full grid lg:grid-cols-12 gap-8 lg:gap-16 items-center">
          {/* Left Column: Full editorial typography for desktop only */}
          <div className="hidden lg:block lg:col-span-7 space-y-6 text-left">
            <h1 className="text-5xl lg:text-6xl font-extrabold tracking-tight text-app-text leading-[1.12]">
              Organize with clarity. <br />
              <span className="text-app-text-secondary font-normal">
                Built for speed.
              </span>
            </h1>

            <p className="text-lg text-app-text-muted max-w-xl leading-relaxed font-normal">
              A focused workspace designed for speed and clarity. Capture tasks in
              seconds with keyboard shortcuts, stay productive offline with on-device
              storage, and sync cleanly across devices.
            </p>

            <div className="pt-2 space-y-3.5 max-w-lg text-sm text-app-text-secondary">
              <div className="flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-app-accent flex-shrink-0" />
                <span>Single-key shortcuts to capture, edit, and check off tasks</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-app-accent flex-shrink-0" />
                <span>On-device storage keeps working when offline or disconnected</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-app-accent flex-shrink-0" />
                <span>Private account sync with multi-device session management</span>
              </div>
            </div>
          </div>

          {/* Right Column: Unified login card */}
          <div className="lg:col-span-5 flex flex-col items-center lg:items-end w-full">
            <AuthCard
              onLogin={onLogin}
              onRegister={onRegister}
              onContinueAsGuest={onContinueAsGuest}
              isModal={false}
            />

            {/* Mobile-only micro feature highlight tiles */}
            <div className="lg:hidden mt-5 w-full max-w-sm grid grid-cols-3 gap-2 text-center">
              <div className="p-2.5 rounded-xl bg-app-surface/80 border border-app-border shadow-2xs">
                <p className="text-[11px] font-semibold text-app-text">Keyboard</p>
                <p className="text-[10px] text-app-text-muted mt-0.5">Quick flow</p>
              </div>
              <div className="p-2.5 rounded-xl bg-app-surface/80 border border-app-border shadow-2xs">
                <p className="text-[11px] font-semibold text-app-text">Offline</p>
                <p className="text-[10px] text-app-text-muted mt-0.5">Local cache</p>
              </div>
              <div className="p-2.5 rounded-xl bg-app-surface/80 border border-app-border shadow-2xs">
                <p className="text-[11px] font-semibold text-app-text">Private</p>
                <p className="text-[10px] text-app-text-muted mt-0.5">Device sync</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Discrete footer */}
      <footer className="w-full max-w-6xl mx-auto px-4 sm:px-8 py-6 text-center space-y-1.5">
        <p className="text-[11px] text-app-text-muted">
          Slate (Task List) by{" "}
          <a
            href="https://www.linkedin.com/in/John--Varghese"
            target="_blank"
            rel="noopener noreferrer"
            className="text-app-text-secondary hover:text-app-text underline-offset-2 hover:underline transition-colors font-medium"
          >
            John Varghese (J0X)
          </a>
        </p>
        <p className="text-[10px] text-app-text-muted/70">
          Zero tracking cookies. Device-first Local Storage. Multi-tenant database isolation.
        </p>
      </footer>
    </div>
  );
};
