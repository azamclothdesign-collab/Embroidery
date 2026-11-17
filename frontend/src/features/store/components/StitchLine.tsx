import type { CSSProperties } from "react";
import { cn } from "@/lib/cn";

/**
 * Signature motif: a dashed "running stitch" that draws itself in.
 * Pure SVG + CSS (stroke-dashoffset), so it costs no JavaScript.
 */
export function StitchLine({ className, animated = true }: { className?: string; animated?: boolean }) {
  return (
    <svg viewBox="0 0 320 24" fill="none" aria-hidden="true" className={cn("h-4 w-48 text-saffron", className)} preserveAspectRatio="none">
      <path
        d="M2 14 C 40 2, 80 22, 120 12 S 200 2, 240 12 S 300 20, 318 8"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="10 8"
        pathLength={600}
        style={animated ? ({ "--stitch-length": 600, strokeDashoffset: 600 } as CSSProperties) : undefined}
        className={animated ? "animate-stitch" : undefined}
      />
    </svg>
  );
}

/** Brand mark: an embroidery hoop with a stitched flower inside (machine-embroidery, not hand needle). */
export function BrandMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" aria-hidden="true" className={cn("size-8", className)}>
      <circle cx="16" cy="17" r="14" fill="#17171C" />
      <circle cx="16" cy="17" r="10.5" stroke="#FAF7F2" strokeWidth="1.6" />
      <rect x="14" y="1.5" width="4" height="4" rx="1" fill="#FAF7F2" />
      <g stroke="#E85D2A" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="1.6 1.4">
        <path d="M16 17 C 13 13, 13 10.5, 16 10.5 C 19 10.5, 19 13, 16 17" />
        <path d="M16 17 C 20 14, 22.5 15, 22 18 C 21.5 21, 19 20, 16 17" />
        <path d="M16 17 C 12 14, 9.5 15, 10 18 C 10.5 21, 13 20, 16 17" />
      </g>
      <path d="M16 17 L 16 23.5" stroke="#5DCAA5" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="1.6 1.4" />
    </svg>
  );
}
