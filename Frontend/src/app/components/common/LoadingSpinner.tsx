import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "../ui/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  className?: string;
  fullScreen?: boolean;
}

export function LoadingSpinner({
  size = "md",
  text,
  className,
  fullScreen = false,
}: LoadingSpinnerProps) {
  const sizes = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  const spinner = (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3",
        className,
      )}
    >
      <Loader2
        className={cn(
          "animate-spin text-blue-600 dark:text-blue-400",
          sizes[size],
        )}
      />
      {text && (
        <p className="text-sm text-slate-600 dark:text-slate-400 animate-pulse">
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50">
        {spinner}
      </div>
    );
  }

  return spinner;
}
