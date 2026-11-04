import React from "react";
import { Calendar, CalendarClock, Inbox, CheckCircle2 } from "lucide-react";
import { Task } from "../types/task";
import { playTactileFeedback } from "../utils/haptics";

export type SmartCategory = "all" | "today" | "scheduled" | "completed";

interface SmartCategoryGridProps {
  tasks: Task[];
  activeCategory: SmartCategory;
  onSelectCategory: (category: SmartCategory) => void;
}

const getTodayIso = (): string => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const SmartCategoryGrid: React.FC<SmartCategoryGridProps> = ({
  tasks,
  activeCategory,
  onSelectCategory,
}) => {
  const todayIso = getTodayIso();

  const todayCount = tasks.filter((t) => {
    if (t.completed || !t.dueDate) return false;
    return t.dueDate.startsWith(todayIso);
  }).length;

  const scheduledCount = tasks.filter((t) => !t.completed && Boolean(t.dueDate)).length;
  const allCount = tasks.filter((t) => !t.completed).length;
  const completedCount = tasks.filter((t) => t.completed).length;

  const categories: Array<{
    id: SmartCategory;
    label: string;
    count: number;
    icon: React.ReactNode;
    badgeClass: string;
  }> = [
    {
      id: "today",
      label: "Today",
      count: todayCount,
      icon: <Calendar strokeWidth={2.2} className="w-4 h-4 text-white" />,
      badgeClass: "bg-blue-500 text-white shadow-2xs",
    },
    {
      id: "scheduled",
      label: "Scheduled",
      count: scheduledCount,
      icon: <CalendarClock strokeWidth={2.2} className="w-4 h-4 text-white" />,
      badgeClass: "bg-red-500 text-white shadow-2xs",
    },
    {
      id: "all",
      label: "All",
      count: allCount,
      icon: <Inbox strokeWidth={2.2} className="w-4 h-4 text-white" />,
      badgeClass: "bg-slate-700 dark:bg-slate-600 text-white shadow-2xs",
    },
    {
      id: "completed",
      label: "Completed",
      count: completedCount,
      icon: <CheckCircle2 strokeWidth={2.2} className="w-4 h-4 text-white" />,
      badgeClass: "bg-emerald-500 text-white shadow-2xs",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 mb-6">
      {categories.map((cat) => {
        const isSelected = activeCategory === cat.id;
        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => {
              playTactileFeedback();
              onSelectCategory(cat.id);
            }}
            className={`squircle-card apple-press relative flex flex-col justify-between p-3.5 sm:p-4 bg-app-surface text-left transition-all duration-200 cursor-pointer focus:outline-none ${
              isSelected
                ? "ring-2 ring-app-accent border-transparent shadow-sm scale-[1.01]"
                : "hover:border-app-accent/40 hover:shadow-xs"
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <div
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${cat.badgeClass}`}
              >
                {cat.icon}
              </div>
              <span className="text-2xl sm:text-3xl font-extrabold tabular-nums tracking-tight text-app-text">
                {cat.count}
              </span>
            </div>
            <span className="mt-3.5 text-xs sm:text-[13px] font-semibold text-app-text-secondary tracking-tight">
              {cat.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};
