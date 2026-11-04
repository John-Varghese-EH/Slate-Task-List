import React from "react";
import { Search, X } from "lucide-react";
import { TaskFilter, TaskPriority } from "../types/task";

interface FilterBarProps {
  filter: TaskFilter;
  onFilterChange: (filter: TaskFilter) => void;
  search: string;
  onSearchChange: (search: string) => void;
  priorityFilter?: TaskPriority;
  onPriorityChange: (priority?: TaskPriority) => void;
  completedCount: number;
  onClearCompleted: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filter,
  onFilterChange,
  search,
  onSearchChange,
  priorityFilter,
  onPriorityChange,
  completedCount,
  onClearCompleted,
}) => {
  return (
    <div className="space-y-3 pt-2 pb-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3">
        {/* Segmented filter control */}
        <div
          role="tablist"
          aria-label="Filter tasks by status"
          className="grid grid-cols-3 sm:inline-flex items-center p-1 rounded-2xl bg-app-surface border border-app-border text-xs font-medium shadow-xs w-full sm:w-auto"
        >
          {(["all", "active", "completed"] as const).map((tab) => (
            <button
              key={tab}
              role="tab"
              aria-selected={filter === tab}
              onClick={() => onFilterChange(tab)}
              className={`apple-press text-center px-3 sm:px-4 py-2 sm:py-1.5 rounded-xl transition-all capitalize min-h-[38px] sm:min-h-[30px] text-xs font-medium ${
                filter === tab
                  ? "bg-app-accent text-white font-semibold shadow-xs"
                  : "text-app-text-secondary hover:text-app-text hover:bg-app-surface-secondary/60"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Clear Completed action button */}
        {completedCount > 0 && filter !== "active" && (
          <button
            type="button"
            onClick={onClearCompleted}
            className="apple-press text-xs font-semibold text-app-text-muted hover:text-app-danger transition-colors text-right py-1 px-2.5 focus:outline-none min-h-[32px] sm:min-h-[36px] flex items-center justify-end rounded-lg hover:bg-rose-500/10 self-end sm:self-auto"
          >
            Clear {completedCount} completed
          </button>
        )}
      </div>

      <div className="flex items-center gap-2.5">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search
            strokeWidth={1.8}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-app-text-muted pointer-events-none"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search tasks..."
            autoComplete="off"
            className="w-full pl-9 pr-9 py-2 text-base sm:text-xs rounded-xl bg-app-surface border border-app-border text-app-text placeholder:text-app-text-muted focus:outline-none focus:ring-2 focus:ring-app-accent/30 focus:border-app-accent/70 transition-all shadow-xs min-h-[40px] sm:min-h-0 font-medium"
          />
          {search && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              aria-label="Clear search"
              className="apple-press absolute right-2.5 top-1/2 -translate-y-1/2 text-app-text-muted hover:text-app-text p-1 min-w-[32px] min-h-[32px] flex items-center justify-center rounded-lg hover:bg-app-surface-secondary"
            >
              <X strokeWidth={1.8} className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Priority Filter */}
        <select
          value={priorityFilter || ""}
          onChange={(e) =>
            onPriorityChange(
              e.target.value ? (e.target.value as TaskPriority) : undefined
            )
          }
          aria-label="Filter by priority"
          className="text-xs py-2 px-3.5 rounded-xl bg-app-surface border border-app-border text-app-text-secondary font-medium focus:outline-none focus:ring-2 focus:ring-app-accent/30 focus:border-app-accent/70 shadow-xs transition-all min-h-[40px] sm:min-h-0"
        >
          <option value="">All Priorities</option>
          <option value="low">Low Priority</option>
          <option value="medium">Medium Priority</option>
          <option value="high">High Priority</option>
        </select>
      </div>
    </div>
  );
};
