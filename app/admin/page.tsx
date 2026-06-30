"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { css } from "@/lib/css";
import { StatCard, StatusBadge } from "@/components/admin/StatusBadge";
import type { CryptohostTransfer, ServiceStatus } from "@/lib/cryptohost/types";
import { fmtN } from "@/lib/format";

export default function AdminDashboard() {
  const [status, setStatus] = useState<ServiceStatus | null>(null);
  const [recent, setRecent] = useState<CryptohostTransfer[]>([]);

  useEffect(() => {
    fetch("/api/cryptohost/status")
      .then((r) => r.json())
      .then(setStatus)
      .catch(() => {});
    fetch("/api/cryptohost/transfers?recent=8")
      .then((r) => r.json())
      .then((d) => setRecent(d.transfers ?? []))
      .catch(() => {});
  }, []);

  const stats = status?.stats;

  return (
    <div>
      <div style={css("display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:32px;gap:16px;flex-wrap:wrap")}>
        <div>
          <h1 style={css("font:700 32px var(--font-hanken);margin:0 0 8px;letter-spacing:-0.03em")}>Panel de control</h1>
          <p style={css("font:400 15px var(--font-hanken);color:#9A9AA0;margin:0")}>
            Motor de liquidación CryptoGold · servicio CRYPTOHOST
          </p>
        </div>
        {status && (
          <div style={css("text-align:right")}>
            <StatusBadge status={status.status} />
            <p style={css("font:400 13px var(--font-hanken);color:#9A9AA0;margin:8px 0 0;max-width:280px")}>{status.message}</p>
          </div>
        )}
      </div>

      <div style={css("display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:16px;margin-bottom:32px")}>
        <StatCard label="Transferencias totales" value={stats ? fmtN(stats.historicalTotal, 0) : "—"} sub="5M históricas + sesión" />
        <StatCard label="Sesión actual" value={stats ? String(stats.sessionTotal) : "—"} />
        <StatCard label="Confirmadas" value={stats ? String(stats.confirmed) : "—"} />
        <StatCard label="Últimas 24 h" value={stats ? String(stats.last24h) : "—"} />
        <StatCard label="Tiempo medio" value={stats ? `${(stats.avgConfirmMs / 1000).toFixed(1)} s` : "—"} />
        <StatCard label="Uptime" value={stats ? `${stats.uptimePct}%` : "—"} />
      </div>

      <div style={css("background:#161616;border:1px solid rgba(255,255,255,0.08);border-radius:14px;overflow:hidden")}>
        <div style={css("padding:16px 20px;border-bottom:1px solid rgba(255,255,255,0.08);display:flex;justify-content:space-between;align-items:center")}>
          <h2 style={css("font:600 16px var(--font-hanken);margin:0")}>Actividad reciente</h2>
          <Link href="/admin/transfers" style={css("font:500 13px var(--font-hanken);color:#C9A227;text-decoration:none")}>
            Ver todas →
          </Link>
        </div>
        <table style={css("width:100%;border-collapse:collapse;font:400 13px var(--font-hanken)")}>
          <thead>
            <tr style={css("color:#9A9AA0;text-align:left")}>
              <th style={css("padding:12px 20px;font-weight:500")}>ID</th>
              <th style={css("padding:12px 20px;font-weight:500")}>Tipo</th>
              <th style={css("padding:12px 20px;font-weight:500")}>Estado</th>
              <th style={css("padding:12px 20px;font-weight:500")}>Importe</th>
              <th style={css("padding:12px 20px;font-weight:500")}>Fecha</th>
            </tr>
          </thead>
          <tbody>
            {recent.length === 0 && (
              <tr>
                <td colSpan={5} style={css("padding:24px 20px;color:#6B6B76")}>
                  Sin transferencias en esta sesión. Las compras del sitio aparecerán aquí.
                </td>
              </tr>
            )}
            {recent.map((t) => (
              <tr key={t.id} style={css("border-top:1px solid rgba(255,255,255,0.06)")}>
                <td style={css("padding:12px 20px")}>
                  <Link href={`/admin/transfers/${t.id}`} style={css("color:#C9A227;text-decoration:none;font-family:var(--font-mono)")}>
                    {t.id}
                  </Link>
                </td>
                <td style={css("padding:12px 20px;color:#C8C8CE")}>{t.kind}</td>
                <td style={css("padding:12px 20px")}>
                  <StatusBadge status={t.status} />
                </td>
                <td style={css("padding:12px 20px;color:#fff")}>
                  {t.receive_amount != null ? fmtN(t.receive_amount, 2) + " " + t.receive_asset : "—"}
                </td>
                <td style={css("padding:12px 20px;color:#9A9AA0")}>
                  {new Date(t.created_at).toLocaleString("es-ES")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}
