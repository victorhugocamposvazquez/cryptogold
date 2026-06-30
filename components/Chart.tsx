"use client";

import { useEffect, useRef, useState } from "react";
import { path } from "@/lib/series";

/**
 * Animated area+line chart. Rolls the series each tick (driven by the live
 * price) so the curve drifts, matching the design prototype.
 */
export function Chart({ series, price, height, gradId }: { series: number[]; price: number; height: number; gradId: string }) {
  const [arr, setArr] = useState<number[]>(series);
  const seedRef = useRef(series);

  // reset when the underlying series changes (e.g. timeframe switch)
  useEffect(() => {
    seedRef.current = series;
    setArr(series);
  }, [series]);

  // drift the last point toward the live price on each price change
  useEffect(() => {
    setArr((prev) => {
      const next = prev.slice(1);
      next.push(+(price * (0.992 + Math.random() * 0.016)).toFixed(3));
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [price]);

  const d = path(arr);
  return (
    <svg viewBox="0 0 1000 300" preserveAspectRatio="none" width="100%" height={height} style={{ display: "block" }}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style={{ stopColor: "var(--accent,#0E8C6A)", stopOpacity: 0.16 }} />
          <stop offset="1" style={{ stopColor: "var(--accent,#0E8C6A)", stopOpacity: 0 }} />
        </linearGradient>
      </defs>
      <path d={d.area} fill={`url(#${gradId})`} />
      <path d={d.line} fill="none" style={{ stroke: "var(--accent,#0E8C6A)" }} strokeWidth="2.5" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
