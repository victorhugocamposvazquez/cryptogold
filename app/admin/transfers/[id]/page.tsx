"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { css } from "@/lib/css";
import { StatusBadge } from "@/components/admin/StatusBadge";
import type { CryptohostTransfer } from "@/lib/cryptohost/types";
import { fmtN, fmtUSD } from "@/lib/format";

export default function AdminTransferDetailPage() {
  const params = useParams();
  const id = String(params.id);
  const [transfer, setTransfer] = useState<CryptohostTransfer | null>(null);
  const [error, setError] = useState("");
  const [retrying, setRetrying] = useState(false);

  function load() {
    fetch(`/api/cryptohost/transfers/${id}`, { credentials: "include" })
      .then((r) => {
        if (!r.ok) throw new Error("not found");
        return r.json();
      })
      .then((d) => setTransfer(d.transfer))
      .catch(() => setError("Transferencia no encontrada"));
  }

  useEffect(() => {
    load();
  }, [id]);

  async function retry() {
    setRetrying(true);
    try {
      const res = await fetch(`/api/cryptohost/transfers/${id}/retry`, { method: "POST", credentials: "include" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setTransfer(data.transfer);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Error al reintentar");
    } finally {
      setRetrying(false);
    }
  }

  if (error) {
    return (
      <div>
        <Link href="/admin/transfers" style={css("color:#C9A227;text-decoration:none;font:500 14px var(--font-hanken)")}>
          ← Transferencias
        </Link>
        <p style={css("margin-top:24px;color:#E05252")}>{error}</p>
      </div>
    );
  }

  if (!transfer) {
    return <p style={css("color:#9A9AA0")}>Cargando…</p>;
  }

  const rows: [string, string][] = [
    ["ID", transfer.id],
    ["Estado", transfer.status],
    ["Tipo", transfer.kind],
    ["Wallet", transfer.wallet ?? "—"],
    ["Red", transfer.chain ?? "—"],
    ["Proveedor", transfer.provider ?? "—"],
    ["Pago", transfer.pay_amount != null && transfer.pay_asset ? fmtN(transfer.pay_amount, 4) + " " + transfer.pay_asset : "—"],
    ["Recibido", transfer.receive_amount != null ? fmtN(transfer.receive_amount, 4) + " " + transfer.receive_asset : "—"],
    ["Precio CGOLD", transfer.price_usd != null ? fmtUSD(transfer.price_usd) : "—"],
    ["Comisión", transfer.fee_usd != null ? fmtUSD(transfer.fee_usd) : "—"],
    ["Intentos", String(transfer.attempts)],
    ["Creada", new Date(transfer.created_at).toLocaleString("es-ES")],
    ["Confirmada", transfer.confirmed_at ? new Date(transfer.confirmed_at).toLocaleString("es-ES") : "—"],
  ];

  if (transfer.error) rows.push(["Error", transfer.error]);

  return (
    <div>
      <Link href="/admin/transfers" style={css("color:#C9A227;text-decoration:none;font:500 14px var(--font-hanken)")}>
        ← Transferencias
      </Link>
      <div style={css("display:flex;align-items:center;gap:12px;margin:20px 0 28px;flex-wrap:wrap")}>
        <h1 style={css("font:700 28px var(--font-mono);margin:0;letter-spacing:-0.02em")}>{transfer.id}</h1>
        <StatusBadge status={transfer.status} />
      </div>

      <div style={css("background:#161616;border:1px solid rgba(255,255,255,0.08);border-radius:14px;padding:8px 0;margin-bottom:24px;max-width:560px")}>
        {rows.map(([label, value]) => (
          <div
            key={label}
            style={css("display:flex;justify-content:space-between;padding:12px 20px;border-bottom:1px solid rgba(255,255,255,0.06);gap:16px")}
          >
            <span style={css("font:500 13px var(--font-hanken);color:#9A9AA0")}>{label}</span>
            <span style={css("font:400 13px var(--font-hanken);color:#fff;text-align:right;word-break:break-all")}>{value}</span>
          </div>
        ))}
      </div>

      {transfer.status === "failed" && (
        <button
          type="button"
          onClick={retry}
          disabled={retrying}
          style={css("background:#C9A227;color:#0D0D0D;border:none;border-radius:10px;padding:12px 20px;font:600 14px var(--font-hanken);cursor:pointer")}
        >
          {retrying ? "Reintentando…" : "Reintentar transferencia"}
        </button>
      )}
    </div>
  );
}
