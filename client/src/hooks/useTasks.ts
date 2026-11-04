import { useState, useEffect, useCallback, useRef } from "react";
import {
  Task,
  TaskFilter,
  TaskPriority,
  CreateTaskPayload,
  UpdateTaskPayload,
} from "../types/task";
import * as api from "../api/tasks";
import {
  getCachedTasks,
  setCachedTasks,
  getGuestTasks,
  setGuestTasks,
  enqueueMutation,
  replayMutationBuffer,
  getPendingCount,
} from "../utils/syncBuffer";

export interface ToastMessage {
  id: string;
  message: string;
  type: "info" | "error" | "success";
  actionLabel?: string;
  onAction?: () => void;
}

export const useTasks = (
  isGuest: boolean = false,
  isAuthenticated: boolean = false,
  onSwitchToGuest?: () => void
) => {
  const [tasks, setTasks] = useState<Task[]>(() => {
    if (isGuest) {
      return getGuestTasks();
    }
    if (!isAuthenticated) {
      return [];
    }
    return getCachedTasks();
  });
  const [isLoading, setIsLoading] = useState(() => (isAuthenticated || isGuest) && tasks.length === 0);
  const [filter, setFilter] = useState<TaskFilter>("all");
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | undefined>(
    undefined
  );
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [pendingSyncCount, setPendingSyncCount] = useState<number>(() =>
    isGuest ? 0 : getPendingCount()
  );
  const [isSyncing, setIsSyncing] = useState(false);

  const tasksRef = useRef<Task[]>(tasks);
  tasksRef.current = tasks;

  const showToast = useCallback(
    (
      message: string,
      type: "info" | "error" | "success" = "info",
      actionLabel?: string,
      onAction?: () => void
    ) => {
      const id = Math.random().toString(36).substring(2, 9);
      setToast({ id, message, type, actionLabel, onAction });
    },
    []
  );

  const dismissToast = useCallback(() => {
    setToast(null);
  }, []);

  const syncPending = useCallback(async () => {
    if (isGuest || !isAuthenticated || getPendingCount() === 0 || isSyncing) return;
    setIsSyncing(true);

    try {
      const result = await replayMutationBuffer((tempId, realTask) => {
        setTasks((prev) => {
          const next = prev.map((t) => (t.id === tempId ? realTask : t));
          setCachedTasks(next);
          return next;
        });
      });

      const remaining = getPendingCount();
      setPendingSyncCount(remaining);

      if (result.syncedCount > 0) {
        if (remaining === 0) {
          showToast("All changes synced with database", "success");
        }
        try {
          const fresh = await api.fetchTasks(filter, search, priorityFilter);
          setTasks(fresh);
          setCachedTasks(fresh);
        } catch {
          // quiet reload ignore
        }
      }
    } finally {
      setIsSyncing(false);
    }
  }, [isGuest, isAuthenticated, filter, search, priorityFilter, isSyncing, showToast]);

  const loadTasks = useCallback(async () => {
    if (isGuest) {
      const stored = getGuestTasks();
      setTasks(stored);
      setIsLoading(false);
      setIsOffline(false);
      return;
    }

    if (!isAuthenticated) {
      setTasks([]);
      setIsLoading(false);
      return;
    }

    if (getPendingCount() > 0) {
      await syncPending();
    }

    try {
      const data = await api.fetchTasks(filter, search, priorityFilter);
      setTasks(data);
      setCachedTasks(data);
      setIsOffline(false);
    } catch {
      const cached = getCachedTasks();
      if (cached.length > 0) {
        setTasks(cached);
      }
      if (onSwitchToGuest) {
        showToast(
          "Database connection offline. You can switch to Guest Mode.",
          "info",
          "Guest Mode",
          onSwitchToGuest
        );
      }
    } finally {
      setIsLoading(false);
    }
  }, [
    isGuest,
    isAuthenticated,
    filter,
    search,
    priorityFilter,
    syncPending,
    onSwitchToGuest,
    showToast,
  ]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks, isGuest, isAuthenticated]);

  useEffect(() => {
    if (isGuest || !isAuthenticated) return;

    const handleOnline = () => {
      setIsOffline(false);
      syncPending();
    };

    const handleOffline = () => {
      setIsOffline(true);
    };

    const handleFocus = () => {
      if (getPendingCount() > 0) {
        syncPending();
      }
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("focus", handleFocus);

    const interval = setInterval(() => {
      if (getPendingCount() > 0 && navigator.onLine) {
        syncPending();
      }
    }, 12000);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("focus", handleFocus);
      clearInterval(interval);
    };
  }, [isGuest, syncPending]);

  const addTask = async (payload: CreateTaskPayload): Promise<boolean> => {
    const tempId = (isGuest ? "guest-" : "temp-") + Date.now();
    const newTask: Task = {
      id: tempId,
      title: payload.title.trim(),
      description: payload.description?.trim() || "",
      completed: false,
      priority: payload.priority || "medium",
      dueDate: payload.dueDate || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (isGuest) {
      const nextTasks = [newTask, ...tasksRef.current];
      setTasks(nextTasks);
      setGuestTasks(nextTasks);
      return true;
    }

    const nextTasks = [newTask, ...tasksRef.current];
    setTasks(nextTasks);
    setCachedTasks(nextTasks);

    try {
      const created = await api.createTask(payload);
      setTasks((prev) => {
        const updated = prev.map((t) => (t.id === tempId ? created : t));
        setCachedTasks(updated);
        return updated;
      });
      return true;
    } catch {
      enqueueMutation({
        type: "create",
        taskId: tempId,
        payload,
      });
      setPendingSyncCount(getPendingCount());
      showToast(
        "Saved locally. Changes will sync when database is online.",
        "info",
        onSwitchToGuest ? "Guest Mode" : undefined,
        onSwitchToGuest
      );
      return true;
    }
  };

  const toggleTask = async (id: string) => {
    const previous = [...tasksRef.current];
    const target = previous.find((t) => t.id === id);
    if (!target) return;

    const updatedTasks = previous.map((t) =>
      t.id === id
        ? {
            ...t,
            completed: !t.completed,
            updatedAt: new Date().toISOString(),
          }
        : t
    );
    setTasks(updatedTasks);

    if (isGuest) {
      setGuestTasks(updatedTasks);
      return;
    }

    setCachedTasks(updatedTasks);
    try {
      const updated = await api.toggleTask(id);
      setTasks((prev) => {
        const next = prev.map((t) => (t.id === id ? updated : t));
        setCachedTasks(next);
        return next;
      });
    } catch {
      enqueueMutation({
        type: "toggle",
        taskId: id,
      });
      setPendingSyncCount(getPendingCount());
    }
  };

  const editTask = async (
    id: string,
    payload: UpdateTaskPayload
  ): Promise<boolean> => {
    const previous = [...tasksRef.current];
    const target = previous.find((t) => t.id === id);
    if (!target) return false;

    const updatedTasks = previous.map((t) =>
      t.id === id
        ? {
            ...t,
            ...payload,
            updatedAt: new Date().toISOString(),
          }
        : t
    );
    setTasks(updatedTasks);

    if (isGuest) {
      setGuestTasks(updatedTasks);
      return true;
    }

    setCachedTasks(updatedTasks);
    try {
      const updated = await api.updateTask(id, payload);
      setTasks((prev) => {
        const next = prev.map((t) => (t.id === id ? updated : t));
        setCachedTasks(next);
        return next;
      });
      return true;
    } catch {
      enqueueMutation({
        type: "update",
        taskId: id,
        payload,
      });
      setPendingSyncCount(getPendingCount());
      showToast(
        "Changes saved locally. Syncing when database reconnects.",
        "info"
      );
      return true;
    }
  };

  const removeTask = async (id: string) => {
    const previous = [...tasksRef.current];
    const taskToDelete = previous.find((t) => t.id === id);
    if (!taskToDelete) return;

    const nextTasks = previous.filter((t) => t.id !== id);
    setTasks(nextTasks);

    if (isGuest) {
      setGuestTasks(nextTasks);
      showToast("Task deleted", "info", "Undo", () => {
        dismissToast();
        setTasks(previous);
        setGuestTasks(previous);
      });
      return;
    }

    setCachedTasks(nextTasks);
    let isUndone = false;

    const undoHandler = async () => {
      isUndone = true;
      dismissToast();
      setTasks(previous);
      setCachedTasks(previous);
      try {
        await api.createTask({
          title: taskToDelete.title,
          description: taskToDelete.description,
          priority: taskToDelete.priority,
          dueDate: taskToDelete.dueDate,
        });
        loadTasks();
      } catch {
        enqueueMutation({
          type: "create",
          taskId: "temp-" + Date.now(),
          payload: {
            title: taskToDelete.title,
            description: taskToDelete.description,
            priority: taskToDelete.priority,
            dueDate: taskToDelete.dueDate,
          },
        });
        setPendingSyncCount(getPendingCount());
      }
    };

    showToast("Task deleted", "info", "Undo", undoHandler);

    try {
      await api.deleteTask(id);
    } catch {
      if (!isUndone) {
        enqueueMutation({
          type: "delete",
          taskId: id,
        });
        setPendingSyncCount(getPendingCount());
      }
    }
  };

  const clearCompleted = async () => {
    const previous = [...tasksRef.current];
    const completedTasks = previous.filter((t) => t.completed);
    if (completedTasks.length === 0) return;

    const remaining = previous.filter((t) => !t.completed);
    setTasks(remaining);

    if (isGuest) {
      setGuestTasks(remaining);
      showToast(
        `Cleared ${completedTasks.length} completed ${
          completedTasks.length === 1 ? "task" : "tasks"
        }`,
        "success"
      );
      return;
    }

    setCachedTasks(remaining);
    try {
      const count = await api.clearCompletedTasks();
      showToast(
        `Cleared ${count} completed ${count === 1 ? "task" : "tasks"}`,
        "success"
      );
    } catch {
      enqueueMutation({
        type: "clear_completed",
        taskId: "all",
      });
      setPendingSyncCount(getPendingCount());
      showToast("Cleared locally. Syncing with database.", "info");
    }
  };

  const activeCount = tasks.filter((t) => !t.completed).length;
  const completedCount = tasks.filter((t) => t.completed).length;

  return {
    tasks,
    isLoading,
    filter,
    setFilter,
    search,
    setSearch,
    priorityFilter,
    setPriorityFilter,
    activeCount,
    completedCount,
    toast,
    dismissToast,
    isOffline: isGuest ? false : isOffline,
    pendingSyncCount: isGuest ? 0 : pendingSyncCount,
    isSyncing,
    addTask,
    toggleTask,
    editTask,
    removeTask,
    clearCompleted,
    refresh: loadTasks,
    syncNow: syncPending,
  };
};
