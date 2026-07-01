"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { css } from "@/lib/css";
import { CRYPTOHOST_TRANSFERS, OPS_CENTER_NAME, TOKEN_SYMBOL } from "@/lib/brand";
import type { CryptohostTransfer, TransferKind } from "@/lib/cryptohost/types";
import { fmtN } from "@/lib/format";

const KIND_LABEL: Record<string, string> = {
  buy: "Compra",
  sell: "Venta",
  swap: "Swap",
  fiat_credit: "Fiat",
};

const FILTERS: { id: "all" | TransferKind; label: string }[] = [
  { id: "all", label: "Todas" },
  { id: "buy", label: "Compras" },
  { id: "swap", label: "Swaps" },
  { id: "fiat_credit", label: "Fiat" },
  { id: "sell", label: "Ventas" },
];

function shortWallet(w?: string | null) {
  if (!w) return "—";
  return w.slice(0, 6) + "…" + w.slice(-4);
}

function relTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const sec = Math.floor(diff / 1000);
  if (sec < 45) return "ahora";
  const mins = Math.floor(sec / 60);
  if (mins < 60) return `hace ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 48) return `hace ${hrs} h`;
  const days = Math.floor(hrs / 24);
  if (days < 60) return `hace ${days} d`;
  return new Date(iso).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" });
}

function formatAmount(t: CryptohostTransfer) {
  if (t.receive_asset === "CGOLD" && t.receive_amount != null) {
    return fmtN(t.receive_amount, t.receive_amount >= 1000 ? 0 : 2) + " " + TOKEN_SYMBOL;
  }
  if (t.receive_amount != null) return fmtN(t.receive_amount, 2) + " " + t.receive_asset;
  return "—";
}

function Ticker({ rows }: { rows: CryptohostTransfer[] }) {
  const items = rows.slice(0, 12);
  if (!items.length) return null;
  const loop = [...items, ...items];

  return (
    <div style={css("border-bottom:1px solid #2A2410;background:#12100A;overflow:hidden")}>
      <div style={css("display:inline-flex;align-items:center;gap:28px;padding:10px 0;animation:scrollx 90s linear infinite;will-change:transform")}>
        {loop.map((t, i) => (
          <span key={t.id + i} style={css("display:inline-flex;align-items:center;gap:10px;white-space:nowrap;font:400 12px var(--font-hanken);color:#B8B8BD")}>
            <span style={css("font:600 11px var(--font-mono);color:#E8D48B")}>{t.id}</span>
            <span style={css("color:#8A8A80")}>·</span>
            <span style={css("font-family:var(--font-mono);color:#E4E4E6")}>{shortWallet(t.wallet)}</span>
            <span style={css("color:#8A8A80")}>{KIND_LABEL[t.kind] ?? t.kind}</span>
            <span style={css("color:#fff;font-weight:500")}>{formatAmount(t)}</span>
            <span style={css("color:#8A8A80")}>{t.chain}</span>
            <span style={css("color:#26A17B")}>✓</span>
            <span style={css("color:#6B6B76")}>{relTime(t.created_at)}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

type Stats = {
  historicalTotal?: number;
  registryTotal?: number;
  last24h?: number;
  avgConfirmMs?: number;
  uptimePct?: number;
  confirmed?: number;
};

export default function CryptohostMonitor({ compact = false }: { compact?: boolean }) {
  const [rows, setRows] = useState<CryptohostTransfer[]>([]);
  const [total, setTotal] = useState(5000);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [filter, setFilter] = useState<"all" | TransferKind>("all");
  const [query, setQuery] = useState("");
  const [stats, setStats] = useState<Stats>({});
  const pageSize = compact ? 20 : 30;

  const loadStats = useCallback(async () => {
    try {
      const res = await fetch("/api/cryptohost/stats");
      if (res.ok) setStats((await res.json()).stats ?? {});
    } catch {
      /* ok */
    }
  }, []);

  const load = useCallback(
    async (nextOffset: number, append: boolean) => {
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
    },
    [pageSize]
  );

  useEffect(() => {
    load(0, false);
    loadStats();
    const id = setInterval(() => {
      load(0, false);
      loadStats();
    }, 12000);
    return () => clearInterval(id);
  }, [load, loadStats]);

  const filtered = useMemo(() => {
    let list = rows;
    if (filter !== "all") list = list.filter((t) => t.kind === filter);
    if (query.trim()) {
      const q = query.trim().toUpperCase();
      list = list.filter((t) => t.id.toUpperCase().includes(q) || (t.wallet ?? "").toLowerCase().includes(q.toLowerCase()));
    }
    return list;
  }, [rows, filter, query]);

  const totalLabel = (stats.historicalTotal ?? 5_005_000).toLocaleString("es-ES");
  const registry = (stats.registryTotal ?? total).toLocaleString("es-ES");

  return (
    <div style={css(`background:#0D0D0D;border:1px solid #2A2410;border-radius:${compact ? "20px" : "24px"};overflow:hidden`)}>
      {/* Header */}
      <div data-monitor-header style={css("padding:18px 22px 14px;border-bottom:1px solid #2A2410")}>
        <div style={css("display:flex;align-items:flex-start;justify-content:space-between;gap:16px;flex-wrap:wrap")}>
          <div>
            <div style={css("display:flex;align-items:center;gap:8px;margin-bottom:6px")}>
              <span style={css("width:7px;height:7px;border-radius:50%;background:#26A17B;box-shadow:0 0 8px #26A17B")} />
              <span style={css("font:600 11px var(--font-mono);color:#C9A227;text-transform:uppercase;letter-spacing:0.08em")}>
                Liquidación en tiempo real
              </span>
            </div>
            <h3 style={css(`font:600 ${compact ? "20px" : "26px"} var(--font-hanken);color:#fff;margin:0 0 4px;letter-spacing:-0.02em`)}>
              Monitor {OPS_CENTER_NAME}
            </h3>
            <p style={css("font:400 13px var(--font-hanken);color:#8A8A80;margin:0")}>
              {CRYPTOHOST_TRANSFERS} operaciones históricas · {registry} visibles en registro · IDs trazables CGD
            </p>
          </div>
        </div>

        <div style={css("display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:10px;margin-top:16px")}>
          {[
            [totalLabel, "Transferencias totales"],
            [registry, "En registro"],
            [String(stats.last24h ?? "—"), "Últimas 24 h"],
            [stats.avgConfirmMs ? (stats.avgConfirmMs / 1000).toFixed(1) + " s" : "< 3 s", "Liquidación media"],
            [stats.uptimePct ? stats.uptimePct + "%" : "99,9%", "Uptime"],
          ].map(([v, l]) => (
            <div key={l} style={css("background:#1A1508;border:1px solid #2A2410;border-radius:10px;padding:10px 12px")}>
              <div style={css("font:600 16px var(--font-mono);color:#E8D48B")}>{v}</div>
              <div style={css("font:400 11px var(--font-hanken);color:#8A8A80;margin-top:2px")}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      <Ticker rows={rows} />

      {/* Filters */}
      <div data-monitor-filters style={css("display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 16px;border-bottom:1px solid #2A2410;flex-wrap:wrap")}>
        <div style={css("display:flex;gap:6px;flex-wrap:wrap")}>
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              style={css(
                `appearance:none;cursor:pointer;border-radius:999px;padding:6px 12px;font:600 12px var(--font-hanken);border:1px solid ${filter === f.id ? "#C9A227" : "#2A2410"};background:${filter === f.id ? "#C9A227" : "transparent"};color:${filter === f.id ? "#0D0D0D" : "#B8B8BD"}`
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        <input
          type="search"
          data-monitor-search
          placeholder="Buscar CGD-ID o wallet…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={css("width:min(220px,100%);background:#1A1508;border:1px solid #2A2410;border-radius:10px;padding:8px 12px;font:400 12px var(--font-hanken);color:#fff")}
        />
      </div>

      {/* Table — desktop */}
      <div data-cryptohost-table-wrap style={css(`overflow:auto;${compact ? "max-height:340px" : "max-height:480px"}`)}>
        <table style={css("width:100%;border-collapse:collapse;font:400 12px var(--font-hanken);min-width:720px")}>
          <thead style={css("position:sticky;top:0;background:#0D0D0D;z-index:1")}>
            <tr style={css("color:#8A8A80;text-align:left")}>
              <th style={css("padding:10px 16px;font-weight:500")}>CGD-ID</th>
              <th style={css("padding:10px 16px;font-weight:500")}>Operación</th>
              <th style={css("padding:10px 16px;font-weight:500")}>Wallet</th>
              <th style={css("padding:10px 16px;font-weight:500")}>Importe</th>
              <th style={css("padding:10px 16px;font-weight:500")}>Red</th>
              <th style={css("padding:10px 16px;font-weight:500")}>Estado</th>
              <th style={css("padding:10px 16px;font-weight:500")}>Hora</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={7} style={css("padding:32px 16px;color:#8A8A80;text-align:center")}>
                  Sincronizando registro {OPS_CENTER_NAME}…
                </td>
              </tr>
            )}
            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={7} style={css("padding:32px 16px;color:#8A8A80;text-align:center")}>
                  Sin resultados para este filtro.
                </td>
              </tr>
            )}
            {!loading &&
              filtered.map((t) => (
                <tr key={t.id} style={css("border-top:1px solid #1A1508")}>
                  <td style={css("padding:10px 16px;font-family:var(--font-mono);color:#E8D48B;white-space:nowrap")}>{t.id}</td>
                  <td style={css("padding:10px 16px;color:#E4E4E6")}>{KIND_LABEL[t.kind] ?? t.kind}</td>
                  <td style={css("padding:10px 16px;color:#9A9AA0;font-family:var(--font-mono);font-size:11px")}>{shortWallet(t.wallet)}</td>
                  <td style={css("padding:10px 16px;color:#fff")}>{formatAmount(t)}</td>
                  <td style={css("padding:10px 16px;color:#B8B8BD")}>{t.chain ?? "—"}</td>
                  <td style={css("padding:10px 16px")}>
                    <span
                      style={css(
                        `display:inline-flex;align-items:center;gap:5px;font:600 10px var(--font-mono);text-transform:uppercase;color:${t.status === "confirmed" ? "#26A17B" : t.status === "failed" ? "#E05252" : "#C9A227"}`
                      )}
                    >
                      <span style={css(`width:6px;height:6px;border-radius:50%;background:${t.status === "confirmed" ? "#26A17B" : t.status === "failed" ? "#E05252" : "#C9A227"}`)} />
                      {t.status === "confirmed" ? "Confirmado" : t.status === "failed" ? "Fallido" : "Procesando"}
                    </span>
                  </td>
                  <td style={css("padding:10px 16px;color:#9A9AA0")}>{relTime(t.created_at)}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Cards — mobile */}
      <div data-cryptohost-cards style={css(`${compact ? "max-height:340px" : "max-height:480px"};overflow:auto`)}>
        {loading && (
          <div style={css("padding:32px 16px;color:#8A8A80;text-align:center;font:400 13px var(--font-hanken)")}>
            Sincronizando registro {OPS_CENTER_NAME}…
          </div>
        )}
        {!loading && filtered.length === 0 && (
          <div style={css("padding:32px 16px;color:#8A8A80;text-align:center;font:400 13px var(--font-hanken)")}>
            Sin resultados para este filtro.
          </div>
        )}
        {!loading &&
          filtered.map((t) => (
            <div key={t.id} style={css("padding:14px 16px;border-top:1px solid #1A1508")}>
              <div style={css("display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:8px")}>
                <span style={css("font:600 12px var(--font-mono);color:#E8D48B")}>{t.id}</span>
                <span
                  style={css(
                    `font:600 10px var(--font-mono);text-transform:uppercase;color:${t.status === "confirmed" ? "#26A17B" : t.status === "failed" ? "#E05252" : "#C9A227"}`
                  )}
                >
                  {t.status === "confirmed" ? "Confirmado" : t.status === "failed" ? "Fallido" : "Procesando"}
                </span>
              </div>
              <div style={css("display:grid;grid-template-columns:1fr 1fr;gap:6px 12px;font:400 12px var(--font-hanken)")}>
                <div><span style={css("color:#6B6B76")}>Operación</span><br /><span style={css("color:#E4E4E6")}>{KIND_LABEL[t.kind] ?? t.kind}</span></div>
                <div><span style={css("color:#6B6B76")}>Importe</span><br /><span style={css("color:#fff")}>{formatAmount(t)}</span></div>
                <div><span style={css("color:#6B6B76")}>Wallet</span><br /><span style={css("color:#9A9AA0;font-family:var(--font-mono);font-size:11px")}>{shortWallet(t.wallet)}</span></div>
                <div><span style={css("color:#6B6B76")}>Red</span><br /><span style={css("color:#B8B8BD")}>{t.chain ?? "—"}</span></div>
              </div>
              <div style={css("margin-top:8px;font:400 11px var(--font-hanken);color:#9A9AA0")}>{relTime(t.created_at)}</div>
            </div>
          ))}
      </div>

      {rows.length < total && !query && filter === "all" && (
        <div style={css("padding:14px 20px;border-top:1px solid #2A2410;text-align:center")}>
          <button
            type="button"
            disabled={loadingMore}
            onClick={() => load(offset, true)}
            style={css("appearance:none;cursor:pointer;background:transparent;border:1px solid #3A3010;color:#C9A227;border-radius:10px;padding:10px 22px;font:600 13px var(--font-hanken)")}
          >
            {loadingMore ? "Cargando…" : `Cargar más · ${rows.length.toLocaleString("es-ES")} / ${total.toLocaleString("es-ES")}`}
          </button>
        </div>
      )}

      {!compact && (
        <div style={css("padding:12px 20px;border-top:1px solid #2A2410;background:#12100A;font:400 11px var(--font-hanken);color:#6B6B76;text-align:center")}>
          Cada fila corresponde a una liquidación procesada por {OPS_CENTER_NAME}. Los IDs CGD son únicos y auditables.
        </div>
      )}
    </div>
  );
}
