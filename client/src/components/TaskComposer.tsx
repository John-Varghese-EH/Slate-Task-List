import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import { Plus } from "lucide-react";
import { CreateTaskPayload, TaskPriority } from "../types/task";
import { DatePicker } from "./DatePicker";

export interface TaskComposerHandle {
  focus: () => void;
  dismiss: () => void;
}

interface TaskComposerProps {
  onAdd: (payload: CreateTaskPayload) => Promise<boolean>;
}

export const TaskComposer = forwardRef<TaskComposerHandle, TaskComposerProps>(
  ({ onAdd }, ref) => {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [priority, setPriority] = useState<TaskPriority>("medium");
    const [dueDate, setDueDate] = useState<string | null>(null);
    const [isExpanded, setIsExpanded] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // auto collapse when clicking anywhere outside
    useEffect(() => {
      const handleClickOutside = (e: MouseEvent | TouchEvent) => {
        if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
          setIsExpanded(false);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        document.removeEventListener("touchstart", handleClickOutside);
      };
    }, []);

    useImperativeHandle(ref, () => ({
      focus: () => {
        setIsExpanded(true);
        requestAnimationFrame(() => {
          inputRef.current?.focus();
        });
      },
      dismiss: () => {
        setIsExpanded(false);
        inputRef.current?.blur();
      },
    }));

    const handleSubmit = async (e?: React.FormEvent) => {
      if (e) e.preventDefault();
      const trimmedTitle = title.trim();
      if (!trimmedTitle || isSubmitting) return;

      let parsedDueDate: string | null = null;
      if (dueDate) {
        parsedDueDate = dueDate.includes("T")
          ? dueDate
          : `${dueDate}T12:00:00.000Z`;
      }

      setIsSubmitting(true);
      const success = await onAdd({
        title: trimmedTitle,
        description: description.trim() || undefined,
        priority,
        dueDate: parsedDueDate,
      });
      setIsSubmitting(false);

      if (success) {
        setTitle("");
        setDescription("");
        setPriority("medium");
        setDueDate(null);
        setIsExpanded(false);
        requestAnimationFrame(() => {
          inputRef.current?.focus();
        });
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleSubmit();
      } else if (e.key === "Escape") {
        setIsExpanded(false);
        inputRef.current?.blur();
      }
    };

    return (
      <div
        ref={containerRef}
        className="squircle-card mb-6 bg-app-surface p-4 transition-all duration-200 focus-within:ring-2 focus-within:ring-app-accent/30 focus-within:border-app-accent/60 shadow-xs hover:shadow-sm relative z-20"
      >
        <form onSubmit={handleSubmit}>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsExpanded((prev) => !prev)}
              aria-label="Expand task details"
              className="apple-press flex items-center justify-center w-9 h-9 sm:w-8 sm:h-8 rounded-xl bg-app-surface-secondary border border-app-border text-app-accent hover:bg-app-accent hover:text-white transition-all flex-shrink-0 shadow-2xs"
            >
              <Plus
                strokeWidth={2}
                className={`w-4 h-4 transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                  isExpanded ? "rotate-45" : ""
                }`}
              />
            </button>

            <input
              ref={inputRef}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onFocus={() => setIsExpanded(true)}
              onClick={() => setIsExpanded(true)}
              onKeyDown={handleKeyDown}
              placeholder="Add a new task..."
              autoComplete="off"
              className="w-full bg-transparent text-base sm:text-sm text-app-text placeholder:text-app-text-muted font-medium focus:outline-none"
            />

            {title.trim().length > 0 && !isExpanded && (
              <button
                type="submit"
                disabled={isSubmitting}
                className="apple-press text-xs font-semibold bg-app-accent text-white px-3.5 py-1.5 rounded-xl hover:opacity-90 shadow-xs transition-all flex-shrink-0 min-h-[36px] sm:min-h-[32px] flex items-center"
              >
                Add
              </button>
            )}
          </div>

          <div
            className={`grid transition-[grid-template-rows,opacity,margin,padding] duration-250 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              isExpanded
                ? "grid-rows-[1fr] opacity-100 mt-3.5 pt-3.5 border-t border-app-border"
                : "grid-rows-[0fr] opacity-0 mt-0 pt-0 border-t-0 pointer-events-none"
            }`}
          >
            <div className={`${isExpanded ? "overflow-visible" : "overflow-hidden"} space-y-3`}>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Notes or description (optional)"
                rows={2}
                className="w-full bg-transparent text-sm sm:text-xs text-app-text placeholder:text-app-text-muted resize-none focus:outline-none"
              />

              <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1 text-xs">
                <div className="flex flex-wrap items-center gap-2">
                  {/* Priority Selector with 6px dots */}
                  <div className="flex items-center gap-1 bg-app-surface-secondary p-1 rounded-xl border border-app-border">
                    <span className="text-[11px] font-semibold text-app-text-secondary px-1.5">
                      Priority:
                    </span>
                    {(["low", "medium", "high"] as const).map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPriority(p)}
                        className={`apple-press inline-flex items-center gap-1.5 px-2.5 py-1 sm:py-0.5 rounded-lg text-xs sm:text-[11px] font-medium capitalize transition-all ${
                          priority === p
                            ? "bg-app-surface text-app-text font-semibold shadow-xs border border-app-border"
                            : "text-app-text-muted hover:text-app-text"
                        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${
                            p === "low"
                              ? "bg-emerald-500 shadow-xs"
                              : p === "medium"
                              ? "bg-amber-500 shadow-xs"
                              : "bg-rose-500 shadow-xs"
                          }`}
                        />
                        <span>{p}</span>
                      </button>
                    ))}
                  </div>

                  <DatePicker
                    value={dueDate}
                    onChange={setDueDate}
                    placeholder="Due date"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsExpanded(false)}
                    className="apple-press px-3 py-1.5 sm:py-1 text-xs text-app-text-secondary hover:text-app-text transition-colors min-h-[36px] sm:min-h-0 flex items-center font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!title.trim() || isSubmitting}
                    className="apple-press px-4 py-1.5 sm:py-1 rounded-xl bg-app-accent text-white text-xs font-semibold hover:opacity-90 disabled:opacity-40 transition-opacity shadow-xs min-h-[36px] sm:min-h-0 flex items-center"
                  >
                    Add Task
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    );
  }
);

TaskComposer.displayName = "TaskComposer";
