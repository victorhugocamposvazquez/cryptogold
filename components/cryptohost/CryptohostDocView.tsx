"use client";

import { useEffect, useState } from "react";
import { css } from "@/lib/css";
import type { Doc } from "@/lib/content";
import type { ServiceStatus } from "@/lib/cryptohost/types";

const STATUS_COLOR: Record<string, string> = {
  operational: "#26A17B",
  degraded: "#C9A227",
  outage: "#E05252",
};

export default function CryptohostDocView({ doc }: { doc: Doc }) {
  return (
    <div style={css("max-width:800px")}>
      <div style={css("font:600 12px var(--font-mono);color:#C9A227;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:10px")}>
        {doc.eyebrow}
      </div>
      <h1 style={css("font:700 36px var(--font-hanken);color:#fff;margin:0 0 12px;letter-spacing:-0.035em")}>{doc.title}</h1>
      <p style={css("font:400 16px/1.6 var(--font-hanken);color:#9A9AA0;margin:0 0 12px")}>{doc.subtitle}</p>
      <div style={css("font:500 12px var(--font-mono);color:#6B6B76;padding-bottom:24px;border-bottom:1px solid rgba(255,255,255,0.08);margin-bottom:32px")}>
        {doc.meta}
      </div>

      {doc.hasStats && doc.stats && (
        <div style={css("display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:10px;margin-bottom:32px")}>
          {doc.stats.map((st, i) => (
            <div key={i} style={css("background:#161616;border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:16px 18px")}>
              <div style={css("font:600 20px var(--font-mono);color:#E8D48B;margin-bottom:4px")}>{st.value}</div>
              <div style={css("font:500 12px var(--font-hanken);color:#8A8A80")}>{st.label}</div>
            </div>
          ))}
        </div>
      )}

      <div style={css("display:flex;flex-direction:column;gap:28px")}>
        {doc.sections.map((sec, i) => (
          <div key={i}>
            {sec.h && <h3 style={css("font:600 18px var(--font-hanken);color:#fff;margin:0 0 10px")}>{sec.h}</h3>}
            <div style={css("display:flex;flex-direction:column;gap:12px")}>
              {sec.p.map((para, j) => (
                <p key={j} style={css("font:400 15px/1.65 var(--font-hanken);color:#B8B8BD;margin:0")}>
                  {para}
                </p>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ServiceStatusPanel({ doc }: { doc: Doc }) {
  const [live, setLive] = useState<ServiceStatus | null>(null);

  useEffect(() => {
    fetch("/api/cryptohost/status")
      .then((r) => r.json())
      .then(setLive)
      .catch(() => {});
    const id = setInterval(() => {
      fetch("/api/cryptohost/status")
        .then((r) => r.json())
        .then(setLive)
        .catch(() => {});
    }, 15000);
    return () => clearInterval(id);
  }, []);

  const color = live ? STATUS_COLOR[live.status] ?? "#26A17B" : "#26A17B";
  const stats = live?.stats;

  return (
    <div style={css("max-width:800px")}>
      <div style={css("font:600 12px var(--font-mono);color:#C9A227;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:10px")}>
        {doc.eyebrow}
      </div>
      <h1 style={css("font:700 36px var(--font-hanken);color:#fff;margin:0 0 12px;letter-spacing:-0.035em")}>{doc.title}</h1>
      <p style={css("font:400 16px/1.6 var(--font-hanken);color:#9A9AA0;margin:0 0 24px")}>{doc.subtitle}</p>

      <div style={css("background:#161616;border:1px solid rgba(255,255,255,0.08);border-radius:14px;padding:20px 22px;margin-bottom:28px")}>
        <div style={css("display:flex;align-items:center;gap:10px;margin-bottom:8px")}>
          <span style={css(`width:10px;height:10px;border-radius:50%;background:${color};box-shadow:0 0 10px ${color}`)} />
          <span style={css("font:600 18px var(--font-hanken);color:#fff;text-transform:capitalize")}>
            {live?.status === "operational" ? "Operativo" : live?.status === "degraded" ? "Degradado" : live?.status === "outage" ? "Incidencia" : "Operativo"}
          </span>
        </div>
        <p style={css("font:400 14px var(--font-hanken);color:#B8B8BD;margin:0 0 16px")}>
          {live?.message ?? "Consultando estado…"}
        </p>
        <div style={css("display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:10px")}>
          {[
            ["CRYPTOHOST", live?.status === "operational" ? "Operativo" : live?.status ?? "—"],
            ["Uptime", stats?.uptimePct ? stats.uptimePct + "%" : "99,9%"],
            ["Liquidación", stats?.avgConfirmMs ? (stats.avgConfirmMs / 1000).toFixed(1) + " s" : "< 3 s"],
            ["24 h", stats?.last24h != null ? String(stats.last24h) : "—"],
          ].map(([label, value]) => (
            <div key={label} style={css("background:#0D0D0D;border-radius:10px;padding:12px 14px")}>
              <div style={css("font:600 15px var(--font-mono);color:#E8D48B")}>{value}</div>
              <div style={css("font:400 11px var(--font-hanken);color:#8A8A80;margin-top:2px")}>{label}</div>
            </div>
          ))}
        </div>
        {live?.updatedAt && (
          <p style={css("font:400 11px var(--font-mono);color:#6B6B76;margin:14px 0 0")}>
            Actualizado: {new Date(live.updatedAt).toLocaleString("es-ES")}
          </p>
        )}
      </div>

      <div style={css("display:flex;flex-direction:column;gap:28px")}>
        {doc.sections.map((sec, i) => (
          <div key={i}>
            {sec.h && <h3 style={css("font:600 18px var(--font-hanken);color:#fff;margin:0 0 10px")}>{sec.h}</h3>}
            <div style={css("display:flex;flex-direction:column;gap:12px")}>
              {sec.p.map((para, j) => (
                <p key={j} style={css("font:400 15px/1.65 var(--font-hanken);color:#B8B8BD;margin:0")}>
                  {para}
                </p>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
