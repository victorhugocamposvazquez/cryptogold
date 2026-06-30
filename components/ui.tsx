"use client";

import React, { useState } from "react";
import { merge } from "@/lib/css";
import { ACCENT } from "@/lib/format";

type HovProps = {
  as?: any;
  style?: string | React.CSSProperties;
  hover?: string | React.CSSProperties;
  focus?: string | React.CSSProperties;
  children?: React.ReactNode;
} & Record<string, any>;

export function Hov({ as = "div", style, hover, focus, children, ...rest }: HovProps) {
  const [h, setH] = useState(false);
  const [f, setF] = useState(false);
  const El: any = as;
  return (
    <El
      {...rest}
      onMouseEnter={(e: any) => { setH(true); rest.onMouseEnter?.(e); }}
      onMouseLeave={(e: any) => { setH(false); rest.onMouseLeave?.(e); }}
      onFocus={(e: any) => { setF(true); rest.onFocus?.(e); }}
      onBlur={(e: any) => { setF(false); rest.onBlur?.(e); }}
      style={merge(style, h && hover, f && focus)}
    >
      {children}
    </El>
  );
}

/** CryptoGold mark — gold coin monogram. */
export function Logo({ height = 28 }: { height?: number }) {
  const w = height;
  return (
    <svg width={w} height={w} viewBox="0 0 32 32" fill="none" aria-hidden="true" style={{ display: "block", flexShrink: 0 }}>
      <circle cx="16" cy="16" r="15" fill="url(#cgGrad)" stroke="#9A7B0A" strokeWidth="1" />
      <circle cx="16" cy="16" r="11" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="0.75" />
      <text x="16" y="20" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="700" fontFamily="system-ui,sans-serif">CG</text>
      <defs>
        <linearGradient id="cgGrad" x1="4" y1="4" x2="28" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="#E8D48B" />
          <stop offset="0.5" stopColor="#C9A227" />
          <stop offset="1" stopColor="#9A7B0A" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/** Brand wordmark inline. */
export function BrandMark({ size = 19 }: { size?: number }) {
  return (
    <span style={{ font: `700 ${size}px var(--font-hanken)`, letterSpacing: "-0.04em", color: "#0D0D0D" }}>
      Crypto<span style={{ color: ACCENT }}>Gold</span>
    </span>
  );
}
