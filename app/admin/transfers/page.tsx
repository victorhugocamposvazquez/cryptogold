"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { css } from "@/lib/css";
import { StatusBadge } from "@/components/admin/StatusBadge";
import type { CryptohostTransfer } from "@/lib/cryptohost/types";
import { fmtN } from "@/lib/format";

export default function AdminTransfersPage() {
  const [transfers, setTransfers] = useState<CryptohostTransfer[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    fetch("/api/cryptohost/transfers?limit=100", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setTransfers(d.transfers ?? []))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div>
      <h1 style={css("font:700 32px var(--font-hanken);margin:0 0 8px;letter-spacing:-0.03em")}>Transferencias</h1>
      <p style={css("font:400 15px var(--font-hanken);color:#9A9AA0;margin:0 0 28px")}>
        Todas las operaciones procesadas por CRYPTOHOST en esta instancia.
      </p>

      <div style={css("background:#161616;border:1px solid rgba(255,255,255,0.08);border-radius:14px;overflow:hidden")}>
        {loading ? (
          <p style={css("padding:24px 20px;color:#9A9AA0;margin:0")}>Cargando…</p>
        ) : (
          <table style={css("width:100%;border-collapse:collapse;font:400 13px var(--font-hanken)")}>
            <thead>
              <tr style={css("color:#9A9AA0;text-align:left")}>
                <th style={css("padding:12px 20px;font-weight:500")}>ID</th>
                <th style={css("padding:12px 20px;font-weight:500")}>Tipo</th>
                <th style={css("padding:12px 20px;font-weight:500")}>Wallet</th>
                <th style={css("padding:12px 20px;font-weight:500")}>Pago</th>
                <th style={css("padding:12px 20px;font-weight:500")}>Recibido</th>
                <th style={css("padding:12px 20px;font-weight:500")}>Estado</th>
                <th style={css("padding:12px 20px;font-weight:500")}>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {transfers.length === 0 && (
                <tr>
                  <td colSpan={7} style={css("padding:24px 20px;color:#6B6B76")}>No hay transferencias registradas.</td>
                </tr>
              )}
              {transfers.map((t) => (
                <tr key={t.id} style={css("border-top:1px solid rgba(255,255,255,0.06)")}>
                  <td style={css("padding:12px 20px")}>
                    <Link href={`/admin/transfers/${t.id}`} style={css("color:#C9A227;text-decoration:none;font-family:var(--font-mono)")}>
                      {t.id}
                    </Link>
                  </td>
                  <td style={css("padding:12px 20px;color:#C8C8CE")}>{t.kind}</td>
                  <td style={css("padding:12px 20px;color:#9A9AA0;font-family:var(--font-mono);font-size:12px")}>
                    {t.wallet ? t.wallet.slice(0, 8) + "…" + t.wallet.slice(-4) : "—"}
                  </td>
                  <td style={css("padding:12px 20px;color:#C8C8CE")}>
                    {t.pay_amount != null && t.pay_asset ? fmtN(t.pay_amount, 2) + " " + t.pay_asset : "—"}
                  </td>
                  <td style={css("padding:12px 20px;color:#fff")}>
                    {t.receive_amount != null ? fmtN(t.receive_amount, 2) + " " + t.receive_asset : "—"}
                  </td>
                  <td style={css("padding:12px 20px")}>
                    <StatusBadge status={t.status} />
                  </td>
                  <td style={css("padding:12px 20px;color:#9A9AA0")}>{new Date(t.created_at).toLocaleString("es-ES")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
