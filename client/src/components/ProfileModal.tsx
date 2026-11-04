import React, { useState, useEffect } from "react";
import {
  X,
  User as UserIcon,
  Shield,
  Laptop,
  Check,
  AlertCircle,
  AlertTriangle,
  LogOut,
  KeyRound,
  Calendar,
  Trash2,
  Eye,
  EyeOff,
} from "lucide-react";
import { User, SessionInfo, DeleteAccountPayload } from "../types/auth";
import { PasswordSecurityBar } from "./PasswordSecurityBar";
import { playTactileFeedback } from "../utils/haptics";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onUpdateProfile: (payload: { name?: string; email?: string }) => Promise<User>;
  onChangePassword: (payload: {
    currentPassword: string;
    newPassword: string;
  }) => Promise<string>;
  onGetSessions: () => Promise<{
    currentSessionId?: string;
    sessions: SessionInfo[];
  }>;
  onLogoutAll: () => Promise<void>;
  onLogout: () => Promise<void>;
  onDeleteAccount: (payload: DeleteAccountPayload) => Promise<void>;
}

type Tab = "account" | "devices" | "security";

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  onUpdateProfile,
  onChangePassword,
  onGetSessions,
  onLogoutAll,
  onLogout,
  onDeleteAccount,
}) => {
  const [activeTab, setActiveTab] = useState<Tab>("account");
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | undefined>();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [showDeletePassword, setShowDeletePassword] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeletePassword("");
    setDeleteConfirmText("");
    setShowDeletePassword(false);
    setDeleteError(null);
  };

  const handleDeleteAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deletePassword || deleteConfirmText.trim() !== "DELETE") {
      setDeleteError("Please enter your password and type DELETE to confirm");
      return;
    }

    try {
      setIsDeletingAccount(true);
      setDeleteError(null);
      playTactileFeedback();
      await onDeleteAccount({
        password: deletePassword,
        confirmText: deleteConfirmText,
      });
      handleCloseDeleteModal();
      onClose();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to delete account";
      setDeleteError(message);
    } finally {
      setIsDeletingAccount(false);
    }
  };

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user]);

  useEffect(() => {
    if (!isOpen) {
      setStatusMessage(null);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      handleCloseDeleteModal();
      return;
    }

    const loadSessions = async () => {
      try {
        const res = await onGetSessions();
        setSessions(res.sessions || []);
        setCurrentSessionId(res.currentSessionId);
      } catch {
        // quiet fallback
      }
    };

    loadSessions();
  }, [isOpen, onGetSessions]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isDeleteModalOpen) {
          handleCloseDeleteModal();
        } else if (isOpen) {
          onClose();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isDeleteModalOpen, onClose]);

  if (!isOpen || !user) return null;

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);
    setIsSubmitting(true);
    try {
      await onUpdateProfile({ name: name.trim(), email: email.trim() });
      setStatusMessage({
        type: "success",
        text: "Profile updated successfully.",
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update profile";
      setStatusMessage({ type: "error", text: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    if (newPassword !== confirmPassword) {
      setStatusMessage({
        type: "error",
        text: "New passwords do not match.",
      });
      return;
    }

    if (newPassword.length < 8) {
      setStatusMessage({
        type: "error",
        text: "New password must be at least 8 characters.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const msg = await onChangePassword({
        currentPassword,
        newPassword,
      });
      setStatusMessage({
        type: "success",
        text: msg || "Password changed successfully.",
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to change password";
      setStatusMessage({ type: "error", text: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogoutAll = async () => {
    if (!window.confirm("Sign out from all active devices and sessions?")) {
      return;
    }
    setIsSubmitting(true);
    try {
      await onLogoutAll();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to sign out all sessions";
      setStatusMessage({ type: "error", text: msg });
      setIsSubmitting(false);
    }
  };

  const memberSinceFormatted = user.createdAt
    ? new Intl.DateTimeFormat("en-US", {
        month: "long",
        year: "numeric",
      }).format(new Date(user.createdAt))
    : "Recently";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
    >
      <div
        className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-md transition-opacity animate-fade-in"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md bg-app-surface border border-app-border rounded-2xl shadow-2xl overflow-hidden z-10 animate-scale-in">
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-app-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-app-accent/15 text-app-accent font-semibold flex items-center justify-center text-sm uppercase">
              {user.name ? user.name[0] : "U"}
            </div>
            <div>
              <h2
                id="profile-modal-title"
                className="text-base font-semibold text-app-text tracking-tight"
              >
                {user.name}
              </h2>
              <p className="text-xs text-app-text-muted">{user.email}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close profile"
            className="apple-press p-1.5 rounded-lg text-app-text-muted hover:text-app-text hover:bg-app-bg transition-colors"
          >
            <X strokeWidth={1.5} className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5 pt-3">
          <div className="grid grid-cols-3 p-1 rounded-xl bg-app-bg border border-app-border text-xs font-medium">
            <button
              type="button"
              onClick={() => {
                setActiveTab("account");
                setStatusMessage(null);
              }}
              className={`apple-press py-1.5 rounded-lg transition-all inline-flex items-center justify-center gap-1.5 ${
                activeTab === "account"
                  ? "bg-app-surface text-app-text shadow-2xs font-semibold"
                  : "text-app-text-secondary hover:text-app-text"
              }`}
            >
              <UserIcon strokeWidth={1.5} className="w-3.5 h-3.5" />
              <span>Account</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab("devices");
                setStatusMessage(null);
              }}
              className={`apple-press py-1.5 rounded-lg transition-all inline-flex items-center justify-center gap-1.5 ${
                activeTab === "devices"
                  ? "bg-app-surface text-app-text shadow-2xs font-semibold"
                  : "text-app-text-secondary hover:text-app-text"
              }`}
            >
              <Laptop strokeWidth={1.5} className="w-3.5 h-3.5" />
              <span>Devices</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab("security");
                setStatusMessage(null);
              }}
              className={`apple-press py-1.5 rounded-lg transition-all inline-flex items-center justify-center gap-1.5 ${
                activeTab === "security"
                  ? "bg-app-surface text-app-text shadow-2xs font-semibold"
                  : "text-app-text-secondary hover:text-app-text"
              }`}
            >
              <Shield strokeWidth={1.5} className="w-3.5 h-3.5" />
              <span>Security</span>
            </button>
          </div>
        </div>

        <div className="p-5 space-y-4 max-h-[65vh] overflow-y-auto">
          {statusMessage && (
            <div
              className={`flex items-start gap-2 p-3 rounded-xl text-xs border animate-fade-in ${
                statusMessage.type === "success"
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                  : "bg-app-danger/10 border-app-danger/20 text-app-danger"
              }`}
            >
              {statusMessage.type === "success" ? (
                <Check strokeWidth={1.5} className="w-4 h-4 mt-0.5 flex-shrink-0" />
              ) : (
                <AlertCircle
                  strokeWidth={1.5}
                  className="w-4 h-4 mt-0.5 flex-shrink-0"
                />
              )}
              <span className="font-medium">{statusMessage.text}</span>
            </div>
          )}

          {activeTab === "account" && (
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-app-text-secondary uppercase tracking-wider mb-1.5">
                  Display Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-app-bg border border-app-border text-sm text-app-text placeholder:text-app-text-muted focus:outline-none focus:border-app-accent focus:ring-1 focus:ring-app-accent transition-all text-base sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-app-text-secondary uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-app-bg border border-app-border text-sm text-app-text placeholder:text-app-text-muted focus:outline-none focus:border-app-accent focus:ring-1 focus:ring-app-accent transition-all text-base sm:text-sm"
                />
              </div>

              <div className="pt-2 flex items-center justify-between text-xs text-app-text-muted border-t border-app-border">
                <span className="inline-flex items-center gap-1.5">
                  <Calendar strokeWidth={1.5} className="w-3.5 h-3.5" />
                  <span>Member since</span>
                </span>
                <span className="font-medium text-app-text-secondary">
                  {memberSinceFormatted}
                </span>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="apple-press flex-1 py-2.5 px-4 rounded-xl bg-app-accent text-white text-xs font-semibold shadow-xs hover:opacity-95 disabled:opacity-50 transition-all"
                >
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    await onLogout();
                    onClose();
                  }}
                  className="apple-press py-2.5 px-3 rounded-xl bg-app-bg border border-app-border text-app-danger hover:border-app-danger/40 text-xs font-medium transition-all inline-flex items-center gap-1.5"
                  title="Sign out of this session"
                >
                  <LogOut strokeWidth={1.5} className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </form>
          )}

          {activeTab === "devices" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-app-text-secondary">
                  {sessions.length} active{" "}
                  {sessions.length === 1 ? "session" : "sessions"} across your devices.
                </p>
                {sessions.length > 1 && (
                  <button
                    type="button"
                    onClick={handleLogoutAll}
                    disabled={isSubmitting}
                    className="apple-press text-xs font-medium text-app-danger hover:underline disabled:opacity-50"
                  >
                    Sign out all others
                  </button>
                )}
              </div>

              <div className="space-y-2">
                {sessions.map((sess) => {
                  const isCurrent =
                    sess.id === currentSessionId || sessions.length === 1;
                  const dateStr = new Intl.DateTimeFormat("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  }).format(new Date(sess.createdAt));

                  return (
                    <div
                      key={sess.id}
                      className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-colors ${
                        isCurrent
                          ? "bg-app-accent/5 border-app-accent/30"
                          : "bg-app-bg border-app-border"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            isCurrent
                              ? "bg-app-accent/20 text-app-accent"
                              : "bg-app-surface text-app-text-muted"
                          }`}
                        >
                          <Laptop strokeWidth={1.5} className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-app-text truncate">
                              {isCurrent ? "This Device" : "Web Session"}
                            </span>
                            {isCurrent && (
                              <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[10px] font-semibold">
                                Active
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-app-text-muted">
                            Started {dateStr}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-2 border-t border-app-border">
                <button
                  type="button"
                  onClick={handleLogoutAll}
                  disabled={isSubmitting}
                  className="apple-press w-full py-2.5 px-4 rounded-xl bg-app-danger/10 border border-app-danger/20 text-app-danger text-xs font-semibold hover:bg-app-danger/15 transition-all inline-flex items-center justify-center gap-2"
                >
                  <LogOut strokeWidth={1.5} className="w-3.5 h-3.5" />
                  <span>Sign Out All Devices</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="space-y-4">
              <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-app-text-secondary uppercase tracking-wider mb-1.5">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    autoComplete="current-password"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-app-bg border border-app-border text-sm text-app-text placeholder:text-app-text-muted focus:outline-none focus:border-app-accent focus:ring-1 focus:ring-app-accent transition-all text-base sm:text-sm"
                  />
                  <KeyRound
                    strokeWidth={1.5}
                    className="w-4 h-4 text-app-text-muted absolute right-3.5 top-3"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-app-text-secondary uppercase tracking-wider mb-1.5">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-app-bg border border-app-border text-sm text-app-text placeholder:text-app-text-muted focus:outline-none focus:border-app-accent focus:ring-1 focus:ring-app-accent transition-all text-base sm:text-sm"
                />
                {newPassword.length > 0 && (
                  <PasswordSecurityBar password={newPassword} className="pt-2 px-0.5" />
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-app-text-secondary uppercase tracking-wider mb-1.5">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  autoComplete="new-password"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-app-bg border border-app-border text-sm text-app-text placeholder:text-app-text-muted focus:outline-none focus:border-app-accent focus:ring-1 focus:ring-app-accent transition-all text-base sm:text-sm"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="apple-press w-full py-2.5 px-4 rounded-xl bg-app-accent text-white text-xs font-semibold shadow-xs hover:opacity-95 disabled:opacity-50 transition-all"
                >
                  {isSubmitting ? "Updating..." : "Update Password"}
                </button>
              </div>
            </form>

            <div className="pt-4 mt-2 border-t border-app-border space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-app-danger uppercase tracking-wider">
                <AlertTriangle strokeWidth={1.8} className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Danger Zone</span>
              </div>

              <div className="p-3.5 rounded-xl border border-rose-500/20 bg-rose-500/5 space-y-2.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div>
                    <h4 className="text-xs font-semibold text-app-text">Delete Account</h4>
                    <p className="text-[11px] text-app-text-muted mt-0.5">
                      Permanently erase your account, sessions, and all tasks.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      playTactileFeedback();
                      setIsDeleteModalOpen(true);
                    }}
                    className="apple-press px-3.5 py-1.5 rounded-xl bg-app-danger text-white text-xs font-semibold shadow-xs hover:opacity-90 flex-shrink-0 inline-flex items-center justify-center gap-1.5 self-start sm:self-auto"
                  >
                    <Trash2 strokeWidth={1.5} className="w-3.5 h-3.5" />
                    <span>Delete Account...</span>
                  </button>
                </div>
              </div>
            </div>
            </div>
          )}
        </div>
      </div>

      {isDeleteModalOpen && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
          onClick={handleCloseDeleteModal}
        >
          <div
            className="squircle-card w-full max-w-md bg-app-surface border border-rose-500/30 p-5 sm:p-6 shadow-2xl space-y-4 animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-rose-500/15 text-rose-500 flex items-center justify-center flex-shrink-0">
                  <Trash2 strokeWidth={2} className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-semibold text-app-text">
                    Permanently Delete Account
                  </h3>
                  <p className="text-xs text-app-text-muted mt-0.5">
                    Irreversible enterprise wipe
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCloseDeleteModal}
                className="apple-press text-app-text-muted hover:text-app-text p-1.5 rounded-lg"
                aria-label="Close dialog"
              >
                <X strokeWidth={1.8} className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 text-xs text-rose-600 dark:text-rose-400 space-y-1 leading-relaxed">
              <p className="font-semibold flex items-center gap-1.5">
                <AlertCircle strokeWidth={1.8} className="w-4 h-4 flex-shrink-0" />
                <span>Warning: All data will be permanently wiped</span>
              </p>
              <p className="pl-5 text-[11px] opacity-90">
                This will immediately purge your account ({user.email}), terminate all active sessions, and erase all stored tasks from the database.
              </p>
            </div>

            {deleteError && (
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                <AlertCircle strokeWidth={1.5} className="w-4 h-4 flex-shrink-0" />
                <span>{deleteError}</span>
              </div>
            )}

            <form onSubmit={handleDeleteAccountSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-app-text-secondary uppercase tracking-wider mb-1">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showDeletePassword ? "text" : "password"}
                    required
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    placeholder="Confirm your password"
                    autoComplete="current-password"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-app-bg border border-app-border text-sm text-app-text placeholder:text-app-text-muted focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowDeletePassword((prev) => !prev)}
                    aria-label={showDeletePassword ? "Hide password" : "Show password"}
                    className="absolute right-3 top-2.5 text-app-text-muted hover:text-app-text p-1 rounded"
                  >
                    {showDeletePassword ? (
                      <EyeOff strokeWidth={1.5} className="w-4 h-4" />
                    ) : (
                      <Eye strokeWidth={1.5} className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-app-text-secondary uppercase tracking-wider mb-1">
                  Type <span className="font-mono text-rose-500 font-bold">DELETE</span> to confirm
                </label>
                <input
                  type="text"
                  required
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="DELETE"
                  autoComplete="off"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-app-bg border border-app-border text-sm text-app-text placeholder:text-app-text-muted focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all font-mono"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={handleCloseDeleteModal}
                  disabled={isDeletingAccount}
                  className="apple-press px-4 py-2 rounded-xl text-xs font-medium text-app-text-secondary hover:text-app-text border border-app-border hover:bg-app-bg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={
                    isDeletingAccount ||
                    !deletePassword ||
                    deleteConfirmText.trim() !== "DELETE"
                  }
                  className="apple-press px-4 py-2 rounded-xl bg-app-danger text-white text-xs font-semibold shadow-xs hover:opacity-90 disabled:opacity-40 transition-opacity flex items-center gap-1.5"
                >
                  <Trash2 strokeWidth={1.5} className="w-3.5 h-3.5" />
                  <span>{isDeletingAccount ? "Deleting..." : "Permanently Delete"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
