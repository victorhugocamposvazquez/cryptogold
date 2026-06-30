"use client";

import { css } from "@/lib/css";

const COLORS: Record<string, string> = {
  confirmed: "#3DAA6D",
  processing: "#C9A227",
  pending: "#6B6B76",
  failed: "#E05252",
  operational: "#3DAA6D",
  degraded: "#C9A227",
  outage: "#E05252",
};

export function StatusBadge({ status }: { status: string }) {
  const color = COLORS[status] ?? "#6B6B76";
  return (
    <span
      style={css(
        `display:inline-block;padding:4px 10px;border-radius:999px;font:600 11px var(--font-mono);text-transform:uppercase;letter-spacing:0.04em;color:${color};background:${color}22`
      )}
    >
      {status}
    </span>
  );
}

export function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div style={css("background:#161616;border:1px solid rgba(255,255,255,0.08);border-radius:14px;padding:20px 22px")}>
      <div style={css("font:500 12px var(--font-hanken);color:#9A9AA0;margin-bottom:8px")}>{label}</div>
      <div style={css("font:700 28px var(--font-hanken);color:#fff;letter-spacing:-0.02em")}>{value}</div>
      {sub && <div style={css("font:400 12px var(--font-hanken);color:#6B6B76;margin-top:6px")}>{sub}</div>}
    </div>
  );
}
