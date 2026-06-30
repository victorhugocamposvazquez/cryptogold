"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { css } from "@/lib/css";
import { fmtUSD, ACCENT } from "@/lib/format";
import { TOKEN_SYMBOL, TOKEN_SUPPLY, TOKEN_SUPPLY_LABEL, OZ_PER_TOKEN } from "@/lib/brand";
import { buildSeries } from "@/lib/series";
import { useMarket } from "@/lib/market";
import { Chart } from "../Chart";

const series = buildSeries();
const TFS = ["1D", "1W", "1M", "1Y", "ALL"];

export default function Market() {
  const { price, change, goldSpot, goldChange } = useMarket();
  const router = useRouter();
  const [tf, setTf] = useState("1M");
  const pos = change >= 0;
  const changeStr = (pos ? "+" : "") + change.toFixed(2) + "%";
  const changeColor = pos ? ACCENT : "#D14343";
  const cap = price * TOKEN_SUPPLY;
  const arr = series[tf];
  const cmax = Math.max(...arr);
  const stats = [
    { label: "Oro spot (XAU/USD)", value: fmtUSD(goldSpot) },
    { label: "Cap. de mercado", value: fmtUSD(cap) },
    { label: "Volumen 24h", value: "$428.6M" },
    { label: "Suministro total", value: TOKEN_SUPPLY_LABEL + " " + TOKEN_SYMBOL },
    { label: "Anclaje", value: OZ_PER_TOKEN + " oz / token" },
    { label: "Transferencias CRYPTOHOST", value: "5M+" },
  ];

  return (
    <main data-section-pad style={css("max-width:1200px;margin:0 auto;padding:40px 24px")}>
      <div style={css("display:flex;justify-content:space-between;align-items:flex-end;flex-wrap:wrap;gap:20px;margin-bottom:24px")}>
        <div>
          <div style={css("display:flex;align-items:center;gap:10px;margin-bottom:8px")}>
            <span style={css("width:30px;height:30px;border-radius:8px;background:linear-gradient(135deg,#E8D48B,#C9A227);display:flex;align-items:center;justify-content:center;font:700 11px var(--font-hanken);color:#fff")}>CG</span>
            <span style={css("font:600 22px var(--font-hanken);letter-spacing:-0.02em")}>{TOKEN_SYMBOL} <span style={css("color:#9A9AA0;font-weight:400")}>/ USD · anclado a XAU</span></span>
          </div>
          <div style={css("display:flex;align-items:baseline;gap:12px")}>
            <span data-market-price style={css("font:600 44px var(--font-mono);letter-spacing:-0.03em;color:#9A7B0A")}>{fmtUSD(price)}</span>
            <span style={{ ...css("font:600 17px var(--font-mono)"), color: changeColor }}>{changeStr}</span>
          </div>
          <div style={css("font:400 13px var(--font-mono);color:#8A8A94;margin-top:6px")}>Oro {fmtUSD(goldSpot)}/oz · {(goldChange >= 0 ? "+" : "") + goldChange.toFixed(2) + "%"} 24h</div>
        </div>
        <div data-market-tf style={css("display:flex;gap:4px;background:#F4F4F5;padding:4px;border-radius:12px")}>
          {TFS.map((k) => {
            const active = tf === k;
            return (
              <button key={k} onClick={() => setTf(k)} style={{ ...css("appearance:none;border:none;cursor:pointer;font:600 13px var(--font-mono);padding:8px 16px;border-radius:9px"), background: active ? "#fff" : "transparent", color: active ? "#0D0D0D" : "#8A8A94", boxShadow: active ? "0 1px 3px rgba(0,0,0,0.08)" : "none" }}>
                {k}
              </button>
            );
          })}
        </div>
      </div>
      <div style={css("background:#fff;border:1px solid #ECECEC;border-radius:20px;padding:22px;margin-bottom:24px")}>
        <div data-market-chart><Chart key={tf} series={arr} price={price} height={360} gradId="gMain" /></div>
      </div>
      <div data-2col data-market-grid style={css("display:grid;grid-template-columns:1.6fr 1fr;gap:24px;align-items:start")}>
        <div data-market-stats style={css("display:grid;grid-template-columns:1fr 1fr;gap:1px;background:#ECECEC;border:1px solid #ECECEC;border-radius:18px;overflow:hidden")}>
          {stats.map((m, i) => (
            <div key={i} style={css("background:#fff;padding:20px 22px")}>
              <div style={css("font:500 13px var(--font-hanken);color:#8A8A94;margin-bottom:6px")}>{m.label}</div>
              <div style={{ ...css("font:600 19px var(--font-mono);letter-spacing:-0.01em"), color: i === 0 ? "#9A7B0A" : "#0D0D0D" }}>{m.value}</div>
            </div>
          ))}
        </div>
        <div style={{ ...css("border-radius:20px;padding:26px"), background: "linear-gradient(145deg,#0D0D0D,#1A1508)" }}>
          <div style={css("font:600 19px var(--font-hanken);letter-spacing:-0.02em;margin-bottom:6px;color:#E8D48B")}>¿Listo para invertir en oro digital?</div>
          <p style={css("font:400 14px/1.5 var(--font-hanken);color:#B8B8BD;margin:0 0 20px")}>Compra {TOKEN_SYMBOL} anclado al spot del oro con USDT, cripto o tarjeta.</p>
          <button onClick={() => router.push("/comprar")} style={css("width:100%;appearance:none;cursor:pointer;background:#C9A227;color:#0D0D0D;border:none;border-radius:12px;padding:13px;font:600 15px var(--font-hanken);margin-bottom:10px")}>Comprar {TOKEN_SYMBOL}</button>
          <button onClick={() => router.push("/swap")} style={css("width:100%;appearance:none;cursor:pointer;background:transparent;color:#E8D48B;border:1px solid #3A3010;border-radius:12px;padding:13px;font:600 15px var(--font-hanken)")}>Intercambiar</button>
        </div>
      </div>
    </main>
  );
}
