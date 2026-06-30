"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { css } from "@/lib/css";
import { fmtUSD, fmtN, ACCENT } from "@/lib/format";
import { TOKEN_SYMBOL, TOKEN_SUPPLY_LABEL, OZ_PER_TOKEN, CHAINS } from "@/lib/brand";
import { buildSeries } from "@/lib/series";
import { useMarket } from "@/lib/market";
import { useApp } from "@/lib/store";
import { Chart } from "../Chart";
import { Hov } from "../ui";
import { ecosystem, tokenWhy, steps, hubPos, hubMeta, faqDefs, tkSegs, chainCompare } from "@/lib/content";
import { ValueModel, InfraGrid, CryptohostSection, RoadmapSection, SupportBanner } from "../Phase2Sections";
import { STRUCTURED_BACKING_LABEL, CRYPTOHOST_TRANSFERS } from "@/lib/brand";
import type { CryptohostTransfer } from "@/lib/cryptohost/types";

const series = buildSeries();

function GoldAnchor() {
  const { goldSpot, goldChange, price } = useMarket();
  const pos = goldChange >= 0;
  const chStr = (pos ? "+" : "") + goldChange.toFixed(2) + "%";
  return (
    <section data-section-pad style={css("max-width:1200px;margin:0 auto;padding:24px 24px")}>
      <div data-gold-anchor style={css("background:linear-gradient(135deg,#0D0D0D 0%,#1A1508 50%,#0D0D0D 100%);border-radius:20px;padding:28px 32px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:24px;border:1px solid #2A2410")}>
        <div>
          <div style={css("display:flex;align-items:center;gap:8px;margin-bottom:8px")}>
            <span style={css("width:8px;height:8px;border-radius:50%;background:" + ACCENT)} />
            <span style={css("font:600 11px var(--font-mono);letter-spacing:0.08em;color:#C9A227;text-transform:uppercase")}>Anclaje en vivo al oro spot</span>
          </div>
          <div style={css("font:600 28px var(--font-hanken);letter-spacing:-0.03em;color:#fff;margin-bottom:6px")}>
            1 {TOKEN_SYMBOL} = {OZ_PER_TOKEN} oz troy de oro
          </div>
          <div style={css("font:400 14px var(--font-hanken);color:#A8A898")}>
            Precio spot XAU/USD · actualizado en tiempo real
          </div>
        </div>
        <div data-gold-prices style={css("display:flex;gap:20px;flex-wrap:wrap")}>
          <div style={css("text-align:center;min-width:120px")}>
            <div style={css("font:500 11px var(--font-mono);color:#8A8A80;text-transform:uppercase;margin-bottom:4px")}>Oro (XAU)</div>
            <div style={css("font:600 32px var(--font-mono);color:#E8D48B;letter-spacing:-0.02em")}>{fmtUSD(goldSpot)}</div>
            <div style={{ ...css("font:600 13px var(--font-mono)"), color: pos ? "#C9A227" : "#D14343" }}>{chStr} 24h</div>
          </div>
          <div data-gold-divider style={css("width:1px;background:#2A2410;align-self:stretch")} />
          <div style={css("text-align:center;min-width:120px")}>
            <div style={css("font:500 11px var(--font-mono);color:#8A8A80;text-transform:uppercase;margin-bottom:4px")}>{TOKEN_SYMBOL}</div>
            <div style={css("font:600 32px var(--font-mono);color:#fff;letter-spacing:-0.02em")}>{fmtUSD(price)}</div>
            <div style={css("font:400 12px var(--font-mono);color:#8A8A80")}>≈ {fmtUSD(goldSpot * OZ_PER_TOKEN)} ref.</div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Activity() {
  const { now } = useMarket();
  const [rows, setRows] = useState<CryptohostTransfer[]>([]);

  useEffect(() => {
    fetch("/api/cryptohost/history?limit=6&offset=0")
      .then((r) => r.json())
      .then((d) => setRows(d.transfers ?? []))
      .catch(() => {});
    const id = setInterval(() => {
      fetch("/api/cryptohost/history?limit=6&offset=0")
        .then((r) => r.json())
        .then((d) => setRows(d.transfers ?? []))
        .catch(() => {});
    }, 15000);
    return () => clearInterval(id);
  }, []);

  const relTime = (iso: string) => {
    const sec = Math.max(1, Math.round((now - new Date(iso).getTime()) / 1000));
    return sec < 60 ? "hace " + sec + " s" : "hace " + Math.floor(sec / 60) + " min";
  };

  const actionLabel = (kind: string) =>
    kind === "sell" ? "vendió" : kind === "swap" ? "intercambió" : "compró";

  return (
    <section style={css("max-width:1200px;margin:0 auto;padding:24px 24px")}>
      <div style={css("border:1px solid #ECECEC;border-radius:18px;padding:8px 8px 4px")}>
        <div style={css("display:flex;align-items:center;justify-content:space-between;padding:12px 14px 10px;flex-wrap:wrap;gap:6px")}>
          <div style={css("display:flex;align-items:center;gap:8px")}>
            <span style={css("width:7px;height:7px;border-radius:50%;background:" + ACCENT)} />
            <span style={css("font:600 13px var(--font-hanken);color:#0D0D0D")}>Liquidación CRYPTOHOST</span>
            <span style={css("font:400 12px var(--font-hanken);color:#9A9AA0")}>· transferencias en tiempo real</span>
          </div>
          <Link href="/cryptohost" style={css("font:500 11px var(--font-mono);color:#9A7B0A;text-decoration:none")}>
            en vivo · ver registro →
          </Link>
        </div>
        {rows.length === 0 && (
          <div style={css("padding:16px 14px;color:#9A9AA0;font:400 13px var(--font-hanken)")}>Sincronizando actividad…</div>
        )}
        {rows.map((t) => (
          <div key={t.id} style={css("display:flex;align-items:center;gap:12px;padding:9px 14px;border-top:1px solid #F4F4F5")}>
            <span style={css("flex:none;width:28px;height:28px;border-radius:8px;background:#F4F4F5;display:flex;align-items:center;justify-content:center;font:600 11px var(--font-mono);color:#8A8A94")}>
              {t.kind === "sell" ? "↘" : t.kind === "swap" ? "⇄" : "↗"}
            </span>
            <span data-activity-text style={css("flex:1;font:400 13px var(--font-hanken);color:#5C5C66")}>
              <span style={css("font-family:var(--font-mono);color:#9A7B0A;font-size:11px")}>{t.id}</span>
              {" · "}
              <span style={css("font-family:var(--font-mono);color:#0D0D0D")}>
                {t.wallet ? t.wallet.slice(0, 4) + "…" + t.wallet.slice(-4) : "0x…"}
              </span>{" "}
              {actionLabel(t.kind)}{" "}
              {t.receive_amount != null
                ? (t.receive_amount >= 1000 ? Math.round(t.receive_amount).toLocaleString("en-US") : t.receive_amount.toLocaleString("en-US", { maximumFractionDigits: 2 }))
                : "—"}{" "}
              {t.receive_asset === "CGOLD" ? TOKEN_SYMBOL : t.receive_asset}
            </span>
            <span data-activity-time style={css("font:400 11px var(--font-mono);color:#A8A8AE")}>{relTime(t.created_at)}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function Donut() {
  const C = 2 * Math.PI * 80;
  let acc = 0;
  const segs = tkSegs.map(([label, pct, color]) => {
    const seg = { label, pct: pct + "%", color, dash: ((C * pct) / 100).toFixed(2) + " " + C.toFixed(2), offset: ((-C * acc) / 100).toFixed(2) };
    acc += pct as number;
    return seg;
  });
  return (
    <section data-section-pad data-section-pad-lg style={css("max-width:1200px;margin:0 auto;padding:48px 24px")}>
      <div data-2col data-donut-box style={css("display:grid;grid-template-columns:0.9fr 1.1fr;gap:48px;align-items:center;background:#0D0D0D;border-radius:28px;padding:48px")}>
        <div style={css("display:flex;flex-direction:column;align-items:center")}>
          <div style={css("position:relative;width:220px;height:220px")}>
            <svg viewBox="0 0 200 200" width="220" height="220" style={{ transform: "rotate(-90deg)" }}>
              <circle cx="100" cy="100" r="80" fill="none" stroke="#1E1E1E" strokeWidth="26" />
              {segs.map((d, i) => (
                <circle key={i} cx="100" cy="100" r="80" fill="none" stroke={d.color} strokeWidth="26" strokeDasharray={d.dash} strokeDashoffset={d.offset} />
              ))}
            </svg>
            <div style={css("position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center")}>
              <span style={css("font:600 24px var(--font-mono);color:#E8D48B;letter-spacing:-0.02em")}>{TOKEN_SUPPLY_LABEL}</span>
              <span style={css("font:500 11px var(--font-mono);color:#8A8A94;text-transform:uppercase;letter-spacing:0.06em")}>{TOKEN_SYMBOL} total</span>
            </div>
          </div>
        </div>
        <div>
          <div style={{ ...css("font:600 13px var(--font-mono);letter-spacing:0.06em;text-transform:uppercase;margin-bottom:14px"), color: ACCENT }}>Tokenomics</div>
          <h2 data-h2 style={css("font:600 34px var(--font-hanken);letter-spacing:-0.035em;margin:0 0 14px;color:#fff")}>Oferta fija. Respaldo real. Sin quema.</h2>
          <p style={css("font:400 16px/1.55 var(--font-hanken);color:#B8B8BD;margin:0 0 22px;max-width:460px")}>
            Suministro total de {TOKEN_SUPPLY_LABEL} {TOKEN_SYMBOL}. No minable, no quemable. 70% para adquirentes, 20% stake estratégico del emisor y 10% liquidez operativa.
          </p>
          <div style={css("display:flex;flex-direction:column;gap:10px;margin-bottom:22px")}>
            {segs.map((d, i) => (
              <div key={i} style={css("display:flex;align-items:center;gap:12px")}>
                <span style={{ ...css("flex:none;width:11px;height:11px;border-radius:3px"), background: d.color }} />
                <span style={css("flex:1;font:500 14px var(--font-hanken);color:#E4E4E6")}>{d.label}</span>
                <span style={css("font:600 14px var(--font-mono);color:#fff")}>{d.pct}</span>
              </div>
            ))}
          </div>
          <div style={css("display:inline-flex;align-items:center;gap:10px;background:#1A1508;border:1px solid #3A3010;border-radius:12px;padding:12px 16px")}>
            <span style={{ ...css("font:600 22px var(--font-mono)"), color: ACCENT }}>0,001 oz</span>
            <span style={css("font:400 13px/1.4 var(--font-hanken);color:#B8B8BD;max-width:240px")}>de oro de referencia por cada token {TOKEN_SYMBOL}</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function ChainTable() {
  const { cols, rows } = chainCompare;
  return (
    <section style={css("max-width:1200px;margin:0 auto;padding:48px 24px")}>
      <div style={{ ...css("font:600 13px var(--font-mono);letter-spacing:0.06em;text-transform:uppercase;margin-bottom:14px"), color: ACCENT }}>Infraestructura multi-chain</div>
      <h2 style={css("font:600 34px var(--font-hanken);letter-spacing:-0.035em;margin:0 0 12px")}>{chainCompare.title}</h2>
      <p style={css("font:400 16px var(--font-hanken);color:#6B6B76;margin:0 0 28px;max-width:640px")}>
        Lanzamiento principal en BNB Chain: máxima base de usuarios, costes predecibles y compatibilidad EVM. Expansión progresiva a {CHAINS.slice(2).join(", ")}.
      </p>
      <div data-chain-table style={css("border:1px solid #ECECEC;border-radius:18px;overflow:hidden")}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
          <thead>
            <tr style={{ background: "#F7F7F8" }}>
              {cols.map((c, i) => (
                <th key={i} style={{ padding: "14px 18px", textAlign: i === 0 ? "left" : "center", font: "600 13px var(--font-hanken)", color: i === 1 ? "#9A7B0A" : "#0D0D0D", borderBottom: "1px solid #ECECEC" }}>{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr key={ri} style={{ borderBottom: ri < rows.length - 1 ? "1px solid #F0F0F1" : undefined }}>
                {row.map((cell, ci) => (
                  <td key={ci} style={{ padding: "14px 18px", textAlign: ci === 0 ? "left" : "center", font: ci === 0 ? "600 13px var(--font-hanken)" : "400 13px var(--font-hanken)", color: ci === 0 ? "#0D0D0D" : "#5C5C66", background: ci === 1 ? "color-mix(in srgb, var(--accent) 5%, #fff)" : "#fff" }}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function Faq() {
  const [open, setOpen] = useState(0);
  return (
    <section style={css("max-width:1200px;margin:0 auto;padding:48px 24px")}>
      <div data-2col style={css("display:grid;grid-template-columns:0.85fr 1.15fr;gap:48px;align-items:start")}>
        <div>
          <div style={{ ...css("font:600 13px var(--font-mono);letter-spacing:0.06em;text-transform:uppercase;margin-bottom:14px"), color: ACCENT }}>Preguntas frecuentes</div>
          <h2 style={css("font:600 34px var(--font-hanken);letter-spacing:-0.035em;margin:0 0 16px")}>Transparencia antes de invertir.</h2>
          <p style={css("font:400 16px/1.55 var(--font-hanken);color:#6B6B76;margin:0")}>¿Te queda alguna duda? Nuestro equipo responde en menos de 24 horas.</p>
        </div>
        <div style={css("border-top:1px solid #ECECEC")}>
          {faqDefs.map(([q, a], i) => {
            const isOpen = open === i;
            return (
              <div key={i} style={css("border-bottom:1px solid #ECECEC")}>
                <button onClick={() => setOpen(isOpen ? -1 : i)} style={css("appearance:none;cursor:pointer;width:100%;background:none;border:none;display:flex;align-items:center;justify-content:space-between;gap:16px;padding:20px 0;text-align:left")}>
                  <span style={css("font:600 17px var(--font-hanken);letter-spacing:-0.01em;color:#0D0D0D")}>{q}</span>
                  <span style={{ ...css("flex:none;width:26px;height:26px;border-radius:50%;display:flex;align-items:center;justify-content:center;font:400 18px var(--font-hanken);transition:transform .2s ease"), background: isOpen ? ACCENT : "#F4F4F5", color: isOpen ? "#fff" : "#8A8A94", transform: isOpen ? "rotate(45deg)" : "rotate(0deg)" }}>+</span>
                </button>
                <div style={{ overflow: "hidden", transition: "max-height .28s ease, opacity .2s ease", maxHeight: isOpen ? 320 : 0, opacity: isOpen ? 1 : 0 }}>
                  <p style={css("font:400 15px/1.6 var(--font-hanken);color:#5C5C66;margin:0;padding:0 0 22px;max-width:560px")}>{a}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const app = useApp();
  const { price, change, goldSpot } = useMarket();
  const router = useRouter();
  const pos = change >= 0;
  const changeStr = (pos ? "+" : "") + change.toFixed(2) + "%";
  const changeColor = pos ? ACCENT : "#D14343";
  const heroStats = [
    { value: fmtUSD(goldSpot), label: "Oro spot (XAU/USD)" },
    { value: fmtUSD(price), label: "Precio " + TOKEN_SYMBOL },
    { value: STRUCTURED_BACKING_LABEL, label: "Respaldo estructurado" },
    { value: CRYPTOHOST_TRANSFERS, label: "Transferencias CRYPTOHOST" },
  ];
  const hubNodes = hubMeta.map((m, i) => ({ name: m[0], real: m[1], tag: m[2], pos: hubPos[i] }));

  return (
    <main>
      <section data-hero-pad data-section-pad style={css("max-width:1200px;margin:0 auto;padding:72px 24px 40px")}>
        <div data-hero style={css("display:grid;grid-template-columns:1.05fr 0.95fr;gap:56px;align-items:center")}>
          <div>
            <div style={css("display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin-bottom:22px")}>
              <span style={{ ...css("display:inline-flex;align-items:center;gap:8px;padding:7px 13px;border-radius:999px"), background: "color-mix(in srgb, var(--accent) 14%, #fff)" }}>
                <span style={css("width:6px;height:6px;border-radius:50%;background:" + ACCENT)} />
                <span style={{ ...css("font:600 12px var(--font-mono);letter-spacing:0.04em;text-transform:uppercase"), color: "#9A7B0A" }}>Preventa abierta</span>
              </span>
              <span style={css("display:inline-flex;align-items:center;padding:7px 13px;border-radius:999px;border:1px solid #E2E2E4")}>
                <span style={css("font:600 12px var(--font-mono);letter-spacing:0.03em;color:#6B6B76;text-transform:uppercase")}>Respaldo en oro físico</span>
              </span>
            </div>
            <h1 data-h1 style={css("font:600 64px/1.0 var(--font-hanken);letter-spacing:-0.045em;margin:0 0 22px;max-width:620px")}>
              El oro del siglo XXI.<br />
              <span style={{ color: "#9A7B0A" }}>On-chain.</span>
            </h1>
            <p style={css("font:400 19px/1.55 var(--font-hanken);color:#5C5C66;max-width:520px;margin:0 0 32px;text-wrap:pretty")}>
              {TOKEN_SYMBOL} es el token de CryptoGold: respaldado por oro real, anclado al precio spot y disponible en {CHAINS.length} redes. Compra con USDT, cripto o tarjeta. Sin custodia. Diseñado para capital patrimonial.
            </p>
            <div style={css("display:flex;gap:12px;flex-wrap:wrap")}>
              <Hov as="button" onClick={() => router.push("/comprar")} style="appearance:none;cursor:pointer;background:#0D0D0D;color:#fff;border:none;border-radius:12px;padding:15px 26px;font:600 16px var(--font-hanken);letter-spacing:-0.01em" hover="background:#1A1508">Comprar {TOKEN_SYMBOL}</Hov>
              <Hov as="button" onClick={() => router.push("/docs/whitepaper")} style="appearance:none;cursor:pointer;background:#fff;color:#0D0D0D;border:1px solid #DADADD;border-radius:12px;padding:15px 26px;font:600 16px var(--font-hanken);letter-spacing:-0.01em" hover="border-color:#C9A227">Leer whitepaper</Hov>
            </div>
            <div style={css("display:flex;align-items:center;gap:18px;margin-top:28px;flex-wrap:wrap")}>
              <span style={css("font:500 13px var(--font-mono);color:#8A8A94")}>◆ Oro físico auditado</span>
              <span style={css("font:500 13px var(--font-mono);color:#8A8A94")}>◆ Multi-chain</span>
              <span style={css("font:500 13px var(--font-mono);color:#8A8A94")}>◆ No quemable</span>
            </div>
          </div>
          <div style={css("background:#fff;border:1px solid #ECECEC;border-radius:24px;padding:26px;box-shadow:0 24px 60px -28px rgba(154,123,10,0.15)")}>
            <div style={css("display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:14px")}>
              <div>
                <div style={css("font:500 13px var(--font-mono);color:#8A8A94;margin-bottom:6px")}>{TOKEN_SYMBOL} / USD · anclado a XAU</div>
                <div style={css("display:flex;align-items:baseline;gap:10px")}>
                  <span style={css("font:600 38px var(--font-mono);letter-spacing:-0.02em")}>{fmtUSD(price)}</span>
                  <span style={{ ...css("font:600 15px var(--font-mono)"), color: changeColor }}>{changeStr}</span>
                </div>
              </div>
              <span style={{ ...css("display:inline-flex;align-items:center;gap:6px;padding:5px 10px;border-radius:999px"), background: "color-mix(in srgb, var(--accent) 14%, #fff)" }}>
                <span style={{ ...css("width:6px;height:6px;border-radius:50%;background:" + ACCENT), animation: "blink 2s infinite" }} />
                <span style={{ ...css("font:600 11px var(--font-mono)"), color: "#9A7B0A" }}>EN VIVO</span>
              </span>
            </div>
            <Chart series={series["1M"]} price={price} height={130} gradId="gSpark" />
            <div style={css("display:flex;justify-content:space-between;margin-top:12px;padding:10px 12px;background:#F7F7F8;border-radius:10px")}>
              <span style={css("font:500 12px var(--font-hanken);color:#8A8A94")}>Oro spot</span>
              <span style={css("font:600 13px var(--font-mono);color:#9A7B0A")}>{fmtUSD(goldSpot)}/oz</span>
            </div>
            <div style={css("display:flex;gap:10px;margin-top:14px")}>
              <button onClick={() => router.push("/comprar")} style={css("flex:1;appearance:none;cursor:pointer;background:#0D0D0D;color:#fff;border:none;border-radius:12px;padding:13px;font:600 15px var(--font-hanken)")}>Comprar</button>
              <button onClick={() => router.push("/mercado")} style={css("flex:1;appearance:none;cursor:pointer;background:#F4F4F5;color:#0D0D0D;border:none;border-radius:12px;padding:13px;font:600 15px var(--font-hanken)")}>Ver gráfico</button>
            </div>
          </div>
        </div>
        <div data-stats style={css("display:grid;grid-template-columns:repeat(4,1fr);gap:1px;background:#ECECEC;border:1px solid #ECECEC;border-radius:18px;overflow:hidden;margin-top:56px")}>
          {heroStats.map((st, i) => (
            <div key={i} style={css("background:#fff;padding:24px 26px")}>
              <div style={{ ...css("font:600 26px var(--font-mono);letter-spacing:-0.02em;margin-bottom:6px"), color: i === 0 || i === 1 ? "#9A7B0A" : "#0D0D0D" }}>{st.value}</div>
              <div style={css("font:500 13px var(--font-hanken);color:#8A8A94")}>{st.label}</div>
            </div>
          ))}
        </div>
      </section>

      <GoldAnchor />
      <Activity />

      <section style={css("max-width:1200px;margin:0 auto;padding:48px 24px")}>
        <h2 data-h2 style={css("font:600 38px var(--font-hanken);letter-spacing:-0.035em;margin:0 0 16px;max-width:720px")}>Crypto + TradFi + DeFi. Un solo activo.</h2>
        <div data-2col style={css("display:grid;grid-template-columns:1.05fr 0.95fr;gap:40px;align-items:start;margin-bottom:40px")}>
          <p style={css("font:400 18px/1.6 var(--font-hanken);color:#5C5C66;margin:0;text-wrap:pretty")}>
            <strong style={css("color:#0D0D0D;font-weight:600")}>{TOKEN_SYMBOL} combina oro físico auditado</strong> con infraestructura bancaria internacional y liquidez on-chain instantánea. Un modelo híbrido pensado para revalorización sostenible — sin esquemas especulativos — orientado a inversores institucionales y patrimoniales.
          </p>
          <div style={css("display:flex;flex-direction:column;gap:12px")}>
            {tokenWhy.map((w, i) => (
              <div key={i} style={css("display:flex;gap:14px;align-items:flex-start;background:#F7F7F8;border-radius:14px;padding:16px 18px")}>
                <span style={{ ...css("flex:none;width:30px;height:30px;border-radius:9px;background:#fff;border:1px solid #ECECEC;display:flex;align-items:center;justify-content:center"), color: "#9A7B0A" }}>{w.icon}</span>
                <div><div style={css("font:600 15px var(--font-hanken);margin-bottom:2px")}>{w.title}</div><div style={css("font:400 13px/1.45 var(--font-hanken);color:#6B6B76")}>{w.desc}</div></div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ ...css("font:600 11px var(--font-mono);letter-spacing:0.08em;text-transform:uppercase;margin-bottom:12px"), color: ACCENT }}>Modelo de valor</div>
        <h3 data-h3 style={css("font:600 27px var(--font-hanken);letter-spacing:-0.025em;margin:0 0 16px;max-width:700px")}>Respaldo tangible. Correlación con el oro. Liquidez permanente.</h3>
        <p style={css("font:400 18px/1.6 var(--font-hanken);color:#5C5C66;max-width:700px;margin:0 0 24px;text-wrap:pretty")}>
          Cuando el oro sube, <strong style={css("color:#0D0D0D;font-weight:600")}>{TOKEN_SYMBOL} lo refleja</strong>. Reservas auditables, estructura legal internacional y liquidación automatizada vía CRYPTOHOST garantizan un activo serio para quien busca preservar y hacer crecer patrimonio en la era digital.
        </p>
        <div style={css("display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin-bottom:18px")}>
          {["Reserva de oro", "Spot XAU/USD", "Liquidez USDT", "Multi-chain"].map((t, i) => (
            <span key={i} style={css("display:inline-flex;align-items:center;gap:8px")}>
              <span style={css("font:600 13px var(--font-hanken);color:#0D0D0D;background:#F4F4F5;border-radius:999px;padding:8px 14px")}>{t}</span>
              {i < 3 && <span style={css("color:#C8C8CE;font-size:14px")}>→</span>}
            </span>
          ))}
          <span style={{ ...css("display:inline-flex;align-items:center;gap:6px;font:600 13px var(--font-hanken);border-radius:999px;padding:8px 14px"), color: "#9A7B0A", background: "color-mix(in srgb, var(--accent) 14%, #fff)" }}>Activo de reserva digital ↗</span>
        </div>

        <div style={css("font:600 23px var(--font-hanken);letter-spacing:-0.02em;color:#0D0D0D;margin-bottom:8px")}>Pilares del ecosistema</div>
        <div data-hub style={{ ...css("position:relative;width:100%;margin:18px auto 0"), maxWidth: 600, aspectRatio: "600/520" }}>
          <svg viewBox="0 0 600 520" preserveAspectRatio="xMidYMid meet" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
            <g style={{ stroke: "#E2E2E4", strokeWidth: 1.5 }}>
              <line x1="300" y1="260" x2="300" y2="58" /><line x1="300" y1="260" x2="505" y2="150" /><line x1="300" y1="260" x2="505" y2="370" /><line x1="300" y1="260" x2="300" y2="462" /><line x1="300" y1="260" x2="95" y2="370" /><line x1="300" y1="260" x2="95" y2="150" />
            </g>
            <g style={{ stroke: "var(--accent,#C9A227)", strokeWidth: 2, strokeDasharray: "3 9", strokeLinecap: "round" }}>
              {[["300", "58", "0s"], ["505", "150", ".15s"], ["505", "370", ".3s"], ["300", "462", ".45s"], ["95", "370", ".6s"], ["95", "150", ".75s"]].map(([x, y, delay], i) => (
                <line key={i} x1="300" y1="260" x2={x} y2={y} style={{ animation: `flow 1.1s linear infinite ${delay}` }} />
              ))}
            </g>
          </svg>
          <div data-hubcenter style={css("position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:132px;height:132px;border-radius:50%;background:#0D0D0D;display:flex;flex-direction:column;align-items:center;justify-content:center;box-shadow:0 14px 36px -14px rgba(154,123,10,0.4)")}>
            <span style={{ ...css("position:absolute;inset:-1px;border-radius:50%;border:2px solid var(--accent,#C9A227)"), animation: "hubring 2.4s ease-out infinite" }} />
            <span style={css("font:700 22px var(--font-hanken);letter-spacing:-0.03em;color:#E8D48B")}>{TOKEN_SYMBOL}</span>
            <span style={css("display:flex;align-items:center;gap:5px;margin-top:3px")}><span style={css("width:5px;height:5px;border-radius:50%;background:" + ACCENT)} /><span style={css("font:600 10px var(--font-mono);letter-spacing:0.06em;color:#9A9AA0;text-transform:uppercase")}>Anclado</span></span>
          </div>
          {hubNodes.map((n, i) => (
            <div key={i} style={css(n.pos)}>
              <Hov data-hubcard style="background:#fff;border:1px solid #E6E6E8;border-radius:14px;padding:11px 14px;text-align:center;box-shadow:0 8px 22px -16px rgba(154,123,10,0.2);min-width:138px" hover="border-color:#C9A227">
                <div data-hn style={css("font:600 15px var(--font-hanken);letter-spacing:-0.01em;color:#0D0D0D")}>{n.name}</div>
                <div data-hr style={css("font:400 11px var(--font-hanken);color:#9A9AA0;margin:1px 0 4px")}>{n.real}</div>
                <div data-ht style={{ ...css("font:600 11px var(--font-mono)"), color: "#9A7B0A" }}>{n.tag}</div>
              </Hov>
            </div>
          ))}
        </div>

        <div data-eco style={css("display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:32px")}>
          {ecosystem.map((p, i) => (
            <Hov key={i} style="background:#fff;border:1px solid #ECECEC;border-radius:18px;padding:24px" hover="border-color:#C9A227">
              <div style={css("font:600 18px var(--font-hanken);letter-spacing:-0.02em;margin-bottom:8px")}>{p.name}</div>
              <div style={css("font:400 14px/1.5 var(--font-hanken);color:#6B6B76")}>{p.desc}</div>
            </Hov>
          ))}
        </div>
      </section>

      <Donut />
      <ValueModel />
      <InfraGrid />
      <CryptohostSection />
      <ChainTable />
      <RoadmapSection />
      <SupportBanner />

      <section style={css("max-width:1200px;margin:0 auto;padding:48px 24px")}>
        <div data-msg style={css("display:grid;grid-template-columns:1fr 1fr;gap:56px;align-items:center;background:#F7F7F8;border-radius:28px;padding:48px")}>
          <div>
            <div style={{ ...css("font:600 13px var(--font-mono);letter-spacing:0.06em;text-transform:uppercase;margin-bottom:14px"), color: ACCENT }}>Empieza en 3 pasos</div>
            <h2 style={css("font:600 34px var(--font-hanken);letter-spacing:-0.035em;margin:0 0 16px")}>Tu patrimonio en oro digital.</h2>
            <p style={css("font:400 17px/1.55 var(--font-hanken);color:#5C5C66;margin:0 0 24px")}>Conecta wallet, compra con USDT o tarjeta y sigue la correlación con el oro en tiempo real.</p>
            <div style={css("display:flex;flex-direction:column;gap:14px")}>
              {steps.map((st, i) => (
                <div key={i} style={css("display:flex;gap:14px;align-items:flex-start")}>
                  <span style={{ ...css("flex:none;width:28px;height:28px;border-radius:8px;display:flex;align-items:center;justify-content:center;font:600 13px var(--font-mono)"), background: "#0D0D0D", color: "#E8D48B" }}>{st.n}</span>
                  <div><div style={css("font:600 16px var(--font-hanken)")}>{st.title}</div><div style={css("font:400 14px var(--font-hanken);color:#6B6B76")}>{st.desc}</div></div>
                </div>
              ))}
            </div>
          </div>
          <div style={css("display:flex;justify-content:center")}>
            <div data-phone-mock style={css("width:280px;height:560px;background:#0D0D0D;border-radius:42px;padding:11px;box-shadow:0 30px 70px -30px rgba(154,123,10,0.35)")}>
              <div style={css("width:100%;height:100%;background:#fff;border-radius:32px;overflow:hidden;display:flex;flex-direction:column")}>
                <div style={css("padding:18px 18px 12px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #F0F0F1")}>
                  <span style={css("font:700 16px var(--font-hanken);letter-spacing:-0.04em")}>Crypto<span style={{ color: "#9A7B0A" }}>Gold</span></span>
                  <span style={css("width:24px;height:24px;border-radius:50%;background:#F4F4F5")} />
                </div>
                <div style={css("padding:18px;flex:1")}>
                  <div style={css("font:500 12px var(--font-mono);color:#8A8A94")}>Saldo {TOKEN_SYMBOL}</div>
                  <div style={css("font:600 30px var(--font-mono);letter-spacing:-0.02em;margin:4px 0 2px")}>{app.connected ? fmtN(app.balances.CGOLD, 2) : "0.00"}</div>
                  <div style={{ ...css("font:600 13px var(--font-mono)"), color: "#9A7B0A" }}>{changeStr} · ≈ {fmtUSD(goldSpot * OZ_PER_TOKEN)}/tk</div>
                  <div style={css("background:#F7F7F8;border-radius:14px;padding:14px;margin-top:18px")}>
                    <div style={css("font:500 12px var(--font-mono);color:#8A8A94;margin-bottom:6px")}>Pagas con USDT</div>
                    <div style={css("font:600 22px var(--font-mono)")}>500.00</div>
                  </div>
                  <div style={css("display:flex;justify-content:center;margin:6px 0")}><span style={css("width:30px;height:30px;border-radius:50%;background:#F0F0F1;display:flex;align-items:center;justify-content:center;color:#8A8A94")}>↓</span></div>
                  <div style={{ ...css("border-radius:14px;padding:14px"), background: "color-mix(in srgb, var(--accent) 12%, #fff)" }}>
                    <div style={css("font:500 12px var(--font-mono);color:#8A8A94;margin-bottom:6px")}>Recibes {TOKEN_SYMBOL}</div>
                    <div style={{ ...css("font:600 22px var(--font-mono)"), color: "#9A7B0A" }}>{fmtN((500 * 0.99) / price, 2)}</div>
                  </div>
                </div>
                <div style={css("padding:0 18px 18px")}><button onClick={() => router.push("/comprar")} style={css("width:100%;appearance:none;cursor:pointer;border:none;background:#0D0D0D;color:#E8D48B;border-radius:12px;padding:13px;text-align:center;font:600 15px var(--font-hanken)")}>Comprar {TOKEN_SYMBOL}</button></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Faq />
    </main>
  );
}
