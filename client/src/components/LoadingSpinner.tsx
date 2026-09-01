import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  label?: string;
  sublabel?: string;
  className?: string;
  inline?: boolean;
}

export function LoadingSpinner({
  size = "md",
  label,
  sublabel,
  className,
  inline = false,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-3.5 h-3.5",
    md: "w-5 h-5",
    lg: "w-7 h-7",
    xl: "w-10 h-10",
  };

  if (inline) {
    return (
      <span className={cn("inline-flex items-center gap-2 font-mono text-[10px] text-amber-300/90", className)}>
        <Loader2 className={cn("animate-spin text-amber-400 shrink-0", sizeClasses[size])} />
        {label && <span>{label}</span>}
      </span>
    );
  }

  return (
    <div className={cn("flex flex-col items-center justify-center p-6 text-center select-none", className)}>
      <div className="relative flex items-center justify-center mb-3">
        <div className="absolute inset-0 rounded-full bg-amber-400/10 blur-sm animate-pulse" />
        <Loader2 className={cn("animate-spin text-amber-400 relative z-10", sizeClasses[size])} />
      </div>
      {label && (
        <span className="font-mono text-xs font-semibold tracking-wider text-stone-200 uppercase mb-1">
          {label}
        </span>
      )}
      {sublabel && (
        <span className="font-mono text-[10px] text-stone-400 max-w-xs leading-relaxed">
          {sublabel}
        </span>
      )}
    </div>
  );
}

export function LoadingCard({
  label = "Loading telemetry...",
  sublabel,
  minHeight = "min-h-[220px]",
  className,
}: {
  label?: string;
  sublabel?: string;
  minHeight?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "panel flex items-center justify-center border border-[#2C3B40] bg-[#172225]/80 rounded-[3px] backdrop-blur-sm",
        minHeight,
        className
      )}
    >
      <LoadingSpinner size="lg" label={label} sublabel={sublabel} />
    </div>
  );
}
