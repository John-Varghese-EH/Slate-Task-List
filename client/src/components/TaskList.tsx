import React from "react";
import { Task, TaskFilter, UpdateTaskPayload } from "../types/task";
import { TaskRow } from "./TaskRow";
import { TaskSkeleton } from "./TaskSkeleton";
import { EmptyState } from "./EmptyState";

interface TaskListProps {
  tasks: Task[];
  isLoading: boolean;
  filter: TaskFilter;
  search: string;
  selectedTaskId: string | null;
  editingTaskId: string | null;
  onSelectTask: (id: string) => void;
  onStartEdit: (id: string) => void;
  onCancelEdit: () => void;
  onToggle: (id: string) => void;
  onEdit: (id: string, payload: UpdateTaskPayload) => Promise<boolean>;
  onDelete: (id: string) => void;
}

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  isLoading,
  filter,
  search,
  selectedTaskId,
  editingTaskId,
  onSelectTask,
  onStartEdit,
  onCancelEdit,
  onToggle,
  onEdit,
  onDelete,
}) => {
  if (isLoading) {
    return <TaskSkeleton />;
  }

  if (tasks.length === 0) {
    return <EmptyState filter={filter} search={search} />;
  }

  return (
    <div className="space-y-2.5">
      {tasks.map((task) => (
        <TaskRow
          key={task.id}
          task={task}
          isSelected={selectedTaskId === task.id}
          isEditing={editingTaskId === task.id}
          onSelect={() => onSelectTask(task.id)}
          onStartEdit={() => onStartEdit(task.id)}
          onCancelEdit={onCancelEdit}
          onToggle={onToggle}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};
