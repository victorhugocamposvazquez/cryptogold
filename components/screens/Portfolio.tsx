"use client";

import { useRouter } from "next/navigation";
import { css } from "@/lib/css";
import { fmtUSD, fmtN, ACCENT } from "@/lib/format";
import { TOKEN_SYMBOL } from "@/lib/brand";
import { useApp, prices } from "@/lib/store";
import { useMarket } from "@/lib/market";
import { assetMeta } from "@/lib/content";

const ORDER = [TOKEN_SYMBOL, "USDT", "ETH", "BTC", "USDC"];
const TK = TOKEN_SYMBOL;

export default function Portfolio() {
  const app = useApp();
  const router = useRouter();

  if (!app.connected) {
    return (
      <main style={css("max-width:1100px;margin:0 auto;padding:40px 24px")}>
        <div style={css("display:flex;flex-direction:column;align-items:center;text-align:center;padding:80px 24px")}>
          <span style={css("width:64px;height:64px;border-radius:18px;background:#F4F4F5;display:flex;align-items:center;justify-content:center;margin-bottom:22px")}><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#8A8A94" strokeWidth="1.8"><rect x="3" y="6" width="18" height="13" rx="3" /><path d="M16 12h3" /></svg></span>
          <h2 style={css("font:600 26px var(--font-hanken);letter-spacing:-0.03em;margin:0 0 8px")}>Conecta tu wallet</h2>
          <p style={css("font:400 16px var(--font-hanken);color:#6B6B76;margin:0 0 24px;max-width:380px")}>Conéctala para ver tus holdings de {TOKEN_SYMBOL}, el valor de tu cartera y tu historial.</p>
          <button onClick={app.openWallet} style={css("appearance:none;cursor:pointer;background:#0D0D0D;color:#fff;border:none;border-radius:12px;padding:14px 28px;font:600 16px var(--font-hanken)")}>Conectar wallet</button>
        </div>
      </main>
    );
  }

  const { price, change, goldSpot } = useMarket();
  const P = prices(price);
  const pos = change >= 0;
  const changeStr = (pos ? "+" : "") + change.toFixed(2) + "%";
  const changeColor = pos ? ACCENT : "#D14343";
  let total = 0;
  ORDER.forEach((k) => (total += (app.balances[k] || 0) * P[k]));
  const openQty = app.balances[TK] || 0;
  const openVal = openQty * P[TK];
  const openCost = openQty * app.openAvg;
  const pnl = openVal - openCost;
  const pnlPct = openCost > 0 ? (pnl / openCost) * 100 : 0;
  const pnlPos = pnl >= 0;
  const pnlColor = pnlPos ? ACCENT : "#D14343";
  const hasOpen = openQty > 0 && app.openAvg > 0;
  const holdings = ORDER.filter((k) => (app.balances[k] || 0) > 0).map((k) => {
    const val = app.balances[k] * P[k];
    const pct = total > 0 ? (val / total) * 100 : 0;
    const showPnl = k === TK && app.openAvg > 0;
    return {
      ticker: k, name: assetMeta[k]?.name || k, color: assetMeta[k]?.color || "#C9A227", sym: assetMeta[k]?.sym || k[0],
      amount: fmtN(app.balances[k], k === "BTC" ? 4 : 2) + " " + k,
      value: fmtUSD(val), pct: pct.toFixed(1) + "%", width: pct.toFixed(1) + "%",
      showPnl, pnlStr: showPnl ? (pnl >= 0 ? "+" : "") + fmtUSD(pnl) + " (" + (pnl >= 0 ? "+" : "") + pnlPct.toFixed(1) + "%)" : "",
    };
  });

  return (
    <main style={css("max-width:1100px;margin:0 auto;padding:40px 24px")}>
      <div style={css("display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:16px;margin-bottom:28px")}>
        <div>
          <div style={css("display:flex;align-items:center;gap:10px;margin-bottom:10px")}>
            <h2 style={css("font:600 26px var(--font-hanken);letter-spacing:-0.03em;margin:0")}>Mi cartera</h2>
            <span style={css("font:500 12px var(--font-mono);color:#6B6B76;background:#F4F4F5;padding:5px 10px;border-radius:999px")}>{app.address}</span>
            <button onClick={app.disconnect} style={css("appearance:none;border:none;background:none;cursor:pointer;font:500 13px var(--font-hanken);color:#D14343")}>Desconectar</button>
          </div>
          <div style={css("font:500 13px var(--font-hanken);color:#8A8A94")}>Valor total</div>
          <div style={css("display:flex;align-items:baseline;gap:12px")}><span style={css("font:600 42px var(--font-mono);letter-spacing:-0.03em")}>{fmtUSD(total)}</span><span style={{ ...css("font:600 16px var(--font-mono)"), color: changeColor }}>{changeStr}</span></div>
          {hasOpen && (
            <div style={css("display:flex;align-items:center;gap:14px;margin-top:10px;flex-wrap:wrap")}>
              <span style={css("display:inline-flex;align-items:center;gap:7px;background:#F7F7F8;border-radius:999px;padding:6px 12px")}>
                <span style={css("font:500 12px var(--font-hanken);color:#8A8A94")}>Rendimiento {TOKEN_SYMBOL}</span>
                <span style={{ ...css("font:600 13px var(--font-mono)"), color: pnlColor }}>{(pnlPos ? "+" : "") + fmtUSD(pnl)}</span>
                <span style={{ ...css("font:600 12px var(--font-mono)"), color: pnlColor }}>{(pnlPos ? "+" : "") + pnlPct.toFixed(2) + "%"}</span>
              </span>
              <span style={css("font:400 12px var(--font-hanken);color:#A8A8AE")}>Oro spot {fmtUSD(goldSpot)}/oz</span>
            </div>
          )}
        </div>
        <div style={css("display:flex;gap:10px")}>
          <button onClick={() => router.push("/comprar")} style={css("appearance:none;cursor:pointer;background:#0D0D0D;color:#fff;border:none;border-radius:12px;padding:12px 22px;font:600 15px var(--font-hanken)")}>Comprar</button>
          <button onClick={() => router.push("/swap")} style={css("appearance:none;cursor:pointer;background:#fff;color:#0D0D0D;border:1px solid #DADADD;border-radius:12px;padding:12px 22px;font:600 15px var(--font-hanken)")}>Swap</button>
        </div>
      </div>
      <div data-2col style={css("display:grid;grid-template-columns:1.4fr 1fr;gap:24px;align-items:start")}>
        <div style={css("background:#fff;border:1px solid #ECECEC;border-radius:20px;overflow:hidden")}>
          <div style={css("padding:18px 22px;border-bottom:1px solid #F0F0F1;font:600 16px var(--font-hanken)")}>Tus activos</div>
          {holdings.map((h) => (
            <div key={h.ticker} style={css("padding:16px 22px;border-bottom:1px solid #F4F4F5;display:flex;align-items:center;gap:14px")}>
              <span style={{ ...css("flex:none;width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font:600 13px var(--font-mono)"), background: h.color }}>{h.sym}</span>
              <div style={css("flex:1")}>
                <div style={css("font:600 15px var(--font-hanken)")}>{h.name}</div>
                <div style={css("font:400 13px var(--font-mono);color:#8A8A94")}>{h.amount}</div>
                <div style={css("height:4px;background:#F0F0F1;border-radius:2px;margin-top:8px;overflow:hidden")}><div style={{ height: "100%", width: h.width, background: h.color }} /></div>
              </div>
              <div style={css("text-align:right")}>
                <div style={css("font:600 15px var(--font-mono)")}>{h.value}</div>
                <div style={css("font:400 12px var(--font-mono);color:#8A8A94")}>{h.pct}</div>
                {h.showPnl && <div style={{ ...css("font:600 11px var(--font-mono);margin-top:3px"), color: pnlColor }}>{h.pnlStr}</div>}
              </div>
            </div>
          ))}
        </div>
        <div style={css("background:#fff;border:1px solid #ECECEC;border-radius:20px;overflow:hidden")}>
          <div style={css("padding:18px 22px;border-bottom:1px solid #F0F0F1;font:600 16px var(--font-hanken)")}>Movimientos</div>
          {app.txs.length > 0 ? (
            app.txs.map((t, i) => (
              <div key={i} style={css("padding:15px 22px;border-bottom:1px solid #F4F4F5;display:flex;align-items:center;gap:12px")}>
                <span style={{ ...css("flex:none;width:32px;height:32px;border-radius:9px;display:flex;align-items:center;justify-content:center;font-size:15px"), background: "color-mix(in srgb, var(--accent) 14%, #fff)", color: ACCENT }}>↗</span>
                <div style={css("flex:1")}><div style={css("font:600 14px var(--font-hanken)")}>{t.type}</div><div style={css("font:400 12px var(--font-mono);color:#8A8A94")}>{t.sub}</div></div>
                <div style={css("text-align:right")}><div style={{ ...css("font:600 14px var(--font-mono)"), color: ACCENT }}>{t.main}</div><div style={css("font:400 11px var(--font-mono);color:#A8A8AE")}>{t.time}</div></div>
              </div>
            ))
          ) : (
            <div style={css("padding:48px 22px;text-align:center;font:400 14px var(--font-hanken);color:#A8A8AE")}>Aún no hay movimientos.<br />Compra o intercambia {TOKEN_SYMBOL} para empezar.</div>
          )}
        </div>
      </div>
    </main>
  );
}
