import React, { useState, useRef, useEffect } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from "lucide-react";

interface DatePickerProps {
  value: string | null;
  onChange: (date: string | null) => void;
  align?: "left" | "right";
  placeholder?: string;
}

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const toIsoDateString = (d: Date): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const parseDateOnly = (val: string | null): Date | null => {
  if (!val) return null;
  const match = val.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    const [, y, m, d] = match;
    return new Date(parseInt(y, 10), parseInt(m, 10) - 1, parseInt(d, 10));
  }
  const parsed = new Date(val);
  return isNaN(parsed.getTime()) ? null : parsed;
};

const formatDisplayDate = (val: string | null): string | null => {
  const d = parseDateOnly(val);
  if (!d) return null;

  const today = new Date();
  const todayStr = toIsoDateString(today);
  const targetStr = toIsoDateString(d);

  if (targetStr === todayStr) return "Today";

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (targetStr === toIsoDateString(tomorrow)) return "Tomorrow";

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (targetStr === toIsoDateString(yesterday)) return "Yesterday";

  const isCurrentYear = d.getFullYear() === today.getFullYear();
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    ...(isCurrentYear ? {} : { year: "numeric" }),
  });
};

export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  align = "left",
  placeholder = "Pick date",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedDate = parseDateOnly(value);

  const initialDate = selectedDate || new Date();
  const [viewYear, setViewYear] = useState(initialDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialDate.getMonth());

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedDate) {
      setViewYear(selectedDate.getFullYear());
      setViewMonth(selectedDate.getMonth());
    }
  }, [value]);

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handleSelectDay = (year: number, month: number, day: number) => {
    const selected = new Date(year, month, day);
    onChange(toIsoDateString(selected));
    setIsOpen(false);
  };

  const setPreset = (offsetDays: number) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    onChange(toIsoDateString(d));
    setIsOpen(false);
  };

  const handleClear = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    onChange(null);
    setIsOpen(false);
  };

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();
  const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

  const cells: Array<{
    day: number;
    month: number;
    year: number;
    isCurrentMonth: boolean;
  }> = [];

  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const prevMonth = viewMonth === 0 ? 11 : viewMonth - 1;
    const prevYear = viewMonth === 0 ? viewYear - 1 : viewYear;
    cells.push({
      day: daysInPrevMonth - i,
      month: prevMonth,
      year: prevYear,
      isCurrentMonth: false,
    });
  }

  for (let i = 1; i <= daysInMonth; i++) {
    cells.push({
      day: i,
      month: viewMonth,
      year: viewYear,
      isCurrentMonth: true,
    });
  }

  const remaining = 42 - cells.length;
  for (let i = 1; i <= remaining; i++) {
    const nextMonth = viewMonth === 11 ? 0 : viewMonth + 1;
    const nextYear = viewMonth === 11 ? viewYear + 1 : viewYear;
    cells.push({
      day: i,
      month: nextMonth,
      year: nextYear,
      isCurrentMonth: false,
    });
  }

  const today = new Date();
  const todayStr = toIsoDateString(today);
  const selectedStr = selectedDate ? toIsoDateString(selectedDate) : null;
  const displayLabel = formatDisplayDate(value);

  return (
    <div ref={containerRef} className="relative inline-flex items-center">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`apple-press inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium shadow-2xs transition-all ${
          value
            ? "bg-app-accent/15 border-app-accent/40 text-app-accent font-semibold"
            : "bg-app-surface border-app-border text-app-text-secondary hover:text-app-text hover:border-app-accent/40"
        }`}
      >
        <CalendarIcon strokeWidth={1.8} className="w-3.5 h-3.5 flex-shrink-0" />
        <span className="tabular-nums">{displayLabel || placeholder}</span>
        {value && (
          <span
            role="button"
            tabIndex={0}
            onClick={handleClear}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleClear();
              }
            }}
            aria-label="Clear date"
            className="hover:opacity-75 p-0.5 -mr-1 rounded"
          >
            <X strokeWidth={2} className="w-3 h-3 text-app-accent" />
          </span>
        )}
      </button>

      {isOpen && (
        <div
          className={`squircle-card absolute top-full mt-1.5 z-50 w-64 max-w-[calc(100vw-2rem)] p-3 bg-app-surface border border-app-border shadow-xl ${
            align === "right" ? "right-0" : "left-0"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Quick presets */}
          <div className="flex items-center gap-1.5 pb-2.5 mb-2.5 border-b border-app-border text-[11px]">
            <button
              type="button"
              onClick={() => setPreset(0)}
              className="apple-press flex-1 py-1 px-1.5 rounded-lg bg-app-surface-secondary text-app-text-secondary hover:text-app-text text-center border border-app-border font-medium text-[11px] shadow-2xs"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => setPreset(1)}
              className="apple-press flex-1 py-1 px-1.5 rounded-lg bg-app-surface-secondary text-app-text-secondary hover:text-app-text text-center border border-app-border font-medium text-[11px] shadow-2xs"
            >
              Tomorrow
            </button>
            <button
              type="button"
              onClick={() => setPreset(7)}
              className="apple-press flex-1 py-1 px-1.5 rounded-lg bg-app-surface-secondary text-app-text-secondary hover:text-app-text text-center border border-app-border font-medium text-[11px] shadow-2xs"
            >
              +1 Week
            </button>
          </div>

          {/* Month / Year header */}
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-xs font-semibold text-app-text tracking-tight">
              {MONTH_NAMES[viewMonth]} {viewYear}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrevMonth}
                aria-label="Previous month"
                className="apple-press w-8 h-8 sm:w-6 sm:h-6 rounded-md flex items-center justify-center text-app-text-muted hover:text-app-text hover:bg-app-bg transition-colors"
              >
                <ChevronLeft strokeWidth={1.5} className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                aria-label="Next month"
                className="apple-press w-8 h-8 sm:w-6 sm:h-6 rounded-md flex items-center justify-center text-app-text-muted hover:text-app-text hover:bg-app-bg transition-colors"
              >
                <ChevronRight strokeWidth={1.5} className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Weekday columns */}
          <div className="grid grid-cols-7 gap-1 mb-1 text-center">
            {WEEKDAYS.map((wd) => (
              <span
                key={wd}
                className="text-[10px] font-semibold text-app-text-muted uppercase tracking-wider py-0.5"
              >
                {wd}
              </span>
            ))}
          </div>

          {/* Calendar day grid */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {cells.map((cell, idx) => {
              const cellStr = toIsoDateString(
                new Date(cell.year, cell.month, cell.day)
              );
              const isSelected = selectedStr === cellStr;
              const isToday = todayStr === cellStr;

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() =>
                    handleSelectDay(cell.year, cell.month, cell.day)
                  }
                  className={`apple-press h-8 w-8 sm:h-7 sm:w-7 mx-auto rounded-lg text-xs tabular-nums font-medium flex items-center justify-center transition-colors ${
                    isSelected
                      ? "bg-app-accent text-white font-semibold shadow-xs"
                      : isToday
                      ? "border border-app-accent text-app-accent font-semibold"
                      : cell.isCurrentMonth
                      ? "text-app-text hover:bg-app-bg"
                      : "text-app-text-muted/40 hover:text-app-text-muted"
                  }`}
                >
                  {cell.day}
                </button>
              );
            })}
          </div>

          {/* Footer clear action */}
          {value && (
            <div className="pt-2 mt-2 border-t border-app-border flex justify-end">
              <button
                type="button"
                onClick={handleClear}
                className="apple-press text-[11px] text-app-danger hover:opacity-80 px-2 py-0.5 rounded"
              >
                Clear date
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
