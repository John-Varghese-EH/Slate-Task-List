import { useState, useEffect, useCallback } from "react";
import {
  User,
  RegisterPayload,
  LoginPayload,
  UpdateProfilePayload,
  ChangePasswordPayload,
  SessionsResponse,
  DeleteAccountPayload,
} from "../types/auth";
import {
  fetchCurrentUser,
  loginUser,
  registerUser,
  logoutUser,
  updateUserProfile,
  changeUserPassword,
  fetchSessions,
  logoutAllDevices,
  deleteUserAccount,
} from "../api/auth";
import {
  isGuestStorageActive,
  setGuestStorageActive,
  clearAllLocalData,
} from "../utils/syncBuffer";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGuest, setIsGuest] = useState<boolean>(() => isGuestStorageActive());

  const checkAuth = useCallback(async () => {
    try {
      const current = await fetchCurrentUser();
      setUser(current);
      if (current) {
        setIsGuest(false);
        setGuestStorageActive(false);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const continueAsGuest = useCallback(() => {
    setGuestStorageActive(true);
    setIsGuest(true);
    setUser(null);
  }, []);

  const exitGuestMode = useCallback(() => {
    setGuestStorageActive(false);
    setIsGuest(false);
  }, []);

  const login = async (payload: LoginPayload): Promise<boolean> => {
    const res = await loginUser(payload);
    setUser(res.user);
    setIsGuest(false);
    setGuestStorageActive(false);
    return true;
  };

  const register = async (payload: RegisterPayload): Promise<boolean> => {
    const res = await registerUser(payload);
    setUser(res.user);
    setIsGuest(false);
    setGuestStorageActive(false);
    return true;
  };

  const logout = async (): Promise<void> => {
    await logoutUser();
    setUser(null);
  };

  const updateProfile = async (payload: UpdateProfilePayload): Promise<User> => {
    const updated = await updateUserProfile(payload);
    setUser(updated);
    return updated;
  };

  const changePassword = async (
    payload: ChangePasswordPayload
  ): Promise<string> => {
    return changeUserPassword(payload);
  };

  const getSessions = async (): Promise<SessionsResponse> => {
    return fetchSessions();
  };

  const logoutAll = async (): Promise<void> => {
    await logoutAllDevices();
    setUser(null);
  };

  const deleteAccount = async (payload: DeleteAccountPayload): Promise<void> => {
    await deleteUserAccount(payload);
    clearAllLocalData();
    setUser(null);
  };

  return {
    user,
    isLoading,
    isAuthenticated: Boolean(user),
    isGuest,
    continueAsGuest,
    exitGuestMode,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    getSessions,
    logoutAll,
    deleteAccount,
    refreshUser: checkAuth,
  };
};
