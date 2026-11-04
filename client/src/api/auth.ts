import {
  User,
  AuthResponse,
  RegisterPayload,
  LoginPayload,
  SessionsResponse,
} from "../types/auth";
import { ApiResponse, ApiErrorResponse } from "../types/task";

const API_BASE = import.meta.env.VITE_API_URL || "/api";

async function authRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const token = localStorage.getItem("slate_token");

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options?.headers as Record<string, string>),
  };

  const response = await fetch(url, {
    ...options,
    credentials: "include",
    headers,
  });

  const data: ApiResponse<T> | ApiErrorResponse = await response.json();

  if (!response.ok || !data.success) {
    const message =
      !data.success && data.error?.message
        ? data.error.message
        : `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return data.data;
}

export const registerUser = async (payload: RegisterPayload): Promise<AuthResponse> => {
  const data = await authRequest<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (data.token) {
    localStorage.setItem("slate_token", data.token);
  }
  return data;
};

export const loginUser = async (payload: LoginPayload): Promise<AuthResponse> => {
  const data = await authRequest<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (data.token) {
    localStorage.setItem("slate_token", data.token);
  }
  return data;
};

export const logoutUser = async (): Promise<void> => {
  try {
    await authRequest<{ message: string }>("/auth/logout", {
      method: "POST",
    });
  } finally {
    localStorage.removeItem("slate_token");
  }
};

export const fetchCurrentUser = async (): Promise<User | null> => {
  try {
    const data = await authRequest<{ user: User | null }>("/auth/me", {
      method: "GET",
    });
    if (!data?.user) {
      localStorage.removeItem("slate_token");
      return null;
    }
    return data.user;
  } catch {
    localStorage.removeItem("slate_token");
    return null;
  }
};

export const updateUserProfile = async (
  payload: { name?: string; email?: string }
): Promise<User> => {
  const data = await authRequest<{ user: User }>("/auth/profile", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  return data.user;
};

export const changeUserPassword = async (
  payload: { currentPassword: string; newPassword: string }
): Promise<string> => {
  const data = await authRequest<{ message: string }>("/auth/change-password", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return data.message;
};

export const fetchSessions = async (): Promise<SessionsResponse> => {
  return authRequest<SessionsResponse>("/auth/sessions", {
    method: "GET",
  });
};

export const logoutAllDevices = async (): Promise<void> => {
  try {
    await authRequest<{ message: string }>("/auth/logout-all", {
      method: "POST",
    });
  } finally {
    localStorage.removeItem("slate_token");
  }
};

