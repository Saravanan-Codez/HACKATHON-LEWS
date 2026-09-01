import { cn } from "@/lib/utils";

/**
 * Geotechnical & Operational Console Skeleton Screens
 * Replaces loading spinners to guarantee zero Cumulative Layout Shift (CLS)
 * and provide predictable visual structures during async telemetry fetching.
 */

export function SkeletonBox({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded bg-[#1B272A]/80 before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/[0.04] before:to-transparent",
        className
      )}
      {...props}
    />
  );
}

export function MapCanvasSkeleton() {
  return (
    <div className="absolute inset-0 bg-[#0C1315]/90 backdrop-blur-[2px] z-20 flex flex-col items-center justify-center p-6 select-none animate-in fade-in duration-300">
      <div className="w-full max-w-sm flex flex-col items-center text-center space-y-4">
        {/* Radar / Terrain scanning ring */}
        <div className="relative w-16 h-16 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border border-amber-400/20 animate-ping opacity-60" />
          <div className="absolute inset-2 rounded-full border border-amber-400/40 animate-spin [animation-duration:4s]" />
          <div className="w-4 h-4 rounded-full bg-amber-400/40 animate-pulse" />
        </div>

        <div className="space-y-1.5">
          <div className="font-mono text-xs font-semibold tracking-wider text-amber-200 uppercase flex items-center justify-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            SYNCHRONIZING GIS TELEMETRY
          </div>
          <div className="font-mono text-[10px] text-[#8EA098] max-w-xs">
            Connecting to NASA EONET v3 feeds and slope sensor arrays...
          </div>
        </div>

        {/* Shimmer skeleton bars representing telemetry coordinates */}
        <div className="w-full grid grid-cols-3 gap-2 pt-2">
          <SkeletonBox className="h-6 rounded-[2px]" />
          <SkeletonBox className="h-6 rounded-[2px]" />
          <SkeletonBox className="h-6 rounded-[2px]" />
        </div>
      </div>
    </div>
  );
}

