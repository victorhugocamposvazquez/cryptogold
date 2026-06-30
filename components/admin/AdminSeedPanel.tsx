"use client";

import { useState } from "react";
import { css } from "@/lib/css";
import { DEFAULT_HISTORY_COUNT } from "@/lib/cryptohost/seed";

type SeedSummary = {
  count: number;
  confirmed: number;
  failed: number;
  oldest?: string;
  newest?: string;
};

export default function AdminSeedPanel() {
  const [count, setCount] = useState(DEFAULT_HISTORY_COUNT);
  const [seed, setSeed] = useState("");
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<SeedSummary | null>(null);
  const [message, setMessage] = useState("");

  async function generate() {
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/cryptohost/admin/seed", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          count,
          seed: seed.trim() ? Number(seed) : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al generar");
      setSummary(data.summary);
      setMessage(`Histórico regenerado: ${data.count.toLocaleString("es-ES")} operaciones · seed ${data.seed}`);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={css("background:#161616;border:1px solid rgba(255,255,255,0.08);border-radius:14px;padding:24px;margin-top:32px")}>
      <h2 style={css("font:600 18px var(--font-hanken);margin:0 0 8px")}>Generar histórico de liquidación</h2>
      <p style={css("font:400 14px var(--font-hanken);color:#9A9AA0;margin:0 0 20px;max-width:640px")}>
        Crea un registro de operaciones CRYPTOHOST con wallets, importes, redes y fechas distribuidas desde 2023.
        Se persiste en servidor y alimenta el feed público de la home.
      </p>

      <div style={css("display:flex;flex-wrap:wrap;gap:12px;margin-bottom:16px")}>
        <label style={css("display:flex;flex-direction:column;gap:6px;font:500 12px var(--font-hanken);color:#9A9AA0")}>
          Operaciones
          <input
            type="number"
            min={100}
            max={10000}
            value={count}
            onChange={(e) => setCount(Number(e.target.value) || DEFAULT_HISTORY_COUNT)}
            style={css("width:140px;background:#0D0D0D;border:1px solid rgba(255,255,255,0.12);border-radius:8px;padding:10px 12px;font:400 14px var(--font-hanken);color:#fff")}
          />
        </label>
        <label style={css("display:flex;flex-direction:column;gap:6px;font:500 12px var(--font-hanken);color:#9A9AA0")}>
          Seed (opcional)
          <input
            type="text"
            placeholder="Auto"
            value={seed}
            onChange={(e) => setSeed(e.target.value)}
            style={css("width:180px;background:#0D0D0D;border:1px solid rgba(255,255,255,0.12);border-radius:8px;padding:10px 12px;font:400 14px var(--font-mono);color:#fff")}
          />
        </label>
        <div style={css("display:flex;align-items:flex-end")}>
          <button
            type="button"
            onClick={generate}
            disabled={loading}
            style={css("background:#C9A227;color:#0D0D0D;border:none;border-radius:10px;padding:12px 20px;font:600 14px var(--font-hanken);cursor:pointer")}
          >
            {loading ? "Generando…" : "Regenerar histórico"}
          </button>
        </div>
      </div>

      {message && (
        <p style={css(`font:400 13px var(--font-hanken);margin:0 0 12px;color:${message.startsWith("Histórico") ? "#3DAA6D" : "#E05252"}`)}>
          {message}
        </p>
      )}

      {summary && (
        <div style={css("display:flex;flex-wrap:wrap;gap:16px;font:400 13px var(--font-hanken);color:#C8C8CE")}>
          <span>Confirmadas: {summary.confirmed.toLocaleString("es-ES")}</span>
          <span>Fallidas: {summary.failed}</span>
          {summary.newest && <span>Más reciente: {new Date(summary.newest).toLocaleString("es-ES")}</span>}
          {summary.oldest && <span>Más antigua: {new Date(summary.oldest).toLocaleDateString("es-ES")}</span>}
        </div>
      )}
    </div>
  );
}
