"use client";

import { css } from "@/lib/css";
import { fmtUSD, fmtN, ACCENT } from "@/lib/format";
import { TOKEN_SYMBOL } from "@/lib/brand";
import { useApp, prices } from "@/lib/store";
import { useMarket } from "@/lib/market";
import { Hov } from "../ui";
import { provDefs } from "@/lib/content";

const segStyle = (active: boolean) =>
  "appearance:none;cursor:pointer;border:1px solid " + (active ? "#0D0D0D" : "#E6E6E8") + ";background:" + (active ? "#0D0D0D" : "#fff") + ";color:" + (active ? "#fff" : "#5C5C66") + ";border-radius:10px;padding:9px 0;font:600 13px var(--font-mono)";
const tabStyle = (active: boolean) =>
  "appearance:none;cursor:pointer;border:none;background:" + (active ? "#fff" : "transparent") + ";color:" + (active ? "#0D0D0D" : "#8A8A94") + ";box-shadow:" + (active ? "0 1px 3px rgba(0,0,0,0.08)" : "none") + ";font:600 14px var(--font-hanken);padding:9px 0;border-radius:9px";
const ccStyle = (active: boolean) =>
  "appearance:none;cursor:pointer;border:1px solid " + (active ? "#0D0D0D" : "#E6E6E8") + ";background:" + (active ? "#0D0D0D" : "#fff") + ";color:" + (active ? "#fff" : "#5C5C66") + ";border-radius:999px;padding:5px 12px;font:600 11px var(--font-mono)";

