import React from "react";
import { ArrowDownToLine, Heart } from "lucide-react";
import { RegisterPayload, LoginPayload } from "../types/auth";
import { AuthCard } from "./AuthCard";
import { ValleyBackground } from "./ValleyBackground";
import { LiquidGlassPane, paneLens, appleCardLens } from "./glass";

interface AuthPageProps {
  onLogin: (payload: LoginPayload) => Promise<boolean>;
  onRegister: (payload: RegisterPayload) => Promise<boolean>;
  onContinueAsGuest: () => void;
  resolvedTheme?: "light" | "dark";
  onToggleTheme?: () => void;
  isInstallable?: boolean;
  onInstall?: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({
  onLogin,
  onRegister,
  onContinueAsGuest,
  isInstallable,
  onInstall,
}) => {
  return (
    <div className="relative min-h-screen bg-transparent text-app-text flex flex-col justify-between transition-colors duration-200 overflow-hidden">
      {/* authentic 3d flower valley background */}
      <ValleyBackground />

      {/* Top navigation bar */}
      <nav className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-8 pt-5 sm:pt-7 pb-2 sm:pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Apple continuous G2/G3 squircle logo */}
          <div className="w-10 h-10 rounded-[14px] bg-gradient-to-b from-blue-500 to-blue-600 flex items-center justify-center text-white shadow-[0_2px_12px_rgba(37,99,235,0.4),inset_0_1px_1px_rgba(255,255,255,0.4)] ring-1 ring-white/25 flex-shrink-0 transition-transform duration-200 hover:scale-105">
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-label="Slate logo"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="font-bold tracking-tight text-lg text-white leading-tight">
              Slate
            </span>
            <span className="text-[11px] font-medium text-slate-300 tracking-tight">
              Task List
            </span>
          </div>
        </div>

        {/* Top actions without theme toggle */}
        <div className="flex items-center gap-2.5">
          {isInstallable && onInstall && (
            <LiquidGlassPane
              borderRadius={14}
              displacement={20}
              lens={paneLens}
              tintColor="rgba(15, 23, 42, 0.28)"
              blur={6}
              className="cursor-pointer"
            >
              <button
                type="button"
                onClick={onInstall}
                aria-label="Install Slate as standalone app"
                className="apple-press inline-flex items-center gap-1.5 h-9 px-3.5 text-xs font-medium text-zinc-200 hover:text-white transition-all shadow-xs"
              >
                <ArrowDownToLine strokeWidth={1.5} className="w-3.5 h-3.5 text-blue-400" />
                <span className="hidden sm:inline">Install</span>
              </button>
            </LiquidGlassPane>
          )}
        </div>
      </nav>

      {/* Hero section: senior editorial typography and architectural specs */}
      <main className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-8 py-2 sm:py-16 flex-1 flex flex-col justify-center">
        {/* Mobile-only concise title banner */}
        <div className="lg:hidden text-center mb-4 sm:mb-6 space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight text-white leading-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
            Organize with clarity.
          </h1>
          <p className="text-xs text-zinc-300 max-w-xs mx-auto drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)]">
            Add, edit, and check off tasks with effortless speed. Works offline, stays in sync.
          </p>
        </div>

        <div className="w-full grid lg:grid-cols-12 gap-8 lg:gap-16 items-center">
          {/* Left Column: Senior editorial typography & technical spec tiles */}
          <div className="hidden lg:block lg:col-span-7 space-y-7 text-left">
            <div className="space-y-3">
              <h1 className="text-5xl lg:text-6xl font-medium tracking-[-0.03em] text-white leading-[1.06] drop-shadow-[0_2px_12px_rgba(0,0,0,0.7)]">
                Organize with clarity. <br />
                <span className="text-zinc-300 font-normal">
                  Engineered for speed.
                </span>
              </h1>

              <p className="text-base lg:text-lg text-zinc-200/95 max-w-xl leading-relaxed font-normal pt-1 drop-shadow-[0_1px_6px_rgba(0,0,0,0.7)]">
                Add, edit, and check off tasks with effortless speed. Work completely offline, move fast with single keystrokes, and sync seamlessly across all your devices.
              </p>
            </div>

            {/* Architectural specification cards with liquid lightly tinted glass */}
            <div className="grid grid-cols-3 gap-3.5 pt-1 max-w-lg">
              <LiquidGlassPane
                borderRadius={18}
                displacement={28}
                lens={paneLens}
                tintColor="rgba(15, 23, 42, 0.28)"
                blur={6}
                saturate={1.8}
                className="p-4 space-y-1.5 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-xl group cursor-default"
              >
                <div className="text-xs font-semibold text-white tracking-tight">Instant Capture</div>
                <p className="text-[11px] text-zinc-200 leading-relaxed font-normal">Quick keystrokes let you add and edit without missing a beat.</p>
              </LiquidGlassPane>

              <LiquidGlassPane
                borderRadius={18}
                displacement={28}
                lens={paneLens}
                tintColor="rgba(15, 23, 42, 0.28)"
                blur={6}
                saturate={1.8}
                className="p-4 space-y-1.5 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-xl group cursor-default"
              >
                <div className="text-xs font-semibold text-white tracking-tight">Offline Freedom</div>
                <p className="text-[11px] text-zinc-200 leading-relaxed font-normal">Every change stays safe on your device, with or without internet.</p>
              </LiquidGlassPane>

              <LiquidGlassPane
                borderRadius={18}
                displacement={28}
                lens={paneLens}
                tintColor="rgba(15, 23, 42, 0.28)"
                blur={6}
                saturate={1.8}
                className="p-4 space-y-1.5 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-xl group cursor-default"
              >
                <div className="text-xs font-semibold text-white tracking-tight">Seamless Sync</div>
                <p className="text-[11px] text-zinc-200 leading-relaxed font-normal">Private cloud sync keeps your tasks up to date across all your screens.</p>
              </LiquidGlassPane>
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

            {/* Mobile architectural highlights */}
            <div className="lg:hidden mt-3.5 w-full max-w-sm grid grid-cols-3 gap-2 text-left">
              <LiquidGlassPane
                borderRadius={14}
                displacement={20}
                lens={paneLens}
                tintColor="rgba(15, 23, 42, 0.28)"
                blur={6}
                className="p-3 space-y-0.5"
              >
                <div className="text-[11px] font-semibold text-white">Capture</div>
                <p className="text-[10px] text-zinc-300">Keyboard</p>
              </LiquidGlassPane>

              <LiquidGlassPane
                borderRadius={14}
                displacement={20}
                lens={paneLens}
                tintColor="rgba(15, 23, 42, 0.28)"
                blur={6}
                className="p-3 space-y-0.5"
              >
                <div className="text-[11px] font-semibold text-white">Buffer</div>
                <p className="text-[10px] text-zinc-300">Offline</p>
              </LiquidGlassPane>

              <LiquidGlassPane
                borderRadius={14}
                displacement={20}
                lens={paneLens}
                tintColor="rgba(15, 23, 42, 0.28)"
                blur={6}
                className="p-3 space-y-0.5"
              >
                <div className="text-[11px] font-semibold text-white">Sync</div>
                <p className="text-[10px] text-zinc-300">Private</p>
              </LiquidGlassPane>
            </div>
          </div>
        </div>
      </main>

      {/* bottom footer with g2 rounded top */}
      <footer className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-8">
        <LiquidGlassPane
          borderRadius={28}
          displacement={32}
          lens={appleCardLens}
          tintColor="rgba(15, 23, 42, 0.32)"
          blur={8}
          saturate={1.8}
          style={{
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0,
          }}
          className="w-full px-6 sm:px-8 py-4 sm:py-5 border-t border-x border-white/[0.12] shadow-2xl transition-all"
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-200">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-3 gap-y-1 text-center sm:text-left">
              <span className="text-white font-medium">Slate</span>
              <span className="text-zinc-500">&bull;</span>
              <span className="inline-flex items-center gap-1 text-zinc-300">
                Crafted with
                <Heart
                  strokeWidth={1.5}
                  className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline-block transition-transform duration-200 hover:scale-125"
                  aria-label="love"
                />
                by
              </span>
              <a
                href="https://www.linkedin.com/in/John--Varghese"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:underline transition-colors font-medium"
              >
                John Varghese (J0X)
              </a>
              <span className="text-zinc-500 hidden md:inline">&bull;</span>
              <span className="text-zinc-300 hidden md:inline">Zero tracking cookies &bull; Local-first sync</span>
            </div>

            <div className="hidden sm:flex items-center gap-2 text-[11px] font-medium tracking-wide text-zinc-300 flex-shrink-0">
              <svg className="w-3.5 h-3.5 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="5" y="2" width="14" height="20" rx="7" />
                <line x1="12" y1="6" x2="12" y2="10" />
              </svg>
              <span>Scroll to explore the valley</span>
            </div>
          </div>
        </LiquidGlassPane>
      </footer>
    </div>
  );
};
