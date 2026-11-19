import React, { useState, useEffect, useRef } from "react";
import { X, Lock, Mail, User as UserIcon, Loader2, HardDrive, Eye, EyeOff } from "lucide-react";
import { RegisterPayload, LoginPayload } from "../types/auth";
import { PasswordSecurityBar } from "./PasswordSecurityBar";
import { LiquidGlassPane, appleCardLens } from "./glass";

export interface AuthCardProps {
  onLogin: (payload: LoginPayload) => Promise<boolean>;
  onRegister: (payload: RegisterPayload) => Promise<boolean>;
  onSuccess?: () => void;
  onContinueAsGuest?: () => void;
  onClose?: () => void;
  isModal?: boolean;
}

export const AuthCard: React.FC<AuthCardProps> = ({
  onLogin,
  onRegister,
  onSuccess,
  onContinueAsGuest,
  onClose,
  isModal = false,
}) => {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const emailInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setError(null);
    const timer = setTimeout(() => {
      emailInputRef.current?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, [mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError("Please enter your email");
      return;
    }
    if (!password) {
      setError("Please enter your password");
      return;
    }

    if (mode === "register") {
      const trimmedName = name.trim();
      if (!trimmedName) {
        setError("Please enter your name");
        return;
      }
      if (password.length < 8) {
        setError("Password must be at least 8 characters");
        return;
      }

      setIsSubmitting(true);
      try {
        await onRegister({ email: trimmedEmail, password, name: trimmedName });
        if (onSuccess) onSuccess();
        if (onClose) onClose();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to register account");
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setIsSubmitting(true);
      try {
        await onLogin({ email: trimmedEmail, password });
        if (onSuccess) onSuccess();
        if (onClose) onClose();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Invalid email or password");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const cardContent = (
    <>
      {isModal && onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          className="apple-press absolute top-4 right-4 w-7 h-7 rounded-full flex items-center justify-center text-app-text-muted hover:text-app-text hover:bg-app-bg transition-colors"
        >
          <X strokeWidth={1.5} className="w-4 h-4" />
        </button>
      )}

      <div className="text-center mb-4 sm:mb-5">
        {isModal && (
          <div className="squircle-tile w-11 h-11 mx-auto bg-app-surface border border-app-border flex items-center justify-center mb-3 shadow-2xs">
            <div className="w-6 h-6 rounded-lg bg-app-accent flex items-center justify-center shadow-xs">
              <svg
                className="w-3.5 h-3.5 text-white"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M5 12.5L9.5 17L19 7.5"
                  stroke="#FFFFFF"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        )}
        <h2
          id="auth-card-title"
          className={`text-base sm:text-lg font-bold tracking-tight ${
            isModal ? "text-app-text" : "text-white"
          }`}
        >
          {mode === "login" ? "Sign In to Slate" : "Create Slate Account"}
        </h2>
        <p
          className={`text-xs mt-1 ${
            isModal ? "text-app-text-secondary" : "text-slate-300"
          }`}
        >
          Sync tasks across your devices
        </p>
      </div>

      {/* Segmented tab switcher */}
      <div
        className={`flex items-center p-1 rounded-xl mb-4 text-xs font-medium border transition-all ${
          isModal
            ? "bg-app-bg/80 border-app-border"
            : "bg-black/45 border-white/15 backdrop-blur-md"
        }`}
      >
        <button
          type="button"
          onClick={() => {
            setMode("login");
            setError(null);
          }}
          className={`apple-press flex-1 py-1.5 rounded-lg text-center font-medium transition-all duration-150 ${
            mode === "login"
              ? isModal
                ? "bg-app-surface text-app-text font-semibold shadow-xs ring-1 ring-app-border"
                : "bg-white/20 text-white font-medium shadow-[0_1px_3px_rgba(0,0,0,0.3)] ring-1 ring-white/20 backdrop-blur-sm"
              : isModal
              ? "text-app-text-secondary hover:text-app-text"
              : "text-zinc-300 hover:text-white"
          }`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => {
            setMode("register");
            setError(null);
          }}
          className={`apple-press flex-1 py-1.5 rounded-lg text-center font-medium transition-all duration-150 ${
            mode === "register"
              ? isModal
                ? "bg-app-surface text-app-text font-semibold shadow-xs ring-1 ring-app-border"
                : "bg-white/20 text-white font-medium shadow-[0_1px_3px_rgba(0,0,0,0.3)] ring-1 ring-white/20 backdrop-blur-sm"
              : isModal
              ? "text-app-text-secondary hover:text-app-text"
              : "text-zinc-300 hover:text-white"
          }`}
        >
          Create Account
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-app-danger/10 border border-app-danger/25 text-app-danger text-xs space-y-1.5 animate-fade-in">
          <p className="font-semibold text-center">{error}</p>
          {mode === "login" && (
            <div className="pt-1.5 border-t border-app-danger/20 flex items-center justify-between text-[11px]">
              <span className="text-app-text-secondary">No account yet?</span>
              <button
                type="button"
                onClick={() => {
                  setMode("register");
                  setError(null);
                }}
                className="apple-press font-semibold text-app-accent hover:underline"
              >
                Create Account
              </button>
            </div>
          )}
          {onContinueAsGuest && (
            <div className="pt-1.5 border-t border-app-danger/20 flex items-center justify-between text-[11px]">
              <span className="text-app-text-secondary">Or use on-device:</span>
              <button
                type="button"
                onClick={() => {
                  onContinueAsGuest();
                  if (onClose) onClose();
                }}
                className="apple-press font-semibold text-app-accent hover:underline"
              >
                Use Guest Mode
              </button>
            </div>
          )}
        </div>
      )}

      {/* grouped inset input container */}
      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div
          className={`rounded-2xl border divide-y overflow-hidden transition-all ${
            isModal
              ? "bg-app-bg/80 border-app-border divide-app-border focus-within:ring-2 focus-within:ring-app-accent/25 focus-within:border-app-accent/40"
              : "bg-black/50 border-white/15 divide-white/10 focus-within:ring-2 focus-within:ring-blue-500/40 focus-within:border-blue-400/80"
          }`}
        >
          {mode === "register" && (
            <div className="relative flex items-center">
              <label htmlFor="auth-name" className="sr-only">Full Name</label>
              <UserIcon
                strokeWidth={1.5}
                className={`w-4 h-4 absolute left-3.5 pointer-events-none ${
                  isModal ? "text-app-text-muted" : "text-slate-400"
                }`}
              />
              <input
                id="auth-name"
                name="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full Name"
                autoComplete="name"
                spellCheck={false}
                enterKeyHint="next"
                className={`w-full pl-10 pr-3.5 py-3 text-base sm:text-xs bg-transparent focus:outline-none ${
                  isModal
                    ? "text-app-text placeholder:text-app-text-muted"
                    : "text-white placeholder:text-slate-400"
                }`}
              />
            </div>
          )}

          <div className="relative flex items-center">
            <label htmlFor="auth-email" className="sr-only">Email address</label>
            <Mail
              strokeWidth={1.5}
              className={`w-4 h-4 absolute left-3.5 pointer-events-none ${
                isModal ? "text-app-text-muted" : "text-slate-400"
              }`}
            />
            <input
              ref={emailInputRef}
              id="auth-email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              autoComplete="email"
              spellCheck={false}
              enterKeyHint="next"
              className={`w-full pl-10 pr-3.5 py-3 text-base sm:text-xs bg-transparent focus:outline-none ${
                isModal
                  ? "text-app-text placeholder:text-app-text-muted"
                    : "text-white placeholder:text-slate-400"
              }`}
            />
          </div>

          <div className="relative flex items-center">
            <label htmlFor="auth-password" className="sr-only">Password</label>
            <Lock
              strokeWidth={1.5}
              className={`w-4 h-4 absolute left-3.5 pointer-events-none ${
                isModal ? "text-app-text-muted" : "text-slate-400"
              }`}
            />
            <input
              id="auth-password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={mode === "register" ? "Password (8+ characters)" : "Password"}
              autoComplete={mode === "register" ? "new-password" : "current-password"}
              enterKeyHint="done"
              className={`w-full pl-10 pr-10 py-3 text-base sm:text-xs bg-transparent focus:outline-none ${
                isModal
                  ? "text-app-text placeholder:text-app-text-muted"
                  : "text-white placeholder:text-slate-400"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={0}
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
              title={showPassword ? "Hide password" : "Show password"}
              className={`apple-press absolute right-2.5 p-1.5 rounded-lg transition-colors focus:outline-none focus:ring-1 focus:ring-white/20 ${
                isModal
                  ? "text-app-text-muted hover:text-app-text hover:bg-app-bg"
                  : "text-zinc-400 hover:text-white hover:bg-white/10"
              }`}
            >
              {showPassword ? (
                <EyeOff strokeWidth={1.5} className="w-4 h-4" />
              ) : (
                <Eye strokeWidth={1.5} className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {mode === "register" && (
          <PasswordSecurityBar password={password} className="px-0.5 pt-0.5 pb-1" />
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="apple-press w-full py-2.5 sm:py-3 rounded-xl bg-gradient-to-b from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 active:scale-[0.985] text-white text-xs sm:text-sm font-medium tracking-tight shadow-[0_4px_16px_rgba(37,99,235,0.4),inset_0_1px_0_rgba(255,255,255,0.3)] ring-1 ring-blue-400/50 disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <Loader2 strokeWidth={2} className="w-3.5 h-3.5 animate-spin" />
              <span>{mode === "login" ? "Signing In..." : "Creating Account..."}</span>
            </>
          ) : (
            <span>{mode === "login" ? "Sign In" : "Create Account"}</span>
          )}
        </button>
      </form>

      {onContinueAsGuest && (
        <>
          <div className="relative my-3 flex items-center justify-center">
            <div
              className={`w-full border-t ${
                isModal ? "border-app-border" : "border-white/15"
              }`}
            />
            <span
              className={`absolute px-2.5 text-[10px] uppercase font-semibold tracking-wider ${
                isModal
                  ? "bg-app-surface text-app-text-muted"
                  : "bg-slate-900 text-slate-400"
              }`}
            >
              or
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              onContinueAsGuest();
              if (onClose) onClose();
            }}
            className={`apple-press w-full py-2.5 rounded-xl text-xs font-medium transition-all duration-150 flex items-center justify-center gap-2 group shadow-2xs active:scale-[0.985] ${
              isModal
                ? "bg-app-bg border border-app-border text-app-text hover:text-app-text hover:border-app-accent/40"
                : "bg-white/[0.06] hover:bg-white/[0.12] active:bg-white/[0.04] border border-white/15 hover:border-white/25 text-zinc-200 hover:text-white shadow-xs backdrop-blur-sm"
            }`}
          >
            <HardDrive
              strokeWidth={1.5}
              className={`w-3.5 h-3.5 transition-colors ${
                isModal
                  ? "text-app-text-muted group-hover:text-app-accent"
                  : "text-slate-300 group-hover:text-white"
              }`}
            />
            <span>Continue as Guest</span>
            <span
              className={`text-[10px] ${
                isModal ? "text-app-text-muted" : "text-slate-300"
              }`}
            >
              (On-device storage)
            </span>
          </button>
        </>
      )}
    </>
  );

  if (isModal) {
    return (
      <div
        role="region"
        aria-labelledby="auth-card-title"
        className="squircle-tile relative w-full max-w-sm bg-app-surface border border-app-border p-6 sm:p-7 shadow-2xl z-10 animate-scale-in text-app-text"
        style={{ borderRadius: "28px" }}
      >
        {cardContent}
      </div>
    );
  }

  return (
    <LiquidGlassPane
      borderRadius={28}
      displacement={32}
      lens={appleCardLens}
      tintColor="rgba(15, 23, 42, 0.32)"
      blur={8}
      saturate={1.8}
      onMouseEnter={() => {
        (window as any).__GE_valley?.startHoverTransition?.();
      }}
      onMouseLeave={() => {
        (window as any).__GE_valley?.stopHoverTransition?.();
      }}
      className="w-full max-w-sm p-6 sm:p-7 transition-all text-white shadow-2xl"
    >
      {cardContent}
    </LiquidGlassPane>
  );
};

