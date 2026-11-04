import React, { useEffect, useRef } from "react";
import { evaluatePasswordStrength } from "../utils/passwordStrength";
import { playTactileFeedback } from "../utils/haptics";

interface PasswordSecurityBarProps {
  password?: string;
  showHint?: boolean;
  className?: string;
}

export const PasswordSecurityBar: React.FC<PasswordSecurityBarProps> = ({
  password = "",
  showHint = true,
  className = "",
}) => {
  const prevScoreRef = useRef(0);
  const strength = evaluatePasswordStrength(password);

  // tactile tap on strength level increase
  useEffect(() => {
    if (password.length > 0) {
      if (strength.score > prevScoreRef.current) {
        playTactileFeedback();
      }
      prevScoreRef.current = strength.score;
    } else {
      prevScoreRef.current = 0;
    }
  }, [strength.score, password.length]);

  if (!password) return null;

  return (
    <div className={`space-y-1.5 animate-fade-in ${className}`}>
      <div className="flex items-center justify-between text-[11px]">
        <span className="text-app-text-muted">Security</span>
        <span className={`font-semibold transition-colors duration-200 ${strength.textClass}`}>
          {strength.label}
        </span>
      </div>

      <div className="grid grid-cols-4 gap-1.5 h-1">
        {[1, 2, 3, 4].map((step) => {
          const isFilled = strength.score >= step;
          return (
            <div
              key={step}
              className={`h-full rounded-full transition-all duration-300 ${
                isFilled ? strength.colorClass : "bg-app-border/40"
              }`}
            />
          );
        })}
      </div>

      {showHint && (
        <p className="text-[10px] text-app-text-secondary leading-tight">
          {strength.hint}
        </p>
      )}
    </div>
  );
};
