import React, { useState, useEffect } from "react";

interface PreloaderProps {
  onFinish: () => void;
}

export const Preloader: React.FC<PreloaderProps> = ({ onFinish }) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const exitTimer = setTimeout(() => {
      setIsExiting(true);
    }, 320);

    const finishTimer = setTimeout(() => {
      onFinish();
    }, 620);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(finishTimer);
    };
  }, [onFinish]);

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 z-50 flex items-center justify-center bg-app-bg transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        isExiting
          ? "opacity-0 scale-[1.12] pointer-events-none"
          : "opacity-100 scale-100"
      }`}
    >
      <div className="flex flex-col items-center">
        {/* Tactile App Icon Tile with G3 Superellipse Curvature */}
        <div className="squircle-tile w-16 h-16 bg-app-surface flex items-center justify-center mb-4 transition-transform duration-300">
          <div className="w-9 h-9 rounded-xl bg-app-accent flex items-center justify-center shadow-xs">
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                className="preloader-check-path"
                d="M5 12.5L9.5 17L19 7.5"
                stroke="#FFFFFF"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        {/* Minimal Typography Brand */}
        <div className="text-center">
          <h2 className="text-base font-semibold tracking-tight text-app-text">
            Slate
          </h2>
          <p className="text-[11px] font-normal text-app-text-muted mt-0.5">
            Task List
          </p>
        </div>
      </div>
    </div>
  );
};
