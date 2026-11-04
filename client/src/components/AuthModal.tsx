import React, { useEffect } from "react";
import { RegisterPayload, LoginPayload } from "../types/auth";
import { AuthCard } from "./AuthCard";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (payload: LoginPayload) => Promise<boolean>;
  onRegister: (payload: RegisterPayload) => Promise<boolean>;
  onSuccess: () => void;
  onContinueAsGuest?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLogin,
  onRegister,
  onSuccess,
  onContinueAsGuest,
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

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-card-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
    >
      {/* Frosted backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-md transition-opacity"
      />

      <AuthCard
        onLogin={onLogin}
        onRegister={onRegister}
        onSuccess={onSuccess}
        onContinueAsGuest={onContinueAsGuest}
        onClose={onClose}
        isModal={true}
      />
    </div>
  );
};
