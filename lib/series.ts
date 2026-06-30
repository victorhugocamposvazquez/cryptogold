/** Price-series generation + SVG path math, ported from the design prototype. */

export type Series = Record<string, number[]>;

export function buildSeries(): Series {
  const base = 4.2;
  const gen = (n: number, start: number, end: number, vol: number) => {
    const a: number[] = [];
    for (let i = 0; i < n; i++) {
      const t = i / (n - 1);
      const trend = start + (end - start) * t;
      const noise =
        (Math.sin(i * 1.7) * 0.6 + Math.sin(i * 0.5 + 1) * 0.4 + Math.sin(i * 2.3) * 0.25) *
        vol *
        end;
      a.push(Math.max(0.05, trend + noise));
    }
    a[a.length - 1] = end;
    return a;
  };
  return {
    "1D": gen(24, 4.04, base, 0.011),
    "1W": gen(28, 3.78, base, 0.018),
    "1M": gen(30, 3.05, base, 0.03),
    "1Y": gen(48, 1.28, base, 0.05),
    ALL: gen(40, 0.82, base, 0.065),
  };
}

export function path(arr: number[]): { line: string; area: string } {
  const W = 1000,
    H = 300,
    pad = 28;
  const min = Math.min(...arr),
    max = Math.max(...arr),
    range = max - min || 1;
  const pts = arr.map((v, i) => [
    (i / (arr.length - 1)) * W,
    pad + (1 - (v - min) / range) * (H - 2 * pad),
  ]);
  const line = "M" + pts.map((p) => p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" L");
  return { line, area: line + " L" + W + " " + H + " L0 " + H + " Z" };
}