export function AiRiskIntelligenceSkeleton() {
  return (
    <div className="p-4 sm:p-5 space-y-5 animate-in fade-in duration-200">
      {/* Header assessment line */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#243338]">
        <div className="space-y-2 flex-1 max-w-xl">
          <div className="flex items-center gap-2">
            <SkeletonBox className="h-4 w-28 rounded-[2px]" />
            <SkeletonBox className="h-4 w-16 rounded-[2px]" />
          </div>
          <SkeletonBox className="h-6 w-full max-w-md rounded-[2px]" />
        </div>
        <SkeletonBox className="h-9 w-36 rounded-[2px]" />
      </div>

      {/* 3-Column Decision Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Why this assessment */}
        <div className="border border-[#243338] bg-[#121B1D]/60 p-3.5 rounded-[2px] space-y-2.5">
          <div className="flex items-center gap-2">
            <SkeletonBox className="h-3.5 w-3.5 rounded-[2px]" />
            <SkeletonBox className="h-3 w-28 rounded-[2px]" />
          </div>
          <SkeletonBox className="h-3 w-full rounded-[2px]" />
          <SkeletonBox className="h-3 w-5/6 rounded-[2px]" />
          <SkeletonBox className="h-3 w-4/6 rounded-[2px]" />
        </div>

        {/* Primary Factors */}
        <div className="border border-[#243338] bg-[#121B1D]/60 p-3.5 rounded-[2px] space-y-2.5">
          <div className="flex items-center gap-2">
            <SkeletonBox className="h-3.5 w-3.5 rounded-[2px]" />
            <SkeletonBox className="h-3 w-32 rounded-[2px]" />
          </div>
          <div className="space-y-2 pt-1">
            <div className="flex items-center gap-2">
              <SkeletonBox className="h-2 w-2 rounded-full" />
              <SkeletonBox className="h-2.5 flex-1 rounded-[2px]" />
            </div>
            <div className="flex items-center gap-2">
              <SkeletonBox className="h-2 w-2 rounded-full" />
              <SkeletonBox className="h-2.5 flex-1 rounded-[2px]" />
            </div>
            <div className="flex items-center gap-2">
              <SkeletonBox className="h-2 w-2 rounded-full" />
              <SkeletonBox className="h-2.5 w-4/5 rounded-[2px]" />
            </div>
          </div>
        </div>

        {/* Recommended Actions */}
        <div className="border border-[#243338] bg-[#121B1D]/60 p-3.5 rounded-[2px] space-y-2.5">
          <div className="flex items-center gap-2">
            <SkeletonBox className="h-3.5 w-3.5 rounded-[2px]" />
            <SkeletonBox className="h-3 w-36 rounded-[2px]" />
          </div>
          <div className="space-y-2 pt-1">
            <div className="flex items-center gap-2">
              <SkeletonBox className="h-2 w-2 rounded-full" />
              <SkeletonBox className="h-2.5 flex-1 rounded-[2px]" />
            </div>
            <div className="flex items-center gap-2">
              <SkeletonBox className="h-2 w-2 rounded-full" />
              <SkeletonBox className="h-2.5 flex-1 rounded-[2px]" />
            </div>
            <div className="flex items-center gap-2">
              <SkeletonBox className="h-2 w-2 rounded-full" />
              <SkeletonBox className="h-2.5 w-3/4 rounded-[2px]" />
            </div>
          </div>
        </div>
      </div>

      {/* Warning banner skeleton */}
      <SkeletonBox className="h-8 w-full rounded-[2px]" />
    </div>
  );
}

export function AiAssistantSkeleton() {
  return (
    <div className="p-3.5 bg-[#121B1D]/70 border border-[#243338] rounded-[2px] space-y-3 animate-in fade-in duration-200">
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
        <span className="font-mono text-[9px] font-semibold text-amber-300 tracking-wider uppercase">
          SYNTHESIZING GEOTECHNICAL ADVISORY…
        </span>
      </div>
      <div className="space-y-2 pt-1">
        <SkeletonBox className="h-3 w-full rounded-[2px]" />
        <SkeletonBox className="h-3 w-11/12 rounded-[2px]" />
        <SkeletonBox className="h-3 w-4/5 rounded-[2px]" />
      </div>
      <div className="pt-2 border-t border-[#243338]/60 flex items-center justify-between">
        <SkeletonBox className="h-2.5 w-44 rounded-[2px]" />
        <SkeletonBox className="h-2.5 w-20 rounded-[2px]" />
      </div>
    </div>
  );
}

export function ZoneIntelligenceSkeleton() {
  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-start">
        <div className="space-y-1.5">
          <SkeletonBox className="h-2.5 w-24 rounded-[2px]" />
          <SkeletonBox className="h-7 w-36 rounded-[2px]" />
          <SkeletonBox className="h-2.5 w-48 rounded-[2px]" />
        </div>
        <SkeletonBox className="h-6 w-20 rounded-[2px]" />
      </div>

      <div className="p-3 bg-[#11191B] border border-[#243338] rounded-[2px] flex items-center justify-between">
        <div className="space-y-1">
          <SkeletonBox className="h-2.5 w-24 rounded-[2px]" />
          <SkeletonBox className="h-9 w-20 rounded-[2px]" />
        </div>
        <SkeletonBox className="h-7 w-24 rounded-[2px]" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 bg-[#11191B] border border-[#243338] rounded-[2px] space-y-1.5">
          <SkeletonBox className="h-2.5 w-16 rounded-[2px]" />
          <SkeletonBox className="h-6 w-20 rounded-[2px]" />
          <SkeletonBox className="h-2 w-12 rounded-[2px]" />
        </div>
        <div className="p-3 bg-[#11191B] border border-[#243338] rounded-[2px] space-y-1.5">
          <SkeletonBox className="h-2.5 w-16 rounded-[2px]" />
          <SkeletonBox className="h-6 w-20 rounded-[2px]" />
          <SkeletonBox className="h-2 w-12 rounded-[2px]" />
        </div>
      </div>
    </div>
  );
}