export default function Buy() {
  const app = useApp();
  const { price } = useMarket();
  const P = prices(price);
  const isCard = app.buyMethod === "card";
  const payAmt = parseFloat(app.payAmount) || 0;
  const cardSym = app.cardCur === "EUR" ? "€" : "$";
  const provName = app.provider === "moonpay" ? "MoonPay" : "Transak";
  const buyUsd = isCard ? payAmt * P[app.cardCur] : payAmt * P[app.payAsset];
  const buyFeeRate = isCard ? (app.provider === "moonpay" ? 0.019 : 0.015) : 0.01;
  const buyOpen = (buyUsd * (1 - buyFeeRate)) / P[TOKEN_SYMBOL];
  const qa = isCard
    ? [100, 500, 1000, 5000, 10000, 20000]
    : app.payAsset === "ETH"
    ? [0.5, 1, 2]
    : app.payAsset === "BTC"
    ? [0.05, 0.1, 0.25]
    : [100, 500, 1000, 5000, 10000, 20000];
  const payBalance = !isCard && app.connected ? fmtN(app.balances[app.payAsset] || 0, app.payAsset === "BTC" ? 4 : 2) + " " + app.payAsset : null;
  const buyInsufficient = app.connected && !isCard && payAmt > (app.balances[app.payAsset] || 0);
  const buyDisabled = app.processing || buyInsufficient;
  const buyBtnLabel = app.processing ? "Procesando…" : buyInsufficient ? "Saldo insuficiente" : isCard ? "Continuar con " + provName : app.connected ? "Comprar " + TOKEN_SYMBOL : "Conectar wallet para comprar";
  const buyTotal = isCard ? fmtN(payAmt, 2) + " " + cardSym : fmtN(payAmt, app.payAsset === "BTC" ? 5 : 2) + " " + app.payAsset;
  const secureText = "Pago securizado vía " + provName + " · Visa, Mastercard y Amex";

  return (
    <main data-buy-main style={css("padding:48px 24px;display:flex;justify-content:center")}>
      <div style={css("width:460px;max-width:100%")}>
        <h2 style={css("font:600 30px var(--font-hanken);letter-spacing:-0.03em;margin:0 0 6px")}>Comprar {TOKEN_SYMBOL}</h2>
        <p style={css("font:400 15px var(--font-hanken);color:#6B6B76;margin:0 0 24px")}>USDT, cripto o tarjeta. Liquidación instantánea vía CRYPTOHOST.</p>
        <div style={css("background:#fff;border:1px solid #ECECEC;border-radius:20px;padding:22px;box-shadow:0 20px 50px -30px rgba(13,13,13,0.18)")}>
          <div style={css("display:grid;grid-template-columns:1fr 1fr;gap:6px;background:#F4F4F5;padding:4px;border-radius:12px;margin-bottom:18px")}>
            {(["card", "crypto"] as const).map((k) => (
              <button key={k} onClick={() => app.setBuyMethod(k)} style={css(tabStyle(app.buyMethod === k))}>{k === "card" ? "Tarjeta" : "Cripto / saldo"}</button>
            ))}
          </div>

          {isCard ? (
            <>
              <div style={css("background:#F7F7F8;border-radius:14px;padding:16px 16px 14px")}>
                <div style={css("display:flex;justify-content:space-between;align-items:center;margin-bottom:8px")}>
                  <span style={css("font:500 12px var(--font-hanken);color:#8A8A94")}>Pagas</span>
                  <div style={css("display:flex;gap:4px")}>
                    {["EUR", "USD"].map((k) => (
                      <button key={k} onClick={() => app.setCardCur(k)} style={css(ccStyle(app.cardCur === k))}>{k}</button>
                    ))}
                  </div>
                </div>
                <div style={css("display:flex;align-items:center;gap:10px")}>
                  <input value={app.payAmount} onChange={(e) => app.setPayAmount(e.target.value)} inputMode="decimal" style={css("flex:1;border:none;background:transparent;font:600 30px var(--font-mono);color:#0D0D0D;width:100%;padding:0")} />
                  <span style={css("flex:none;background:#fff;border:1px solid #E6E6E8;border-radius:999px;padding:7px 14px;font:600 14px var(--font-mono)")}>{app.cardCur}</span>
                </div>
              </div>
              <div style={css("display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:12px")}>
                {qa.map((v) => (
                  <Hov key={v} as="button" onClick={() => app.setQuick(v)} style="appearance:none;cursor:pointer;background:#fff;border:1px solid #E6E6E8;border-radius:999px;padding:8px;font:500 13px var(--font-mono);color:#5C5C66" hover="border-color:#0D0D0D">{v}</Hov>
                ))}
              </div>
              <div style={css("font:500 12px var(--font-hanken);color:#8A8A94;margin:16px 0 8px")}>Procesar con</div>
              <div style={css("display:flex;flex-direction:column;gap:8px")}>
                {provDefs.map(([k, name, sub, color, sym, feeLabel]) => {
                  const sel = app.provider === k;
                  return (
                    <button key={k} onClick={() => app.setProvider(k)} style={{ ...css("appearance:none;cursor:pointer;display:flex;align-items:center;gap:12px;width:100%;background:#fff;border-radius:14px;padding:12px 14px"), border: "1px solid " + (sel ? "#0D0D0D" : "#E6E6E8") }}>
                      <span style={{ ...css("flex:none;width:34px;height:34px;border-radius:9px;display:flex;align-items:center;justify-content:center;color:#fff;font:700 15px var(--font-hanken)"), background: color }}>{sym}</span>
                      <span style={css("flex:1;text-align:left")}>
                        <span style={css("display:block;font:600 14px var(--font-hanken);color:#0D0D0D")}>{name}</span>
                        <span style={css("display:block;font:400 11px var(--font-hanken);color:#8A8A94")}>{sub}</span>
                      </span>
                      <span style={css("font:600 12px var(--font-mono);color:#8A8A94")}>{feeLabel}</span>
                      <span style={{ ...css("flex:none;width:18px;height:18px;border-radius:50%;box-sizing:border-box"), border: sel ? "5px solid #0D0D0D" : "2px solid #D8D8DC" }} />
                    </button>
                  );
                })}
              </div>
              <div style={css("display:flex;align-items:center;gap:8px;margin-top:12px;font:400 12px var(--font-hanken);color:#A8A8AE")}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#A8A8AE" strokeWidth="2"><rect x="4" y="10" width="16" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></svg>
                {secureText}
              </div>
            </>
          ) : (
            <>
              <div style={css("display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-bottom:14px")}>
                {["USDT", "USDC", "ETH", "BTC"].map((k) => (
                  <button key={k} onClick={() => app.setPay(k)} style={css(segStyle(app.payAsset === k))}>{k}</button>
                ))}
              </div>
              <div style={css("background:#F7F7F8;border-radius:14px;padding:16px 16px 14px")}>
                <div style={css("display:flex;justify-content:space-between;align-items:center;margin-bottom:8px")}>
                  <span style={css("font:500 12px var(--font-hanken);color:#8A8A94")}>Pagas</span>
                  {payBalance && (
                    <span style={css("font:500 12px var(--font-mono);color:#8A8A94")}>Saldo: {payBalance} <button onClick={app.maxPay} style={{ ...css("appearance:none;border:none;background:none;cursor:pointer;font:600 12px var(--font-mono)"), color: ACCENT }}>MÁX</button></span>
                  )}
                </div>
                <div style={css("display:flex;align-items:center;gap:10px")}>
                  <input value={app.payAmount} onChange={(e) => app.setPayAmount(e.target.value)} onKeyDown={(e) => e.key === "Enter" && app.buy()} inputMode="decimal" style={css("flex:1;border:none;background:transparent;font:600 30px var(--font-mono);color:#0D0D0D;width:100%;padding:0")} />
                  <span style={css("flex:none;background:#fff;border:1px solid #E6E6E8;border-radius:999px;padding:7px 14px;font:600 14px var(--font-mono)")}>{app.payAsset}</span>
                </div>
              </div>
              <div style={css("display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:12px")}>
                {qa.map((v) => (
                  <Hov key={v} as="button" onClick={() => app.setQuick(v)} style="appearance:none;cursor:pointer;background:#fff;border:1px solid #E6E6E8;border-radius:999px;padding:8px;font:500 13px var(--font-mono);color:#5C5C66" hover="border-color:#0D0D0D">{v}</Hov>
                ))}
              </div>
            </>
          )}

          <div style={css("display:flex;justify-content:center;margin:14px 0")}><span style={css("width:34px;height:34px;border-radius:50%;background:#F0F0F1;display:flex;align-items:center;justify-content:center;color:#8A8A94;font-size:16px")}>↓</span></div>
          <div style={{ ...css("border-radius:14px;padding:16px"), background: "color-mix(in srgb, var(--accent) 8%, #fff)" }}>
            <div style={css("font:500 12px var(--font-hanken);color:#8A8A94;margin-bottom:8px")}>Recibes (aprox.)</div>
            <div style={css("display:flex;align-items:center;gap:10px")}>
              <span style={{ ...css("flex:1;font:600 30px var(--font-mono)"), color: ACCENT }}>{fmtN(buyOpen, 2)}</span>
              <span style={css("flex:none;background:#fff;border:1px solid #E6E6E8;border-radius:999px;padding:7px 14px;font:600 14px var(--font-mono)")}>{TOKEN_SYMBOL}</span>
            </div>
          </div>
          <div style={css("margin-top:18px;display:flex;flex-direction:column;gap:10px")}>
            {[["Precio", "1 " + TOKEN_SYMBOL + " = " + fmtUSD(price)], ["Comisión", fmtUSD(buyUsd * buyFeeRate)], ["Total a pagar", buyTotal]].map(([l, v], i) => (
              <div key={i} style={css("display:flex;justify-content:space-between;font:400 13px var(--font-hanken);color:#6B6B76")}><span>{l}</span><span style={css("font-family:var(--font-mono);color:#0D0D0D")}>{v}</span></div>
            ))}
          </div>
          {buyInsufficient && (
            <div style={css("display:flex;align-items:center;gap:7px;margin-top:14px;font:500 13px var(--font-hanken);color:#D14343")}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D14343" strokeWidth="2"><circle cx="12" cy="12" r="9" /><path d="M12 8v4M12 16h.01" /></svg>Saldo insuficiente de {app.payAsset}
            </div>
          )}
          <button onClick={app.buy} disabled={buyDisabled} style={{ ...css("width:100%;appearance:none;color:#fff;border:none;border-radius:12px;padding:15px;font:600 16px var(--font-hanken);margin-top:20px"), cursor: buyDisabled ? "not-allowed" : "pointer", background: buyDisabled ? "#C8C8CE" : "#0D0D0D" }}>{buyBtnLabel}</button>
        </div>
      </div>
    </main>
  );
}
