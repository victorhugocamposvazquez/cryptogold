"use client";

import { useRouter } from "next/navigation";
import { css } from "@/lib/css";
import { ACCENT } from "@/lib/format";
import { TOKEN_SYMBOL } from "@/lib/brand";
import { useApp } from "@/lib/store";
import { useMarket } from "@/lib/market";
import { Hov } from "./ui";
import { walletDefs } from "@/lib/content";

const OVERLAY = "position:fixed;inset:0;z-index:1000;background:rgba(13,13,13,0.42);backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px);display:flex;align-items:center;justify-content:center;padding:24px;animation:ov .18s ease";

const overlayProps = { "data-modal-overlay": true };
const panelProps = { "data-modal-panel": true };

export function WalletModal() {
  const app = useApp();
  if (!app.walletOpen) return null;
  return (
    <div onClick={app.closeWallet} {...overlayProps} style={css(OVERLAY)}>
      <div onClick={(e) => e.stopPropagation()} {...panelProps} style={css("width:400px;max-width:100%;background:#fff;border-radius:22px;padding:24px;animation:pop .22s cubic-bezier(.2,.7,.2,1)")}>
        <div style={css("display:flex;justify-content:space-between;align-items:center;margin-bottom:6px")}>
          <h3 style={css("font:600 20px var(--font-hanken);letter-spacing:-0.02em;margin:0")}>Conectar wallet</h3>
          <button onClick={app.closeWallet} style={css("appearance:none;border:none;background:#F4F4F5;width:30px;height:30px;border-radius:50%;cursor:pointer;color:#6B6B76;font-size:16px")}>×</button>
        </div>
        <p style={css("font:400 14px var(--font-hanken);color:#6B6B76;margin:0 0 18px")}>Elige tu wallet para conectarte de forma segura.</p>
        <div style={css("display:flex;flex-direction:column;gap:8px")}>
          {walletDefs.map(([name, sub, color, sym]) => (
            <Hov key={name} as="button" onClick={() => app.connect(name)} style="appearance:none;cursor:pointer;display:flex;align-items:center;gap:14px;width:100%;background:#fff;border:1px solid #ECECEC;border-radius:14px;padding:14px 16px;text-align:left" hover="border-color:#0D0D0D;background:#FAFAFA">
              <span style={{ ...css("flex:none;width:38px;height:38px;border-radius:10px;display:flex;align-items:center;justify-content:center;color:#fff;font:700 16px var(--font-hanken)"), background: color }}>{sym}</span>
              <span style={css("flex:1")}>
                <span style={css("display:block;font:600 15px var(--font-hanken)")}>{name}</span>
                <span style={css("display:block;font:400 12px var(--font-hanken);color:#8A8A94")}>{sub}</span>
              </span>
              <span style={css("color:#C8C8CE;font-size:18px")}>›</span>
            </Hov>
          ))}
        </div>
        <div style={css("font:400 11px/1.5 var(--font-mono);color:#B0B0B6;margin-top:16px;text-align:center")}>Conexión simulada · demo de diseño</div>
      </div>
    </div>
  );
}

