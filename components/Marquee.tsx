"use client";

import { css } from "@/lib/css";
import { fmtUSD } from "@/lib/format";
import { TOKEN_SYMBOL } from "@/lib/brand";
import { useMarket } from "@/lib/market";
import { baseTk } from "@/lib/content";

export default function Marquee() {
  const { price, change, goldSpot, goldChange } = useMarket();
  const pos = change >= 0;
  const changeStr = (pos ? "+" : "") + change.toFixed(2) + "%";
  const goldStr = (goldChange >= 0 ? "+" : "") + goldChange.toFixed(2) + "%";
  const tk = [
    { s: "XAU", p: fmtUSD(goldSpot), c: goldStr, up: goldChange >= 0 },
    ...baseTk.slice(1),
    { s: TOKEN_SYMBOL, p: fmtUSD(price), c: changeStr, up: pos },
  ];
  const items = [...tk, ...tk];

  return (
    <div style={css("border-bottom:1px solid #F2F2F3;background:#fff;overflow:hidden;white-space:nowrap")}>
      <div style={css("display:inline-flex;align-items:center;animation:scrollx 60s linear infinite;will-change:transform")}>
        {items.map((t, i) => (
          <span key={i} style={css("display:inline-flex;align-items:center;gap:6px;padding:7px 0")}>
            <span style={{ ...css("font:500 11px var(--font-mono)"), color: t.s === "XAU" || t.s === TOKEN_SYMBOL ? "#9A7B0A" : "#9A9AA0" }}>{t.s}</span>
            <span style={css("font:400 11px var(--font-mono);color:#B4B4BA")}>{t.p}</span>
            <span style={{ ...css("font:400 11px var(--font-mono)"), color: t.up ? "#9A7B0A" : "#B7A2A2" }}>{t.c}</span>
            <span style={css("font:400 11px var(--font-mono);color:#DADADD;padding:0 10px")}>·</span>
          </span>
        ))}
      </div>
    </div>
  );
}
