import React from "react";

export const TaskSkeleton: React.FC = () => {
  const skeletonRows = [
    { titleWidth: "w-3/5", hasDescription: true, descWidth: "w-4/5", hasDate: true },
    { titleWidth: "w-4/5", hasDescription: false, descWidth: "", hasDate: true },
    { titleWidth: "w-1/2", hasDescription: true, descWidth: "w-2/3", hasDate: false },
    { titleWidth: "w-2/3", hasDescription: false, descWidth: "", hasDate: false },
  ];

  return (
    <div className="space-y-2.5" role="status" aria-label="Loading tasks">
      {skeletonRows.map((row, index) => (
        <div
          key={index}
          className="skeleton-shimmer flex items-start justify-between gap-3 p-3.5 rounded-xl border border-app-border bg-app-surface/60"
        >
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {/* Checkbox skeleton */}
            <div className="w-[18px] h-[18px] rounded-[5px] bg-app-border/70 flex-shrink-0 mt-0.5" />

            {/* Content skeleton */}
            <div className="flex-1 min-w-0 space-y-2">
              <div className="flex items-center gap-2">
                {/* Priority dot skeleton */}
                <div className="w-1.5 h-1.5 rounded-full bg-app-border/70 flex-shrink-0" />
                {/* Title line */}
                <div className={`h-3.5 bg-app-border/70 rounded ${row.titleWidth}`} />
              </div>

              {row.hasDescription && (
                <div className="pl-3.5 space-y-1">
                  <div className={`h-2.5 bg-app-border/50 rounded ${row.descWidth}`} />
                </div>
              )}

              {row.hasDate && (
                <div className="pl-3.5 pt-0.5">
                  <div className="h-2.5 w-20 bg-app-border/50 rounded" />
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
