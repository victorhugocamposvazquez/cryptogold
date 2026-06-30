"use client";

import { css } from "@/lib/css";
import { fmtUSD, fmtN, ACCENT } from "@/lib/format";
import { TOKEN_SYMBOL } from "@/lib/brand";
import { useApp, prices } from "@/lib/store";
import { useMarket } from "@/lib/market";
import { Hov } from "../ui";

const TK = TOKEN_SYMBOL;
const segStyle = (active: boolean) =>
  "appearance:none;cursor:pointer;border:1px solid " + (active ? "#0D0D0D" : "#E6E6E8") + ";background:" + (active ? "#0D0D0D" : "#fff") + ";color:" + (active ? "#fff" : "#5C5C66") + ";border-radius:10px;padding:9px 0;font:600 13px var(--font-mono)";

export default function Swap() {
  const app = useApp();
  const { price } = useMarket();
  const P = prices(price);
  const fromAmt = parseFloat(app.fromAmount) || 0;
  const side = app.swapSide;
  const token = app.fromAsset;
  const payToken = side === "toOpen" ? token : TK;
  const recvToken = side === "toOpen" ? TK : token;
  const payDec = payToken === "BTC" ? 5 : payToken === TK ? 2 : 4;
  const recvDec = recvToken === "BTC" ? 5 : recvToken === TK ? 2 : 4;
  const swapUsd = fromAmt * P[payToken];
  const swapRecv = (swapUsd * 0.997) / P[recvToken];
  const payBal = app.balances[payToken] || 0;
  const insufficient = app.connected && fromAmt > payBal;
  const disabled = app.processing || insufficient;
  const btnLabel = app.processing ? "Procesando…" : insufficient ? "Saldo insuficiente" : app.connected ? (side === "toOpen" ? "Intercambiar" : "Vender " + TK) : "Conectar wallet para intercambiar";
  const payBalance = app.connected ? fmtN(payBal, payDec) + " " + payToken : null;

  return (
    <main style={css("padding:48px 24px;display:flex;justify-content:center")}>
      <div style={css("width:460px;max-width:100%")}>
        <h2 style={css("font:600 30px var(--font-hanken);letter-spacing:-0.03em;margin:0 0 6px")}>Intercambiar</h2>
        <p style={css("font:400 15px var(--font-hanken);color:#6B6B76;margin:0 0 24px")}>Cambia USDT, ETH o BTC por {TK} — o vende tus {TK} — al instante.</p>
        <div style={css("background:#fff;border:1px solid #ECECEC;border-radius:20px;padding:22px;box-shadow:0 20px 50px -30px rgba(154,123,10,0.12)")}>
          <div style={css("background:#F7F7F8;border-radius:14px;padding:16px")}>
            <div style={css("display:flex;justify-content:space-between;align-items:center;margin-bottom:8px")}>
              <span style={css("font:500 12px var(--font-hanken);color:#8A8A94")}>{side === "toOpen" ? "Pagas" : "Vendes"}</span>
              {payBalance && (
                <span style={css("font:500 12px var(--font-mono);color:#8A8A94")}>Saldo: {payBalance} <button onClick={app.maxFrom} style={{ ...css("appearance:none;border:none;background:none;cursor:pointer;font:600 12px var(--font-mono)"), color: ACCENT }}>MÁX</button></span>
              )}
            </div>
            <div style={css("display:flex;align-items:center;gap:10px")}>
              <input value={app.fromAmount} onChange={(e) => app.setFromAmount(e.target.value)} onKeyDown={(e) => e.key === "Enter" && app.swap()} inputMode="decimal" placeholder="0" style={css("flex:1;border:none;background:transparent;font:600 30px var(--font-mono);color:#0D0D0D;width:100%;padding:0")} />
              <span style={css("flex:none;background:#fff;border:1px solid #E6E6E8;border-radius:999px;padding:7px 14px;font:600 14px var(--font-mono)")}>{payToken}</span>
            </div>
          </div>
          <div style={css("display:flex;justify-content:center;margin:-10px 0;position:relative;z-index:2")}>
            <Hov as="button" onClick={app.flipSwap} title="Invertir dirección" style="appearance:none;cursor:pointer;width:38px;height:38px;border-radius:50%;background:#fff;border:1px solid #ECECEC;display:flex;align-items:center;justify-content:center;color:#0D0D0D;font-size:16px;box-shadow:0 2px 8px rgba(0,0,0,0.06)" hover="border-color:#C9A227;color:var(--accent,#C9A227)">⇅</Hov>
          </div>
          <div style={{ ...css("border-radius:14px;padding:16px"), background: "color-mix(in srgb, var(--accent) 12%, #fff)" }}>
            <div style={css("font:500 12px var(--font-hanken);color:#8A8A94;margin-bottom:8px")}>Recibes (aprox.)</div>
            <div style={css("display:flex;align-items:center;gap:10px")}>
              <span style={{ ...css("flex:1;font:600 30px var(--font-mono)"), color: ACCENT }}>{fmtN(swapRecv, recvDec)}</span>
              <span style={css("flex:none;background:#fff;border:1px solid #E6E6E8;border-radius:999px;padding:7px 14px;font:600 14px var(--font-mono)")}>{recvToken}</span>
            </div>
          </div>
          <div style={css("margin-top:16px")}>
            <div style={css("font:500 12px var(--font-hanken);color:#8A8A94;margin-bottom:8px")}>Token a intercambiar</div>
            <div style={css("display:grid;grid-template-columns:repeat(4,1fr);gap:6px")}>
              {["USDT", "ETH", "USDC", "BTC"].map((k) => (
                <button key={k} onClick={() => app.setFrom(k)} style={css(segStyle(app.fromAsset === k))}>{k}</button>
              ))}
            </div>
          </div>
          {insufficient && (
            <div style={css("display:flex;align-items:center;gap:7px;margin-top:12px;font:500 13px var(--font-hanken);color:#D14343")}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D14343" strokeWidth="2"><circle cx="12" cy="12" r="9" /><path d="M12 8v4M12 16h.01" /></svg>Saldo insuficiente de {payToken}
            </div>
          )}
          <div style={css("display:flex;align-items:center;justify-content:space-between;margin-top:16px")}>
            <span style={css("display:inline-flex;align-items:center;gap:6px;font:400 13px var(--font-hanken);color:#6B6B76")}>Slippage <span title="Variación máxima de precio aceptada." style={css("display:inline-flex;width:15px;height:15px;border-radius:50%;background:#E6E6E8;color:#8A8A94;align-items:center;justify-content:center;font:600 10px var(--font-mono);cursor:help")}>?</span></span>
            <div style={css("display:flex;gap:6px")}>
              {[0.1, 0.5, 1.0].map((v) => {
                const active = app.slippage === v;
                return (
                  <button key={v} onClick={() => app.setSlip(v)} style={{ ...css("appearance:none;cursor:pointer;border-radius:999px;padding:6px 14px;font:600 12px var(--font-mono)"), border: "1px solid " + (active ? "#0D0D0D" : "#E6E6E8"), background: active ? "#0D0D0D" : "#fff", color: active ? "#fff" : "#5C5C66" }}>{v}%</button>
                );
              })}
            </div>
          </div>
          <div style={css("margin-top:14px;display:flex;flex-direction:column;gap:10px")}>
            {[["Tipo de cambio", "1 " + payToken + " = " + fmtN(P[payToken] / P[recvToken], recvToken === TK ? 2 : 6) + " " + recvToken], ["Comisión (0.3%)", fmtUSD(swapUsd * 0.003)], ["Mínimo recibido", fmtN(swapRecv * (1 - app.slippage / 100), recvDec) + " " + recvToken]].map(([l, v], i) => (
              <div key={i} style={css("display:flex;justify-content:space-between;font:400 13px var(--font-hanken);color:#6B6B76")}><span>{l}</span><span style={css("font-family:var(--font-mono);color:#0D0D0D")}>{v}</span></div>
            ))}
          </div>
          <button onClick={app.swap} disabled={disabled} style={{ ...css("width:100%;appearance:none;color:#fff;border:none;border-radius:12px;padding:15px;font:600 16px var(--font-hanken);margin-top:20px"), cursor: disabled ? "not-allowed" : "pointer", background: disabled ? "#C8C8CE" : "#0D0D0D" }}>{btnLabel}</button>
        </div>
      </div>
    </main>
  );
}
