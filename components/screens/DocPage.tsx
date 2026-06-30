"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { css } from "@/lib/css";
import { ACCENT } from "@/lib/format";
import { TOKEN_SYMBOL } from "@/lib/brand";
import type { Doc } from "@/lib/content";

export default function DocPage({ doc }: { doc: Doc }) {
  const router = useRouter();
  return (
    <main style={css("max-width:840px;margin:0 auto;padding:40px 24px 24px")}>
      <Link href="/" prefetch className="footer-link" style={css("text-decoration:none;display:flex;align-items:center;gap:6px;font:500 13px var(--font-hanken);color:#8A8A94;margin-bottom:28px")}>
        ← Volver al inicio
      </Link>
      <div style={{ ...css("font:600 12px var(--font-mono);letter-spacing:0.06em;text-transform:uppercase;margin-bottom:12px"), color: ACCENT }}>{doc.eyebrow}</div>
      <h1 data-doc-h1 style={css("font:600 44px/1.05 var(--font-hanken);letter-spacing:-0.04em;margin:0 0 16px")}>{doc.title}</h1>
      <p style={css("font:400 18px/1.55 var(--font-hanken);color:#5C5C66;margin:0 0 14px;max-width:680px;text-wrap:pretty")}>{doc.subtitle}</p>
      <div style={css("font:500 12px var(--font-mono);color:#A8A8AE;padding-bottom:28px;border-bottom:1px solid #ECECEC;margin-bottom:36px")}>{doc.meta}</div>

      {doc.hasStats && doc.stats && (
        <div data-docstats style={css("display:grid;grid-template-columns:repeat(4,1fr);gap:1px;background:#ECECEC;border:1px solid #ECECEC;border-radius:16px;overflow:hidden;margin-bottom:40px")}>
          {doc.stats.map((st, i) => (
            <div key={i} style={css("background:#fff;padding:20px 22px")}>
              <div style={css("font:600 22px var(--font-mono);letter-spacing:-0.02em;margin-bottom:5px")}>{st.value}</div>
              <div style={css("font:500 12px var(--font-hanken);color:#8A8A94")}>{st.label}</div>
            </div>
          ))}
        </div>
      )}

      <div style={css("display:flex;flex-direction:column;gap:32px")}>
        {doc.sections.map((sec, i) => (
          <div key={i}>
            {sec.h && <h3 style={css("font:600 21px var(--font-hanken);letter-spacing:-0.02em;margin:0 0 12px")}>{sec.h}</h3>}
            <div style={css("display:flex;flex-direction:column;gap:14px")}>
              {sec.p.map((para, j) => (
                <p key={j} style={css("font:400 16px/1.65 var(--font-hanken);color:#444;margin:0;text-wrap:pretty")}>{para}</p>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div style={css("margin-top:48px;background:#F7F7F8;border-radius:18px;padding:28px;display:flex;align-items:center;justify-content:space-between;gap:20px;flex-wrap:wrap")}>
        <div>
          <div style={css("font:600 18px var(--font-hanken);letter-spacing:-0.02em;margin-bottom:4px")}>¿Listo para invertir en {TOKEN_SYMBOL}?</div>
          <div style={css("font:400 14px var(--font-hanken);color:#6B6B76")}>Compra con USDT, cripto o tarjeta. Anclado al precio del oro.</div>
        </div>
        <div style={css("display:flex;gap:10px")}>
          <button onClick={() => router.push("/comprar")} style={css("appearance:none;cursor:pointer;background:#0D0D0D;color:#fff;border:none;border-radius:12px;padding:13px 22px;font:600 15px var(--font-hanken)")}>Comprar {TOKEN_SYMBOL}</button>
          <button onClick={() => router.push("/mercado")} style={css("appearance:none;cursor:pointer;background:#fff;color:#0D0D0D;border:1px solid #DADADD;border-radius:12px;padding:13px 22px;font:600 15px var(--font-hanken)")}>Ver gráfico</button>
        </div>
      </div>
    </main>
  );
}
