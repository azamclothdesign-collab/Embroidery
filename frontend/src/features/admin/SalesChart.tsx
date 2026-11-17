"use client";

import { useEffect, useState } from "react";

type Point = { day: string; revenueMinor: number; orders: number };

/** Dependency-free bar chart of daily revenue with an accessible table fallback. */
export function SalesChart({ series }: { series: Point[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const [grown, setGrown] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setGrown(true));
    return () => cancelAnimationFrame(id);
  }, []);
  const max = Math.max(1, ...series.map((p) => p.revenueMinor));
  const width = 720;
  const height = 220;
  const gap = series.length > 40 ? 1 : 3;
  const bar = Math.max(2, (width - gap * (series.length - 1)) / Math.max(1, series.length));
  const active = hover === null ? null : series[hover];
  const fmt = (minor: number) => `Rs ${(minor / 100).toLocaleString("en-PK", { maximumFractionDigits: 0 })}`;

  return (
    <figure>
      <div className="mb-3 flex h-6 items-center justify-between text-sm">
        <span className="text-muted">Daily revenue (PKR)</span>
        {active !== null && active !== undefined && (
          <span className="font-semibold">
            {active.day}: {fmt(active.revenueMinor)} · {active.orders} orders
          </span>
        )}
      </div>
      <svg viewBox={`0 0 ${width} ${height + 24}`} className="h-56 w-full" role="img" aria-label={`Revenue for the last ${series.length} days`} onMouseLeave={() => setHover(null)}>
        <line x1="0" x2={width} y1={height} y2={height} stroke="var(--color-line)" />
        {[0.25, 0.5, 0.75].map((f) => (
          <line key={f} x1="0" x2={width} y1={height - height * f} y2={height - height * f} stroke="var(--color-line)" strokeDasharray="4 6" />
        ))}
        {series.map((point, index) => {
          const h = (point.revenueMinor / max) * (height - 8);
          const x = index * (bar + gap);
          return (
            <g key={point.day} onMouseEnter={() => setHover(index)}>
              <rect x={x} y={0} width={bar + gap} height={height} fill="transparent" />
              <rect
                x={x}
                y={height - h}
                width={bar}
                height={Math.max(h, point.revenueMinor > 0 ? 2 : 0)}
                rx={Math.min(4, bar / 2)}
                fill={hover === index ? "var(--color-saffron-strong)" : "var(--color-teal)"}
                style={{
                  transformBox: "fill-box",
                  transformOrigin: "bottom",
                  transform: grown ? "scaleY(1)" : "scaleY(0)",
                  transition: `transform 700ms cubic-bezier(0.22, 1, 0.36, 1) ${Math.min(index * 18, 600)}ms, fill 150ms`,
                }}
              />
            </g>
          );
        })}
        {series.length > 0 && (
          <>
            <text x="0" y={height + 18} fontSize="12" fill="var(--color-muted)">{series[0]?.day}</text>
            <text x={width} y={height + 18} fontSize="12" fill="var(--color-muted)" textAnchor="end">{series.at(-1)?.day}</text>
          </>
        )}
      </svg>
      <table className="sr-only">
        <caption>Daily revenue</caption>
        <thead>
          <tr><th>Day</th><th>Revenue</th><th>Orders</th></tr>
        </thead>
        <tbody>
          {series.map((p) => (
            <tr key={p.day}><td>{p.day}</td><td>{fmt(p.revenueMinor)}</td><td>{p.orders}</td></tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
