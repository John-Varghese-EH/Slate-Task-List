import React, { useState, useRef, useEffect } from "react";
import { Check, Trash2, Edit2, Calendar } from "lucide-react";
import { Task, TaskPriority, UpdateTaskPayload } from "../types/task";
import { DatePicker } from "./DatePicker";
import { playTactileFeedback } from "../utils/haptics";

interface TaskRowProps {
  task: Task;
  isSelected: boolean;
  isEditing: boolean;
  onSelect: () => void;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onToggle: (id: string) => void;
  onEdit: (id: string, payload: UpdateTaskPayload) => Promise<boolean>;
  onDelete: (id: string) => void;
}

const priorityColors: Record<TaskPriority, string> = {
  low: "bg-emerald-500",
  medium: "bg-amber-500",
  high: "bg-rose-500",
};

export const TaskRow: React.FC<TaskRowProps> = ({
  task,
  isSelected,
  isEditing,
  onSelect,
  onStartEdit,
  onCancelEdit,
  onToggle,
  onEdit,
  onDelete,
}) => {
  const [titleDraft, setTitleDraft] = useState(task.title);
  const [descriptionDraft, setDescriptionDraft] = useState(task.description);
  const [priorityDraft, setPriorityDraft] = useState<TaskPriority>(task.priority);
  const [dueDateDraft, setDueDateDraft] = useState<string | null>(
    task.dueDate ? task.dueDate.split("T")[0] : null
  );
  const [isSaving, setIsSaving] = useState(false);

  const editInputRef = useRef<HTMLInputElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTitleDraft(task.title);
    setDescriptionDraft(task.description);
    setPriorityDraft(task.priority);
    setDueDateDraft(task.dueDate ? task.dueDate.split("T")[0] : null);
  }, [task]);

  useEffect(() => {
    if (isEditing) {
      const frame = requestAnimationFrame(() => {
        editInputRef.current?.focus();
        editInputRef.current?.select();
      });
      return () => cancelAnimationFrame(frame);
    }
  }, [isEditing]);

  useEffect(() => {
    if (isSelected && !isEditing) {
      const frame = requestAnimationFrame(() => {
        rowRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
      });
      return () => cancelAnimationFrame(frame);
    }
  }, [isSelected, isEditing]);

  const handleSave = async () => {
    const trimmedTitle = titleDraft.trim();
    if (!trimmedTitle) {
      setTitleDraft(task.title);
      setDueDateDraft(task.dueDate ? task.dueDate.split("T")[0] : null);
      onCancelEdit();
      return;
    }

    const initialDueDate = task.dueDate ? task.dueDate.split("T")[0] : null;
    if (
      trimmedTitle === task.title &&
      descriptionDraft.trim() === task.description &&
      priorityDraft === task.priority &&
      dueDateDraft === initialDueDate
    ) {
      onCancelEdit();
      return;
    }

    let parsedDueDate: string | null = null;
    if (dueDateDraft) {
      parsedDueDate = dueDateDraft.includes("T")
        ? dueDateDraft
        : `${dueDateDraft}T12:00:00.000Z`;
    }

    setIsSaving(true);
    const success = await onEdit(task.id, {
      title: trimmedTitle,
      description: descriptionDraft.trim(),
      priority: priorityDraft,
      dueDate: parsedDueDate,
    });
    setIsSaving(false);

    if (success) {
      onCancelEdit();
    }
  };

  const handleCancel = () => {
    setTitleDraft(task.title);
    setDescriptionDraft(task.description);
    setPriorityDraft(task.priority);
    setDueDateDraft(task.dueDate ? task.dueDate.split("T")[0] : null);
    onCancelEdit();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      e.preventDefault();
      handleCancel();
    }
  };

  const isOverdue =
    Boolean(task.dueDate) &&
    !task.completed &&
    new Date(task.dueDate!).getTime() < Date.now();

  const formattedDueDate = task.dueDate
    ? new Date(task.dueDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    : null;

  return (
    <div
      ref={rowRef}
      tabIndex={0}
      onClick={onSelect}
      className={`squircle-card group relative flex items-start justify-between gap-3 p-3.5 bg-app-surface transition-all duration-200 cursor-pointer focus:outline-none ${
        isSelected
          ? "ring-2 ring-app-accent/50 shadow-xs"
          : "hover:border-app-accent/40 hover:shadow-xs"
      } ${task.completed ? "opacity-60 bg-app-surface/50" : ""}`}
    >
      <div className="flex items-start gap-3 flex-1 min-w-0">
        {/* Tactile custom checkbox */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            playTactileFeedback();
            onToggle(task.id);
          }}
          aria-label={task.completed ? "Mark incomplete" : "Mark complete"}
          data-checked={task.completed}
          className="tactile-checkbox mt-0.5"
        >
          {task.completed && (
            <Check
              strokeWidth={3}
              className="w-3 h-3 text-white"
            />
          )}
        </button>

        {/* Content / Inline Editor */}
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div
              className="space-y-2.5"
              onClick={(e) => e.stopPropagation()}
            >
              <input
                ref={editInputRef}
                type="text"
                value={titleDraft}
                onChange={(e) => setTitleDraft(e.target.value)}
                onKeyDown={handleKeyDown}
                autoComplete="off"
                className="w-full text-base sm:text-sm font-medium bg-app-bg px-2.5 py-1.5 rounded-lg border border-app-border text-app-text focus:outline-none focus:ring-1 focus:ring-app-accent"
              />
              <textarea
                value={descriptionDraft}
                onChange={(e) => setDescriptionDraft(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Notes or description"
                rows={2}
                className="w-full text-sm sm:text-xs bg-app-bg px-2.5 py-1.5 rounded-lg border border-app-border text-app-text placeholder:text-app-text-muted resize-none focus:outline-none focus:ring-1 focus:ring-app-accent"
              />
              <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1.5 bg-app-bg p-0.5 rounded-lg border border-app-border">
                    {(["low", "medium", "high"] as const).map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPriorityDraft(p)}
                        className={`apple-press inline-flex items-center gap-1 px-2.5 py-1 sm:py-0.5 rounded text-xs sm:text-[11px] capitalize ${
                          priorityDraft === p
                            ? "bg-app-surface text-app-text font-medium shadow-2xs"
                            : "text-app-text-muted"
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${priorityColors[p]}`} />
                        <span>{p}</span>
                      </button>
                    ))}
                  </div>

                  <DatePicker
                    value={dueDateDraft}
                    onChange={setDueDateDraft}
                    placeholder="Due date"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="apple-press text-xs text-app-text-secondary hover:text-app-text px-3 py-1.5 sm:py-1 rounded-md min-h-[36px] sm:min-h-0 flex items-center"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={isSaving || !titleDraft.trim()}
                    className="apple-press text-xs bg-app-accent text-white px-3.5 py-1.5 sm:py-1 rounded-lg font-medium shadow-xs disabled:opacity-50 min-h-[36px] sm:min-h-0 flex items-center"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div
              onDoubleClick={(e) => {
                e.stopPropagation();
                onStartEdit();
              }}
              className="select-none"
            >
              <div className="flex items-center gap-2.5">
                <span
                  className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    task.priority === "low"
                      ? "bg-emerald-500 shadow-xs"
                      : task.priority === "medium"
                      ? "bg-amber-500 shadow-xs"
                      : "bg-rose-500 shadow-xs"
                  }`}
                  title={`Priority: ${task.priority}`}
                />
                <h3
                  className={`text-[14px] sm:text-[15px] font-medium text-app-text break-words transition-all duration-200 tracking-tight ${
                    task.completed
                      ? "line-through text-app-text-muted"
                      : "text-app-text"
                  }`}
                >
                  {task.title}
                </h3>
              </div>

              {task.description && (
                <p className="mt-1.5 text-xs sm:text-[13px] text-app-text-secondary line-clamp-2 pl-4 leading-relaxed">
                  {task.description}
                </p>
              )}

              {formattedDueDate && (
                <div className="mt-2.5 flex items-center gap-1.5 pl-4">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg border text-[11px] font-medium tabular-nums shadow-2xs ${
                      isOverdue
                        ? "bg-rose-500/10 border-rose-500/25 text-rose-600 dark:text-rose-400"
                        : "bg-app-surface-secondary border-app-border text-app-text-secondary"
                    }`}
                  >
                    <Calendar strokeWidth={1.8} className="w-3 h-3 flex-shrink-0" />
                    <span>{isOverdue ? `Overdue: ${formattedDueDate}` : formattedDueDate}</span>
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* action buttons on hover or touch */}
      {!isEditing && (
        <div className="flex items-center gap-1.5 flex-shrink-0 opacity-100 sm:opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onStartEdit();
            }}
            aria-label="Edit task"
            className="apple-press flex items-center justify-center w-8 h-8 sm:w-7 sm:h-7 rounded-lg text-app-text-muted hover:text-app-text hover:bg-app-surface-secondary border border-transparent hover:border-app-border transition-all shadow-2xs"
          >
            <Edit2 strokeWidth={1.6} className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(task.id);
            }}
            aria-label="Delete task"
            className="apple-press flex items-center justify-center w-8 h-8 sm:w-7 sm:h-7 rounded-lg text-app-text-muted hover:text-app-danger hover:bg-rose-500/10 border border-transparent hover:border-rose-300/40 dark:hover:border-rose-900/40 transition-all shadow-2xs"
          >
            <Trash2 strokeWidth={1.6} className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
