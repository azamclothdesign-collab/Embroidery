"use client";

import { useEffect, useRef, useState } from "react";

const formatters = {
  rupees: (n: number) => `Rs ${Math.round(n / 100).toLocaleString("en-PK")}`,
  int: (n: number) => Math.round(n).toLocaleString("en-PK"),
} as const;

/** Counts up from 0 to `value` once on mount (ease-out, ~0.9 s); instant under reduced motion. */
export function AnimatedNumber({ value, format = "int", durationMs = 900 }: { value: number; format?: keyof typeof formatters; durationMs?: number }) {
  const [shown, setShown] = useState(0);
  const frame = useRef(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || value === 0) {
      frame.current = requestAnimationFrame(() => setShown(value));
      return () => cancelAnimationFrame(frame.current);
    }
    const start = performance.now();
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      setShown(value * (1 - (1 - t) ** 3));
      if (t < 1) frame.current = requestAnimationFrame(step);
    };
    frame.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame.current);
  }, [value, durationMs]);

  return (
    <span aria-label={formatters[format](value)}>
      <span aria-hidden="true" className="tabular-nums">{formatters[format](shown)}</span>
    </span>
  );
}
