export interface PasswordStrength {
  score: number;
  label: string;
  colorClass: string;
  textClass: string;
  hint: string;
}

// calculates password strength on a 0 to 4 scale
export const evaluatePasswordStrength = (pass: string): PasswordStrength => {
  if (!pass) {
    return {
      score: 0,
      label: "",
      colorClass: "bg-app-border",
      textClass: "text-app-text-muted",
      hint: "Use at least 8 characters",
    };
  }

  const hasLength = pass.length >= 8;
  const hasMixedCase = /[a-z]/.test(pass) && /[A-Z]/.test(pass);
  const hasNumbers = /\d/.test(pass);
  const hasSymbols = /[^a-zA-Z0-9]/.test(pass);

  let score = 0;
  if (hasLength) score++;
  if (hasMixedCase) score++;
  if (hasNumbers) score++;
  if (hasSymbols || pass.length >= 14) score++;

  if (!hasLength) {
    return {
      score: 1,
      label: "Weak",
      colorClass: "bg-rose-500",
      textClass: "text-rose-500",
      hint: "Must be at least 8 characters",
    };
  }

  if (score === 1) {
    return {
      score: 1,
      label: "Weak",
      colorClass: "bg-rose-500",
      textClass: "text-rose-500",
      hint: "Add letters, numbers, or symbols",
    };
  }

  if (score === 2) {
    return {
      score: 2,
      label: "Fair",
      colorClass: "bg-amber-500",
      textClass: "text-amber-500",
      hint: "Add uppercase letters or symbols",
    };
  }

  if (score === 3) {
    return {
      score: 3,
      label: "Good",
      colorClass: "bg-blue-500",
      textClass: "text-blue-500",
      hint: "Add a symbol for max security",
    };
  }

  return {
    score: 4,
    label: "Strong",
    colorClass: "bg-emerald-500",
    textClass: "text-emerald-500",
    hint: "Excellent password strength",
  };
};
