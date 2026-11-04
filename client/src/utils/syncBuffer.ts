import { Task, CreateTaskPayload, UpdateTaskPayload } from "../types/task";
import * as api from "../api/tasks";

export type MutationType =
  | "create"
  | "update"
  | "toggle"
  | "delete"
  | "clear_completed";

export interface QueuedMutation {
  id: string;
  type: MutationType;
  taskId: string;
  payload?: CreateTaskPayload | UpdateTaskPayload;
  timestamp: number;
}

const BUFFER_KEY = "slate_mutation_buffer_v1";
const CACHE_KEY = "slate_cached_tasks";
const GUEST_TASKS_KEY = "slate_guest_tasks_v1";
const GUEST_FLAG_KEY = "slate_is_guest";

export const isGuestStorageActive = (): boolean => {
  try {
    return localStorage.getItem(GUEST_FLAG_KEY) === "true";
  } catch {
    return false;
  }
};

export const setGuestStorageActive = (active: boolean): void => {
  try {
    if (active) {
      localStorage.setItem(GUEST_FLAG_KEY, "true");
    } else {
      localStorage.removeItem(GUEST_FLAG_KEY);
    }
  } catch {
    // storage disabled
  }
};

export const getGuestTasks = (): Task[] => {
  try {
    const raw = localStorage.getItem(GUEST_TASKS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const setGuestTasks = (tasks: Task[]): void => {
  try {
    localStorage.setItem(GUEST_TASKS_KEY, JSON.stringify(tasks));
  } catch {
    // quota exceeded or storage disabled
  }
};

export const clearGuestTasks = (): void => {
  try {
    localStorage.removeItem(GUEST_TASKS_KEY);
  } catch {
    // ignore
  }
};

export const getCachedTasks = (): Task[] => {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const setCachedTasks = (tasks: Task[]): void => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(tasks));
  } catch {
    // quota exceeded or storage disabled
  }
};

export const getPendingMutations = (): QueuedMutation[] => {
  try {
    const raw = localStorage.getItem(BUFFER_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const savePendingMutations = (mutations: QueuedMutation[]): void => {
  try {
    localStorage.setItem(BUFFER_KEY, JSON.stringify(mutations));
  } catch {
    // quota exceeded or storage disabled
  }
};

export const enqueueMutation = (
  mutation: Omit<QueuedMutation, "id" | "timestamp">
): QueuedMutation => {
  const current = getPendingMutations();
  const entry: QueuedMutation = {
    ...mutation,
    id: "mut-" + Math.random().toString(36).substring(2, 9),
    timestamp: Date.now(),
  };
  current.push(entry);
  savePendingMutations(current);
  return entry;
};

export const removeMutation = (id: string): void => {
  const current = getPendingMutations();
  const next = current.filter((m) => m.id !== id);
  savePendingMutations(next);
};

export const clearMutationBuffer = (): void => {
  try {
    localStorage.removeItem(BUFFER_KEY);
  } catch {
    // ignore
  }
};

export const getPendingCount = (): number => {
  return getPendingMutations().length;
};

// Replays queued mutations in sequential order against the database API
export const replayMutationBuffer = async (
  onTaskReplaced?: (tempId: string, realTask: Task) => void
): Promise<{ success: boolean; syncedCount: number }> => {
  const mutations = getPendingMutations();
  if (mutations.length === 0) {
    return { success: true, syncedCount: 0 };
  }

  const idMap = new Map<string, string>();
  let syncedCount = 0;

  for (const mut of mutations) {
    const resolvedId = idMap.get(mut.taskId) || mut.taskId;

    try {
      if (mut.type === "create" && mut.payload) {
        const created = await api.createTask(mut.payload as CreateTaskPayload);
        idMap.set(mut.taskId, created.id);
        if (onTaskReplaced) {
          onTaskReplaced(mut.taskId, created);
        }
      } else if (mut.type === "update" && mut.payload) {
        await api.updateTask(resolvedId, mut.payload as UpdateTaskPayload);
      } else if (mut.type === "toggle") {
        await api.toggleTask(resolvedId);
      } else if (mut.type === "delete") {
        await api.deleteTask(resolvedId);
      } else if (mut.type === "clear_completed") {
        await api.clearCompletedTasks();
      }

      // Successfully processed this operation
      removeMutation(mut.id);
      syncedCount++;
    } catch {
      // Server is still unreachable or error encountered, pause replay
      return { success: false, syncedCount };
    }
  }

  return { success: true, syncedCount };
};

// transfer local guest tasks to cloud upon auth
export const migrateGuestTasksToCloud = async (): Promise<number> => {
  const guestTasks = getGuestTasks();
  if (guestTasks.length === 0) return 0;

  let count = 0;
  for (const task of guestTasks) {
    try {
      await api.createTask({
        title: task.title,
        description: task.description,
        priority: task.priority,
        dueDate: task.dueDate ?? undefined,
      });
      count += 1;
    } catch {
      // skip on failure
    }
  }

  clearGuestTasks();
  setGuestStorageActive(false);
  return count;
};

