"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { css } from "@/lib/css";
import { ACCENT } from "@/lib/format";
import {
  TOKEN_SYMBOL,
  STRUCTURED_BACKING_LABEL,
  STRUCTURED_BACKING_FULL,
  CRYPTOHOST_TRANSFERS,
  SUPPORT_HUMAN_TEAM,
  SUPPORT_SLA,
} from "@/lib/brand";
import { structuredBacking, infraItems, roadmapPhases, listingStages } from "@/lib/content";
import { Hov } from "./ui";
import CryptohostMonitor from "./CryptohostMonitor";

const statusColor = (s: "done" | "active" | "upcoming" | "planned") =>
  s === "done" ? "#26A17B" : s === "active" ? "#C9A227" : "#A8A8AE";

const statusLabel = (s: "done" | "active" | "upcoming" | "planned") =>
  s === "done" ? "Completado" : s === "active" ? "En curso" : "Próximamente";

export function ValueModel() {
  return (
    <section style={css("max-width:1200px;margin:0 auto;padding:48px 24px")}>
      <div data-2col style={css("display:grid;grid-template-columns:1fr 1fr;gap:40px;align-items:center;background:linear-gradient(135deg,#F7F7F8 0%,#FFF9E6 100%);border:1px solid #ECECEC;border-radius:28px;padding:48px")}>
        <div>
          <div style={{ ...css("font:600 13px var(--font-mono);letter-spacing:0.06em;text-transform:uppercase;margin-bottom:14px"), color: ACCENT }}>Modelo de valor</div>
          <h2 style={css("font:600 38px var(--font-hanken);letter-spacing:-0.035em;margin:0 0 16px")}>Respaldo estructurado. Crecimiento sostenible.</h2>
          <p style={css("font:400 17px/1.6 var(--font-hanken);color:#5C5C66;margin:0 0 20px")}>
            {TOKEN_SYMBOL} no es un token especulativo: está diseñado para capital institucional y patrimonial, con activos tangibles y estructura legal internacional.
          </p>
          <ul style={css("margin:0;padding:0 0 0 18px;font:400 15px/1.7 var(--font-hanken);color:#5C5C66")}>
            <li>Crypto + TradFi + DeFi en un solo activo</li>
            <li>Oro físico y equivalentes financieros auditables</li>
            <li>Revalorización orientada a largo plazo, sin esquemas de quema</li>
          </ul>
          <Link href="/docs/legal-structure" prefetch style={css("display:inline-block;margin-top:22px;font:600 14px var(--font-hanken);color:#9A7B0A;text-decoration:none")}>
            Ver estructura legal →
          </Link>
        </div>
        <div style={css("text-align:center")}>
          <div style={css("background:#0D0D0D;border-radius:24px;padding:40px 32px;border:1px solid #2A2410")}>
            <div style={css("font:500 12px var(--font-mono);color:#8A8A80;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:10px")}>Respaldo estructurado estimado</div>
            <div style={css("font:600 52px var(--font-mono);letter-spacing:-0.03em;color:#E8D48B;margin-bottom:6px")}>{STRUCTURED_BACKING_LABEL}</div>
            <div style={css("font:400 13px var(--font-mono);color:#8A8A80;margin-bottom:16px")}>{STRUCTURED_BACKING_FULL}</div>
            <div style={css("font:400 12px/1.5 var(--font-hanken);color:#A8A898;max-width:320px;margin:0 auto")}>{structuredBacking.note}</div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function InfraGrid() {
  return (
    <section style={css("max-width:1200px;margin:0 auto;padding:24px 24px 48px")}>
      <div style={{ ...css("font:600 13px var(--font-mono);letter-spacing:0.06em;text-transform:uppercase;margin-bottom:14px"), color: ACCENT }}>Infraestructura incluida</div>
      <h2 style={css("font:600 34px var(--font-hanken);letter-spacing:-0.035em;margin:0 0 28px;max-width:640px")}>Todo lo que necesitas para operar con confianza.</h2>
      <div style={css("display:grid;grid-template-columns:repeat(3,1fr);gap:16px")} data-infra>
        {infraItems.map((item) => (
          <Link key={item.title} href={item.href} prefetch style={css("text-decoration:none")}>
            <Hov style="background:#fff;border:1px solid #ECECEC;border-radius:18px;padding:24px;height:100%" hover="border-color:#C9A227;box-shadow:0 12px 32px -16px rgba(154,123,10,0.15)">
              <span style={{ ...css("font:600 22px;margin-bottom:12px;display:block"), color: "#9A7B0A" }}>{item.icon}</span>
              <div style={css("font:600 17px var(--font-hanken);color:#0D0D0D;margin-bottom:8px")}>{item.title}</div>
              <div style={css("font:400 14px/1.5 var(--font-hanken);color:#6B6B76")}>{item.desc}</div>
            </Hov>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function CryptohostSection() {
  const router = useRouter();
  return (
    <section style={css("max-width:1200px;margin:0 auto;padding:48px 24px")}>
      <div data-2col style={css("display:grid;grid-template-columns:1.1fr 0.9fr;gap:48px;align-items:center;background:#0D0D0D;border-radius:28px;padding:48px;border:1px solid #2A2410")}>
        <div>
          <div style={css("display:inline-flex;align-items:center;gap:8px;padding:6px 12px;border-radius:999px;background:#1A1508;border:1px solid #3A3010;margin-bottom:18px")}>
            <span style={css("width:6px;height:6px;border-radius:50%;background:#26A17B")} />
            <span style={css("font:600 11px var(--font-mono);color:#C9A227;text-transform:uppercase;letter-spacing:0.06em")}>Operativo · 24/7</span>
          </div>
          <h2 style={css("font:600 38px var(--font-hanken);letter-spacing:-0.035em;margin:0 0 16px;color:#fff")}>CRYPTOHOST</h2>
          <p style={css("font:400 17px/1.6 var(--font-hanken);color:#B8B8BD;margin:0 0 24px;max-width:480px")}>
            Motor de liquidación automatizada con más de {CRYPTOHOST_TRANSFERS} transferencias históricas. Cada compra, swap y acreditación de {TOKEN_SYMBOL} pasa por infraestructura probada a escala global.
          </p>
          <div style={css("display:flex;flex-wrap:wrap;gap:12px;margin-bottom:28px")}>
            {[
              ["5.000", "Registro visible"],
              ["< 3 s", "Liquidación media"],
              ["CGD-ID", "Trazabilidad total"],
            ].map(([v, l]) => (
              <div key={l} style={css("background:#1A1508;border:1px solid #2A2410;border-radius:12px;padding:12px 16px")}>
                <div style={css("font:600 18px var(--font-mono);color:#E8D48B")}>{v}</div>
                <div style={css("font:400 12px var(--font-hanken);color:#8A8A80")}>{l}</div>
              </div>
            ))}
          </div>
          <Hov as="button" onClick={() => router.push("/cryptohost")} style="appearance:none;cursor:pointer;background:#C9A227;color:#0D0D0D;border:none;border-radius:12px;padding:14px 24px;font:600 15px var(--font-hanken);margin-right:10px" hover="background:#E8D48B">
            Centro CRYPTOHOST
          </Hov>
          <Hov as="button" onClick={() => router.push("/docs/cryptohost")} style="appearance:none;cursor:pointer;background:transparent;color:#C9A227;border:1px solid #3A3010;border-radius:12px;padding:14px 24px;font:600 15px var(--font-hanken)" hover="border-color:#C9A227">
            Documentación
          </Hov>
        </div>
        <div style={css("background:#1A1508;border:1px solid #2A2410;border-radius:20px;padding:24px")}>
          <div style={css("font:600 12px var(--font-mono);color:#8A8A80;text-transform:uppercase;margin-bottom:16px")}>Flujo de liquidación</div>
          {["Usuario paga USDT / tarjeta", "CRYPTOHOST valida y enruta", "Smart contract acredita CGOLD", "Wallet del usuario · self-custody"].map((step, i) => (
            <div key={i} style={css("display:flex;align-items:center;gap:12px;padding:12px 0;border-bottom:" + (i < 3 ? "1px solid #2A2410" : "none"))}>
              <span style={css("flex:none;width:24px;height:24px;border-radius:50%;background:#C9A227;color:#0D0D0D;display:flex;align-items:center;justify-content:center;font:600 11px var(--font-mono)")}>{i + 1}</span>
              <span style={css("font:400 14px var(--font-hanken);color:#E4E4E6")}>{step}</span>
            </div>
          ))}
        </div>
      </div>
      <CryptohostMonitor compact />
      <p style={css("text-align:center;margin:16px 0 0;font:400 12px var(--font-hanken);color:#6B6B76")}>
        <Link href="/cryptohost" prefetch style={css("color:#9A7B0A;text-decoration:none;font-weight:600")}>
          Centro de operaciones CRYPTOHOST →
        </Link>
      </p>
    </section>
  );
}

export function RoadmapSection() {
  return (
    <section style={css("max-width:1200px;margin:0 auto;padding:48px 24px")}>
      <div style={css("display:flex;justify-content:space-between;align-items:flex-end;flex-wrap:wrap;gap:16px;margin-bottom:32px")}>
        <div>
          <div style={{ ...css("font:600 13px var(--font-mono);letter-spacing:0.06em;text-transform:uppercase;margin-bottom:14px"), color: ACCENT }}>Hoja de ruta</div>
          <h2 style={css("font:600 34px var(--font-hanken);letter-spacing:-0.035em;margin:0")}>De preventa a exchanges globales.</h2>
        </div>
        <Link href="/docs/listings" prefetch style={css("font:600 14px var(--font-hanken);color:#9A7B0A;text-decoration:none")}>Estrategia CoinMarketCap →</Link>
      </div>
      <div style={css("display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:32px")} data-roadmap>
        {roadmapPhases.map((phase) => (
          <div key={phase.when} style={css("background:#fff;border:1px solid #ECECEC;border-radius:18px;padding:24px")}>
            <div style={css("display:flex;justify-content:space-between;align-items:center;margin-bottom:12px")}>
              <span style={css("font:600 12px var(--font-mono);color:#9A7B0A")}>{phase.when}</span>
              <span style={{ ...css("font:600 10px var(--font-mono);padding:4px 8px;border-radius:999px"), color: statusColor(phase.status), background: "color-mix(in srgb, " + statusColor(phase.status) + " 12%, #fff)" }}>{statusLabel(phase.status)}</span>
            </div>
            <div style={css("font:600 18px var(--font-hanken);margin-bottom:12px")}>{phase.title}</div>
            <ul style={css("margin:0;padding:0 0 0 16px;font:400 13px/1.6 var(--font-hanken);color:#6B6B76")}>
              {phase.items.map((item) => (
                <li key={item} style={css("margin-bottom:6px")}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div style={css("border:1px solid #ECECEC;border-radius:18px;overflow:hidden")}>
        <div style={css("padding:16px 22px;background:#F7F7F8;font:600 14px var(--font-hanken);border-bottom:1px solid #ECECEC")}>Plan de listing en exchanges</div>
        {listingStages.map((row, i) => (
          <div key={row.stage} data-listing-row style={css("display:grid;grid-template-columns:100px 140px 1fr 110px;gap:16px;align-items:center;padding:14px 22px;border-bottom:" + (i < listingStages.length - 1 ? "1px solid #F0F0F1" : "none"))}>
            <span style={css("font:600 12px var(--font-mono);color:#8A8A94")}>{row.stage}</span>
            <span style={css("font:600 14px var(--font-hanken)")}>{row.target}</span>
            <span style={css("font:400 13px var(--font-hanken);color:#6B6B76")}>{row.desc}</span>
            <span style={{ ...css("font:600 11px var(--font-mono);text-align:right"), color: statusColor(row.status) }}>{statusLabel(row.status)}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export function SupportBanner() {
  return (
    <section style={css("max-width:1200px;margin:0 auto;padding:24px 24px 48px")}>
      <div data-support-banner style={css("display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:24px;background:#F7F7F8;border:1px solid #ECECEC;border-radius:20px;padding:28px 32px")}>
        <div style={css("display:flex;align-items:center;gap:20px;flex-wrap:wrap")}>
          <div style={css("width:56px;height:56px;border-radius:16px;background:#0D0D0D;display:flex;align-items:center;justify-content:center;font:600 22px var(--font-mono);color:#E8D48B")}>{SUPPORT_HUMAN_TEAM}</div>
          <div>
            <div style={css("font:600 18px var(--font-hanken);margin-bottom:4px")}>Equipo humano dedicado · primer año</div>
            <div style={css("font:400 14px var(--font-hanken);color:#6B6B76")}>{SUPPORT_HUMAN_TEAM} especialistas · Respuesta media {SUPPORT_SLA} · soporte@cryptogold.io</div>
          </div>
        </div>
        <div data-support-actions style={css("display:flex;gap:10px;flex-wrap:wrap")}>
          <Link href="/docs/support" prefetch style={css("text-decoration:none;font:600 14px var(--font-hanken);color:#0D0D0D;background:#fff;border:1px solid #DADADD;border-radius:12px;padding:12px 20px")}>Centro de soporte</Link>
          <Link href="/docs/status" prefetch style={css("text-decoration:none;font:600 14px var(--font-hanken);color:#0D0D0D;background:#fff;border:1px solid #DADADD;border-radius:12px;padding:12px 20px")}>Estado del servicio</Link>
        </div>
      </div>
    </section>
  );
}
