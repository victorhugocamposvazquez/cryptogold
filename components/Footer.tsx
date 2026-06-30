"use client";

import { memo } from "react";
import Link from "next/link";
import { css } from "@/lib/css";
import { ACCENT } from "@/lib/format";
import { TOKEN_SYMBOL } from "@/lib/brand";

const COLS: { title: string; links: [string, string][] }[] = [
  {
    title: "Token",
    links: [
      ["/comprar", "Comprar " + TOKEN_SYMBOL],
      ["/docs/whitepaper", "Whitepaper"],
      ["/docs/tokenomics", "Tokenomics"],
    ],
  },
  {
    title: "Proyecto",
    links: [
      ["/docs/legal-structure", "Estructura legal"],
      ["/docs/cryptohost", "CRYPTOHOST"],
      ["/docs/listings", "CoinMarketCap · Exchanges"],
    ],
  },
  {
    title: "Recursos",
    links: [
      ["/docs/docs", "Documentación"],
      ["/docs/audit", "Auditoría"],
      ["/docs/support", "Soporte"],
      ["/docs/status", "Estado del servicio"],
    ],
  },
  {
    title: "Legal",
    links: [
      ["/docs/terms", "Términos"],
      ["/docs/privacy", "Privacidad"],
      ["/docs/risks", "Riesgos"],
    ],
  },
];

function Footer() {
  return (
    <footer style={css("border-top:1px solid #ECECEC;margin-top:40px")}>
      <div style={css("max-width:1200px;margin:0 auto;padding:48px 24px 40px")}>
        <div style={css("display:flex;justify-content:space-between;gap:32px;flex-wrap:wrap;margin-bottom:36px")}>
          <div style={css("max-width:320px")}>
            <Link href="/" prefetch style={css("text-decoration:none;font:700 20px var(--font-hanken);letter-spacing:-0.04em;color:#0D0D0D")}>
              Crypto<span style={{ color: ACCENT }}>Gold</span>
            </Link>
            <p style={css("font:400 14px/1.5 var(--font-hanken);color:#8A8A94;margin:12px 0 0")}>
              Token respaldado en oro físico. Compra, intercambia y custodia {TOKEN_SYMBOL} con USDT, cripto o tarjeta.
            </p>
          </div>
          <div style={css("display:flex;gap:40px;flex-wrap:wrap")}>
            {COLS.map((col) => (
              <div key={col.title}>
                <div style={css("font:600 13px var(--font-hanken);margin-bottom:12px;color:#0D0D0D")}>{col.title}</div>
                <div style={css("display:flex;flex-direction:column;align-items:flex-start;gap:8px")}>
                  {col.links.map(([href, label]) => (
                    <Link key={href} href={href} prefetch className="footer-link" style={css("text-decoration:none;font:400 14px var(--font-hanken);color:#8A8A94")}>
                      {label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div style={css("border-top:1px solid #ECECEC;padding-top:20px;font:400 12px/1.5 var(--font-mono);color:#A8A8AE")}>
          CryptoGold · Token {TOKEN_SYMBOL} anclado al oro. No constituye asesoramiento financiero. Invertir conlleva riesgos. Respaldo sujeto a viabilidad legal y regulatoria.
        </div>
      </div>
    </footer>
  );
}

export default memo(Footer);
