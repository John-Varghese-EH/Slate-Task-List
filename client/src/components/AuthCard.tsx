import React, { useState, useEffect, useRef } from "react";
import { X, Lock, Mail, User as UserIcon, Loader2, HardDrive, Eye, EyeOff } from "lucide-react";
import { RegisterPayload, LoginPayload } from "../types/auth";
import { PasswordSecurityBar } from "./PasswordSecurityBar";

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

  return (
    <div
      className={`squircle-tile relative w-full max-w-sm bg-app-surface border border-app-border p-6 sm:p-7 shadow-2xl transition-all ${
        isModal ? "z-10 animate-scale-in" : "shadow-xl"
      }`}
    >
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
        <h2 id="auth-card-title" className="text-base sm:text-lg font-bold tracking-tight text-app-text">
          {mode === "login" ? "Sign In to Slate" : "Create Slate Account"}
        </h2>
        <p className="text-xs text-app-text-secondary mt-1">
          Sync tasks across your devices
        </p>
      </div>

      {/* Segmented tab switcher */}
      <div className="flex items-center p-1 rounded-xl bg-app-bg border border-app-border mb-4 text-xs font-medium">
        <button
          type="button"
          onClick={() => {
            setMode("login");
            setError(null);
          }}
          className={`apple-press flex-1 py-1.5 rounded-lg text-center transition-all ${
            mode === "login"
              ? "bg-app-surface text-app-text font-semibold shadow-xs"
              : "text-app-text-secondary hover:text-app-text"
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
          className={`apple-press flex-1 py-1.5 rounded-lg text-center transition-all ${
            mode === "register"
              ? "bg-app-surface text-app-text font-semibold shadow-xs"
              : "text-app-text-secondary hover:text-app-text"
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
        <div className="rounded-2xl bg-app-bg/80 border border-app-border divide-y divide-app-border overflow-hidden focus-within:ring-2 focus-within:ring-app-accent/25 focus-within:border-app-accent/40 transition-all">
          {mode === "register" && (
            <div className="relative flex items-center">
              <UserIcon
                strokeWidth={1.5}
                className="w-4 h-4 text-app-text-muted absolute left-3.5 pointer-events-none"
              />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full Name"
                autoComplete="name"
                className="w-full pl-10 pr-3.5 py-3 text-base sm:text-xs bg-transparent text-app-text placeholder:text-app-text-muted focus:outline-none"
              />
            </div>
          )}

          <div className="relative flex items-center">
            <Mail
              strokeWidth={1.5}
              className="w-4 h-4 text-app-text-muted absolute left-3.5 pointer-events-none"
            />
            <input
              ref={emailInputRef}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              autoComplete="email"
              className="w-full pl-10 pr-3.5 py-3 text-base sm:text-xs bg-transparent text-app-text placeholder:text-app-text-muted focus:outline-none"
            />
          </div>

          <div className="relative flex items-center">
            <Lock
              strokeWidth={1.5}
              className="w-4 h-4 text-app-text-muted absolute left-3.5 pointer-events-none"
            />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={mode === "register" ? "Password (8+ characters)" : "Password"}
              autoComplete={mode === "register" ? "new-password" : "current-password"}
              className="w-full pl-10 pr-10 py-3 text-base sm:text-xs bg-transparent text-app-text placeholder:text-app-text-muted focus:outline-none"
            />
            {password.length > 0 && (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="apple-press absolute right-3 p-1 text-app-text-muted hover:text-app-text transition-colors"
              >
                {showPassword ? (
                  <EyeOff strokeWidth={1.5} className="w-4 h-4" />
                ) : (
                  <Eye strokeWidth={1.5} className="w-4 h-4" />
                )}
              </button>
            )}
          </div>
        </div>

        {mode === "register" && (
          <PasswordSecurityBar password={password} className="px-0.5 pt-0.5 pb-1" />
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="apple-press w-full py-2.5 sm:py-3 rounded-xl bg-app-accent text-white text-xs sm:text-sm font-semibold hover:opacity-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-xs"
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
            <div className="w-full border-t border-app-border" />
            <span className="absolute bg-app-surface px-2.5 text-[10px] uppercase font-semibold tracking-wider text-app-text-muted">
              or
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              onContinueAsGuest();
              if (onClose) onClose();
            }}
            className="apple-press w-full py-2.5 rounded-xl bg-app-bg border border-app-border text-app-text hover:text-app-text hover:border-app-accent/40 text-xs font-medium transition-all flex items-center justify-center gap-2 group shadow-2xs"
          >
            <HardDrive strokeWidth={1.5} className="w-3.5 h-3.5 text-app-text-muted group-hover:text-app-accent transition-colors" />
            <span>Continue as Guest</span>
            <span className="text-[10px] text-app-text-muted">(On-device storage)</span>
          </button>
        </>
      )}
    </div>
  );
};
