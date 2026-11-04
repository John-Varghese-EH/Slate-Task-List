import React from "react";
import { CheckCircle2, ListTodo } from "lucide-react";
import { TaskFilter } from "../types/task";

interface EmptyStateProps {
  filter: TaskFilter;
  search: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ filter, search }) => {
  if (search) {
    return (
      <div className="py-20 text-center">
        <p className="text-sm font-semibold text-app-text tracking-tight">No tasks match your search</p>
        <p className="text-xs text-app-text-muted mt-1.5">
          Try a different keyword or clear the search query.
        </p>
      </div>
    );
  }

  if (filter === "completed") {
    return (
      <div className="py-20 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-app-surface border border-app-border mb-4 text-app-text-muted shadow-2xs">
          <CheckCircle2 strokeWidth={1.8} className="w-6 h-6 text-app-text-muted" />
        </div>
        <p className="text-sm font-semibold text-app-text tracking-tight">No completed tasks</p>
        <p className="text-xs text-app-text-muted mt-1.5">
          Tasks marked complete will appear here.
        </p>
      </div>
    );
  }

  if (filter === "active") {
    return (
      <div className="py-20 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 mb-4 text-emerald-500 shadow-2xs">
          <CheckCircle2 strokeWidth={2} className="w-6 h-6 text-emerald-500" />
        </div>
        <p className="text-sm font-semibold text-app-text tracking-tight">All active tasks completed</p>
        <p className="text-xs text-app-text-muted mt-1.5">
          Press C or use the composer above to create a task.
        </p>
      </div>
    );
  }

  return (
    <div className="py-20 text-center">
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-app-accent/10 border border-app-accent/20 mb-4 text-app-accent shadow-2xs">
        <ListTodo strokeWidth={1.8} className="w-6 h-6 text-app-accent" />
      </div>
      <p className="text-base font-bold text-app-text tracking-tight">No tasks yet</p>
      <p className="text-xs text-app-text-muted mt-1.5 max-w-xs mx-auto">
        Type in the composer above and press Enter to capture your first task.
      </p>
    </div>
  );
};
