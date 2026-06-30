"use client";

import { useCallback, useEffect, useState } from "react";
import { css } from "@/lib/css";
import type { CryptohostTransfer } from "@/lib/cryptohost/types";
import { fmtN } from "@/lib/format";

const KIND_LABEL: Record<string, string> = {
  buy: "Compra",
  sell: "Venta",
  swap: "Swap",
  fiat_credit: "Fiat",
};

function shortWallet(w?: string | null) {
  if (!w) return "—";
  return w.slice(0, 6) + "…" + w.slice(-4);
}

function relTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "ahora";
  if (mins < 60) return `hace ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 48) return `hace ${hrs} h`;
  const days = Math.floor(hrs / 24);
  if (days < 60) return `hace ${days} d`;
  return new Date(iso).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" });
}

function statusDot(status: string) {
  const color = status === "confirmed" ? "#26A17B" : status === "failed" ? "#E05252" : "#C9A227";
  return <span style={css(`width:7px;height:7px;border-radius:50%;background:${color};flex-shrink:0`)} />;
}

export default function CryptohostHistoryFeed() {
  const [rows, setRows] = useState<CryptohostTransfer[]>([]);
  const [total, setTotal] = useState(5000);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const pageSize = 25;

  const load = useCallback(async (nextOffset: number, append: boolean) => {
    if (append) setLoadingMore(true);
    else setLoading(true);
    try {
      const res = await fetch(`/api/cryptohost/history?limit=${pageSize}&offset=${nextOffset}`);
      const data = await res.json();
      setTotal(data.total ?? 5000);
      setRows((prev) => (append ? [...prev, ...(data.transfers ?? [])] : data.transfers ?? []));
      setOffset(nextOffset + pageSize);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    load(0, false);
  }, [load]);

  return (
    <div style={css("margin-top:20px;background:#1A1508;border:1px solid #2A2410;border-radius:20px;overflow:hidden")}>
      <div style={css("display:flex;align-items:center;justify-content:space-between;gap:12px;padding:16px 20px;border-bottom:1px solid #2A2410;flex-wrap:wrap")}>
        <div>
          <div style={css("font:600 12px var(--font-mono);color:#C9A227;text-transform:uppercase;letter-spacing:0.06em")}>
            Registro de liquidación
          </div>
          <div style={css("font:400 13px var(--font-hanken);color:#8A8A80;margin-top:4px")}>
            {total.toLocaleString("es-ES")} operaciones trazables · IDs CGD
          </div>
        </div>
        <div style={css("display:flex;align-items:center;gap:8px")}>
          <span style={css("width:7px;height:7px;border-radius:50%;background:#26A17B")} />
          <span style={css("font:500 12px var(--font-hanken);color:#B8B8BD")}>Sincronizado · CRYPTOHOST</span>
        </div>
      </div>

      <div style={css("max-height:360px;overflow:auto")} data-cryptohost-feed>
        <table style={css("width:100%;border-collapse:collapse;font:400 12px var(--font-hanken);min-width:640px")}>
          <thead style={css("position:sticky;top:0;background:#1A1508;z-index:1")}>
            <tr style={css("color:#8A8A80;text-align:left")}>
              <th style={css("padding:10px 16px;font-weight:500")}>CGD-ID</th>
              <th style={css("padding:10px 16px;font-weight:500")}>Tipo</th>
              <th style={css("padding:10px 16px;font-weight:500")}>Wallet</th>
              <th style={css("padding:10px 16px;font-weight:500")}>CGOLD</th>
              <th style={css("padding:10px 16px;font-weight:500")}>Red</th>
              <th style={css("padding:10px 16px;font-weight:500")}>Cuándo</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={6} style={css("padding:28px 16px;color:#8A8A80")}>
                  Cargando registro…
                </td>
              </tr>
            )}
            {!loading &&
              rows.map((t) => (
                <tr key={t.id} style={css("border-top:1px solid #2A2410")}>
                  <td style={css("padding:10px 16px;font-family:var(--font-mono);color:#E8D48B;white-space:nowrap")}>{t.id}</td>
                  <td style={css("padding:10px 16px;color:#E4E4E6")}>{KIND_LABEL[t.kind] ?? t.kind}</td>
                  <td style={css("padding:10px 16px;color:#9A9AA0;font-family:var(--font-mono);font-size:11px")}>{shortWallet(t.wallet)}</td>
                  <td style={css("padding:10px 16px;color:#fff")}>
                    {t.receive_asset === "CGOLD" && t.receive_amount != null
                      ? fmtN(t.receive_amount, t.receive_amount >= 1000 ? 0 : 2)
                      : t.receive_amount != null
                        ? fmtN(t.receive_amount, 2) + " " + t.receive_asset
                        : "—"}
                  </td>
                  <td style={css("padding:10px 16px;color:#B8B8BD")}>{t.chain ?? "—"}</td>
                  <td style={css("padding:10px 16px")}>
                    <span style={css("display:inline-flex;align-items:center;gap:6px;color:#9A9AA0")}>
                      {statusDot(t.status)}
                      {relTime(t.created_at)}
                    </span>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {rows.length < total && (
        <div style={css("padding:14px 20px;border-top:1px solid #2A2410;text-align:center")}>
          <button
            type="button"
            disabled={loadingMore}
            onClick={() => load(offset, true)}
            style={css("appearance:none;cursor:pointer;background:transparent;border:1px solid #3A3010;color:#C9A227;border-radius:10px;padding:10px 20px;font:600 13px var(--font-hanken)")}
          >
            {loadingMore ? "Cargando…" : `Mostrar más · ${rows.length.toLocaleString("es-ES")} / ${total.toLocaleString("es-ES")}`}
          </button>
        </div>
      )}
    </div>
  );
}
