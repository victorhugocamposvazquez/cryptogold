import type { CSSProperties } from "react";

/**
 * Convert a verbatim CSS declaration string ("color:#000;font:600 14px sans")
 * into a React style object. This lets us port the design's inline styles
 * 1:1 without rewriting every rule into camelCase by hand.
 */
export function css(decl: string): CSSProperties {
  const out: Record<string, string> = {};
  if (!decl) return out as CSSProperties;
  for (const part of decl.split(";")) {
    const idx = part.indexOf(":");
    if (idx === -1) continue;
    const rawKey = part.slice(0, idx).trim();
    const val = part.slice(idx + 1).trim();
    if (!rawKey) continue;
    out[camel(rawKey)] = val;
  }
  return out as CSSProperties;
}

function camel(prop: string): string {
  // custom properties (CSS vars) stay verbatim
  if (prop.startsWith("--")) return prop;
  // -webkit-foo → WebkitFoo, -ms-foo → msFoo
  let p = prop;
  if (p.startsWith("-ms-")) p = p.slice(1); // ms stays lowercase
  return p.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
}

/** Merge several CSS strings/objects into one style object. */
export function merge(...parts: Array<string | CSSProperties | undefined | false>): CSSProperties {
  let acc: CSSProperties = {};
  for (const p of parts) {
    if (!p) continue;
    acc = { ...acc, ...(typeof p === "string" ? css(p) : p) };
  }
  return acc;
}