export function ProviderModal() {
  const app = useApp();
  const { price } = useMarket();
  if (!app.providerOpen) return null;
  const P: Record<string, number> = { EUR: 1.08, USD: 1, [TOKEN_SYMBOL]: price };
  const amt = parseFloat(app.payAmount) || 0;
  const provName = app.provider === "moonpay" ? "MoonPay" : "Transak";
  const provColor = app.provider === "moonpay" ? "#7A4DFF" : "#1A6BF2";
  const provInitial = app.provider === "moonpay" ? "M" : "T";
  const rate = app.provider === "moonpay" ? 0.019 : 0.015;
  const cardSym = app.cardCur === "EUR" ? "€" : "$";
  const usd = amt * P[app.cardCur];
  const open = (usd * (1 - rate)) / price;
  const amountStr = amt.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " " + cardSym;
  const dg = app.cardNumber.replace(/\D/g, "");
  const cardBrand = /^4/.test(dg) ? "VISA" : /^(5|2)/.test(dg) ? "MASTERCARD" : /^3[47]/.test(dg) ? "AMEX" : "";
  const inp = "width:100%;border:1px solid #E6E6E8;border-radius:12px;padding:14px 16px;font:500 16px var(--font-mono);color:#0D0D0D";

  return (
    <div onClick={app.closeProvider} {...overlayProps} style={css(OVERLAY.replace("z-index:1000", "z-index:1000"))}>
      <div onClick={(e) => e.stopPropagation()} {...panelProps} style={css("width:420px;max-width:100%;background:#fff;border-radius:22px;overflow:hidden;animation:pop .22s cubic-bezier(.2,.7,.2,1)")}>
        <div style={{ ...css("padding:18px 22px;display:flex;align-items:center;justify-content:space-between"), background: provColor }}>
          <div style={css("display:flex;align-items:center;gap:10px")}>
            <span style={css("width:30px;height:30px;border-radius:8px;background:rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;color:#fff;font:700 15px var(--font-hanken)")}>{provInitial}</span>
            <span style={css("font:700 17px var(--font-hanken);color:#fff;letter-spacing:-0.02em")}>{provName}</span>
          </div>
          <button onClick={app.closeProvider} style={css("appearance:none;border:none;background:rgba(255,255,255,0.2);width:28px;height:28px;border-radius:50%;cursor:pointer;color:#fff;font-size:15px")}>×</button>
        </div>
        <div style={css("padding:22px")}>
          <div style={css("display:flex;justify-content:space-between;align-items:center;background:#F7F7F8;border-radius:12px;padding:14px 16px;margin-bottom:18px")}>
            <div><div style={css("font:500 11px var(--font-hanken);color:#8A8A94")}>Pagas</div><div style={css("font:600 18px var(--font-mono)")}>{amountStr}</div></div>
            <span style={css("color:#C8C8CE")}>→</span>
            <div style={css("text-align:right")}><div style={css("font:500 11px var(--font-hanken);color:#8A8A94")}>Recibes</div><div style={{ ...css("font:600 18px var(--font-mono)"), color: ACCENT }}>{open.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {TOKEN_SYMBOL}</div></div>
          </div>
          <div style={css("display:flex;flex-direction:column;gap:10px")}>
            <div style={css("position:relative")}>
              <input value={app.cardNumber} onChange={(e) => app.onCardNumber(e.target.value)} inputMode="numeric" placeholder="1234 5678 9012 3456" style={{ ...css(inp), padding: "14px 70px 14px 16px" }} />
              <span style={css("position:absolute;right:14px;top:50%;transform:translateY(-50%);font:700 11px var(--font-mono);color:#8A8A94;letter-spacing:0.04em")}>{cardBrand}</span>
            </div>
            <div style={css("display:flex;gap:10px")}>
              <input value={app.cardExp} onChange={(e) => app.onCardExp(e.target.value)} inputMode="numeric" placeholder="MM/AA" style={{ ...css(inp), flex: 1 }} />
              <input value={app.cardCvc} onChange={(e) => app.onCardCvc(e.target.value)} inputMode="numeric" placeholder="CVC" style={{ ...css(inp), flex: 1 }} />
            </div>
            <input value={app.cardName} onChange={(e) => app.onCardName(e.target.value)} placeholder="Nombre del titular" style={css("width:100%;border:1px solid #E6E6E8;border-radius:12px;padding:14px 16px;font:500 15px var(--font-hanken);color:#0D0D0D")} />
          </div>
          <button onClick={app.confirmProvider} style={css("width:100%;appearance:none;cursor:pointer;background:#0D0D0D;color:#fff;border:none;border-radius:12px;padding:15px;font:600 16px var(--font-hanken);margin-top:16px")}>
            {app.processing ? "Procesando…" : "Pagar " + amountStr}
          </button>
          <div style={css("display:flex;align-items:center;justify-content:center;gap:8px;margin-top:14px;font:400 11px var(--font-hanken);color:#A8A8AE")}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#A8A8AE" strokeWidth="2"><rect x="4" y="10" width="16" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></svg>
            Pago cifrado vía {provName} · demo
          </div>
        </div>
      </div>
    </div>
  );
}

export function SuccessModal() {
  const app = useApp();
  const router = useRouter();
  if (!app.successOpen || !app.successTx) return null;
  const t = app.successTx;
  const toPortfolio = () => { app.closeSuccess(); router.push("/cartera"); };
  const row = (label: string, val: string, mono?: boolean) => (
    <div style={css("display:flex;justify-content:space-between;font:400 13px var(--font-hanken);color:#6B6B76")}>
      <span>{label}</span>
      <span style={mono ? css("font-family:var(--font-mono);color:#0D0D0D") : css("color:#0D0D0D")}>{val}</span>
    </div>
  );
  return (
    <div onClick={app.closeSuccess} {...overlayProps} style={css(OVERLAY.replace("z-index:1000", "z-index:1050"))}>
      <div onClick={(e) => e.stopPropagation()} {...panelProps} style={css("width:420px;max-width:100%;background:#fff;border-radius:22px;padding:26px;animation:pop .22s cubic-bezier(.2,.7,.2,1)")}>
        <div style={css("display:flex;flex-direction:column;align-items:center;text-align:center;margin-bottom:20px")}>
          <span style={{ ...css("width:56px;height:56px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:26px;margin-bottom:14px"), background: "color-mix(in srgb, var(--accent) 13%, #fff)", color: ACCENT }}>✓</span>
          <div style={css("font:600 22px var(--font-hanken);letter-spacing:-0.02em;margin-bottom:4px")}>¡Operación completada!</div>
          <div style={css("font:400 14px var(--font-hanken);color:#6B6B76")}>Has recibido <span style={css("font-family:var(--font-mono);color:#0D0D0D;font-weight:600")}>{t.openStr} {TOKEN_SYMBOL}</span> en tu wallet.</div>
        </div>
        <div style={css("background:#F7F7F8;border-radius:14px;padding:16px 18px;display:flex;flex-direction:column;gap:10px;margin-bottom:18px")}>
          {row("Operación", t.id, true)}
          {row("Tipo", t.type)}
          {row("Pagado", t.payLabel)}
          {row("Precio", t.rate, true)}
          {row("Comisión", t.fee, true)}
          {row("Fecha", t.date)}
        </div>
        <div style={css("display:flex;gap:10px")}>
          <Hov as="button" onClick={app.downloadReceipt} style="flex:none;appearance:none;cursor:pointer;background:#fff;color:#0D0D0D;border:1px solid #DADADD;border-radius:12px;padding:13px 16px;font:600 14px var(--font-hanken)" hover="border-color:#0D0D0D">Recibo</Hov>
          <button onClick={toPortfolio} style={css("flex:1;appearance:none;cursor:pointer;background:#0D0D0D;color:#fff;border:none;border-radius:12px;padding:13px;font:600 15px var(--font-hanken)")}>Ver en cartera</button>
        </div>
      </div>
    </div>
  );
}

export function Toast() {
  const app = useApp();
  if (!app.toast) return null;
  return (
    <div data-toast style={css("position:fixed;bottom:28px;left:50%;z-index:1100;transform:translateX(-50%);background:#0D0D0D;color:#fff;padding:13px 22px;border-radius:999px;font:600 14px var(--font-hanken);box-shadow:0 12px 30px -8px rgba(0,0,0,0.4);animation:tin .25s cubic-bezier(.2,.7,.2,1);display:flex;align-items:center;gap:10px;white-space:nowrap")}>
      <span style={css("width:7px;height:7px;border-radius:50%;background:" + ACCENT)} />
      {app.toast}
    </div>
  );
}
