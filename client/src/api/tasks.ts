import {
  Task,
  TaskFilter,
  TaskPriority,
  CreateTaskPayload,
  UpdateTaskPayload,
  ApiResponse,
  ApiErrorResponse,
} from "../types/task";

const API_BASE = import.meta.env.VITE_API_URL || "/api";

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
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

export const fetchTasks = async (
  filter: TaskFilter = "all",
  search?: string,
  priority?: TaskPriority
): Promise<Task[]> => {
  const params = new URLSearchParams();
  if (filter !== "all") params.append("status", filter);
  if (priority) params.append("priority", priority);
  if (search && search.trim().length > 0) params.append("search", search.trim());

  const queryString = params.toString();
  const endpoint = `/tasks${queryString ? `?${queryString}` : ""}`;
  return request<Task[]>(endpoint, { method: "GET" });
};

export const fetchTaskById = async (id: string): Promise<Task> => {
  return request<Task>(`/tasks/${id}`, { method: "GET" });
};

export const createTask = async (payload: CreateTaskPayload): Promise<Task> => {
  return request<Task>("/tasks", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const updateTask = async (
  id: string,
  payload: UpdateTaskPayload
): Promise<Task> => {
  return request<Task>(`/tasks/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
};

export const toggleTask = async (id: string): Promise<Task> => {
  return request<Task>(`/tasks/${id}/toggle`, {
    method: "PATCH",
  });
};

export const deleteTask = async (id: string): Promise<Task> => {
  return request<Task>(`/tasks/${id}`, {
    method: "DELETE",
  });
};

export const clearCompletedTasks = async (): Promise<number> => {
  const result = await request<{ count: number }>("/tasks/completed", {
    method: "DELETE",
  });
  return result.count;
};
