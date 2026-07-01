"use client";

import { useCallback, useEffect, useState } from "react";
import { css } from "@/lib/css";
import { fmtN } from "@/lib/format";
import { TOKEN_SYMBOL, TOKEN_SUPPLY_LABEL } from "@/lib/brand";
import { ALLOCATION_TARGETS, MINT_CATEGORIES } from "@/lib/token/mint-log";
import type { MintCategory, MintLogEntry, TokenStats } from "@/lib/token/types";

const QUICK_AMOUNTS = ["100000", "500000", "1000000", "5000000", "10000000"];

function StatBox({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div style={css("background:#161616;border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:16px 18px")}>
      <div style={css("font:500 12px var(--font-hanken);color:#9A9AA0;margin-bottom:6px")}>{label}</div>
      <div style={css("font:600 20px var(--font-mono);color:#E8D48B;letter-spacing:-0.02em")}>{value}</div>
      {sub && <div style={css("font:400 11px var(--font-hanken);color:#6B6B76;margin-top:4px")}>{sub}</div>}
    </div>
  );
}

export default function TokenAdminPanel() {
  const [stats, setStats] = useState<TokenStats | null>(null);
  const [mints, setMints] = useState<MintLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [minting, setMinting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<MintCategory>("marketing");
  const [note, setNote] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [statsRes, mintsRes] = await Promise.all([
        fetch("/api/token/stats"),
        fetch("/api/token/mint", { credentials: "include" }),
      ]);
      const statsData = await statsRes.json();
      if (!statsRes.ok) throw new Error(statsData.error || "Error cargando stats");
      setStats(statsData.stats);

      if (mintsRes.ok) {
        const mintsData = await mintsRes.json();
        setMints(mintsData.mints ?? []);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error de carga");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function submitMint(e: React.FormEvent) {
    e.preventDefault();
    setMinting(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/token/mint", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to, amount, category, note: note || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Mint fallido");
      setSuccess(`Mint OK · ${data.mint.id} · tx ${data.mint.txHash.slice(0, 10)}…`);
      setTo("");
      setAmount("");
      setNote("");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Mint fallido");
    } finally {
      setMinting(false);
    }
  }

  const explorerBase = stats?.explorer ?? "https://testnet.bscscan.com";

  return (
    <div>
      <div style={css("display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:28px;gap:16px;flex-wrap:wrap")}>
        <div>
          <h1 data-ops-h1 style={css("font:700 32px var(--font-hanken);margin:0 0 8px;letter-spacing:-0.03em")}>
            Gestión del token
          </h1>
          <p style={css("font:400 15px var(--font-hanken);color:#9A9AA0;margin:0;max-width:640px")}>
            Mint controlado de {TOKEN_SYMBOL} on-chain (cap {TOKEN_SUPPLY_LABEL}). Ideal para marketing, preventa o reserva de liquidez antes del pool.
          </p>
        </div>
        <button
          type="button"
          onClick={load}
          disabled={loading}
          style={css("appearance:none;cursor:pointer;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.12);color:#fff;border-radius:10px;padding:10px 16px;font:600 13px var(--font-hanken)")}
        >
          {loading ? "Actualizando…" : "Actualizar"}
        </button>
      </div>

      {error && (
        <div style={css("background:rgba(224,82,82,0.12);border:1px solid rgba(224,82,82,0.35);color:#ffb4b4;border-radius:12px;padding:14px 16px;margin-bottom:20px;font:500 14px var(--font-hanken)")}>
          {error}
        </div>
      )}
      {success && (
        <div style={css("background:rgba(38,161,123,0.12);border:1px solid rgba(38,161,123,0.35);color:#9dffd0;border-radius:12px;padding:14px 16px;margin-bottom:20px;font:500 14px var(--font-hanken)")}>
          {success}
        </div>
      )}

      {!stats?.configured && (
        <div style={css("background:#161616;border:1px solid rgba(201,162,39,0.35);border-radius:14px;padding:20px 22px;margin-bottom:24px")}>
          <div style={css("font:600 15px var(--font-hanken);color:#E8D48B;margin-bottom:8px")}>Contrato no desplegado</div>
          <p style={css("font:400 14px/1.55 var(--font-hanken);color:#9A9AA0;margin:0")}>
            Despliega el contrato v2 con mint en BNB testnet y configura{" "}
            <code style={css("font-family:var(--font-mono);color:#C9A227")}>NEXT_PUBLIC_CGOLD_BNB_TESTNET</code> y{" "}
            <code style={css("font-family:var(--font-mono);color:#C9A227")}>TOKEN_OWNER_PRIVATE_KEY</code> en el servidor.
          </p>
        </div>
      )}

      {stats?.configured && !stats.operatorConfigured && (
        <div style={css("background:#161616;border:1px solid rgba(255,255,255,0.1);border-radius:14px;padding:16px 18px;margin-bottom:24px;font:400 14px var(--font-hanken);color:#C8C8CE")}>
          Solo lectura: añade <code style={css("font-family:var(--font-mono);color:#C9A227")}>TOKEN_OWNER_PRIVATE_KEY</code> (owner del contrato) para habilitar mint desde el backoffice.
        </div>
      )}

      {stats?.configured && stats.operatorConfigured && !stats.operatorIsOwner && (
        <div style={css("background:rgba(224,82,82,0.1);border:1px solid rgba(224,82,82,0.3);border-radius:14px;padding:16px 18px;margin-bottom:24px;font:400 14px var(--font-hanken);color:#ffb4b4")}>
          La clave configurada no es owner del contrato. Owner on-chain:{" "}
          <span style={css("font-family:var(--font-mono)")}>{stats.owner}</span>
        </div>
      )}

      {stats && (
        <div style={css("display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:12px;margin-bottom:28px")}>
          <StatBox label="Minteado" value={fmtN(Number(stats.totalMinted), 0) + " " + TOKEN_SYMBOL} sub={`${stats.mintPercentUsed.toFixed(2)}% del cap`} />
          <StatBox label="Disponible para mint" value={fmtN(Number(stats.remainingMintable), 0)} />
          <StatBox label="Cap máximo" value={TOKEN_SUPPLY_LABEL} />
          {stats.treasuryBalance != null && (
            <StatBox label="Balance tesorería" value={fmtN(Number(stats.treasuryBalance), 0)} sub={stats.treasuryAddress?.slice(0, 10) + "…"} />
          )}
        </div>
      )}

      <div data-2col style={css("display:grid;grid-template-columns:1.1fr 0.9fr;gap:24px;align-items:start;margin-bottom:28px")}>
        <div style={css("background:#161616;border:1px solid rgba(255,255,255,0.08);border-radius:14px;padding:22px")}>
          <h2 style={css("font:600 18px var(--font-hanken);margin:0 0 16px")}>Mint a wallet</h2>
          <form onSubmit={submitMint} style={css("display:flex;flex-direction:column;gap:14px")}>
            <label>
              <span style={css("display:block;font:500 12px var(--font-hanken);color:#9A9AA0;margin-bottom:6px")}>Wallet destino</span>
              <input
                value={to}
                onChange={(e) => setTo(e.target.value)}
                placeholder="0x…"
                required
                style={css("width:100%;box-sizing:border-box;background:#0D0D0D;border:1px solid rgba(255,255,255,0.12);border-radius:10px;padding:12px 14px;font:400 14px var(--font-mono);color:#fff")}
              />
            </label>

            <label>
              <span style={css("display:block;font:500 12px var(--font-hanken);color:#9A9AA0;margin-bottom:6px")}>Cantidad ({TOKEN_SYMBOL})</span>
              <input
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="1000000"
                inputMode="decimal"
                required
                style={css("width:100%;box-sizing:border-box;background:#0D0D0D;border:1px solid rgba(255,255,255,0.12);border-radius:10px;padding:12px 14px;font:400 14px var(--font-mono);color:#fff")}
              />
            </label>

            <div style={css("display:flex;flex-wrap:gap:6px")}>
              {QUICK_AMOUNTS.map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setAmount(v)}
                  style={css("appearance:none;cursor:pointer;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);color:#C8C8CE;border-radius:999px;padding:6px 10px;font:600 11px var(--font-mono)")}
                >
                  {fmtN(Number(v), 0)}
                </button>
              ))}
            </div>

            <label>
              <span style={css("display:block;font:500 12px var(--font-hanken);color:#9A9AA0;margin-bottom:6px")}>Categoría</span>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as MintCategory)}
                style={css("width:100%;box-sizing:border-box;background:#0D0D0D;border:1px solid rgba(255,255,255,0.12);border-radius:10px;padding:12px 14px;font:400 14px var(--font-hanken);color:#fff")}
              >
                {MINT_CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label} — {c.hint}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span style={css("display:block;font:500 12px var(--font-hanken);color:#9A9AA0;margin-bottom:6px")}>Nota (opcional)</span>
              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ej. campaña Q2 influencers"
                style={css("width:100%;box-sizing:border-box;background:#0D0D0D;border:1px solid rgba(255,255,255,0.12);border-radius:10px;padding:12px 14px;font:400 14px var(--font-hanken);color:#fff")}
              />
            </label>

            <button
              type="submit"
              disabled={minting || !stats?.configured || !stats.operatorIsOwner}
              style={css(
                `appearance:none;cursor:${minting || !stats?.operatorIsOwner ? "not-allowed" : "pointer"};background:${stats?.operatorIsOwner ? "#C9A227" : "#3A3010"};color:#0D0D0D;border:none;border-radius:10px;padding:14px 20px;font:600 15px var(--font-hanken);opacity:${minting ? 0.7 : 1}`
              )}
            >
              {minting ? "Firmando transacción…" : `Mint ${TOKEN_SYMBOL} on-chain`}
            </button>
          </form>
        </div>

        <div style={css("display:flex;flex-direction:column;gap:16px")}>
          <div style={css("background:#161616;border:1px solid rgba(255,255,255,0.08);border-radius:14px;padding:20px")}>
            <div style={css("font:600 14px var(--font-hanken);margin-bottom:12px")}>Tokenomics objetivo</div>
            {ALLOCATION_TARGETS.map((a) => (
              <div key={a.label} style={css("display:flex;justify-content:space-between;gap:8px;padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.06);font:400 13px var(--font-hanken);color:#C8C8CE")}>
                <span>{a.label}</span>
                <span style={css("font-family:var(--font-mono);color:#E8D48B")}>{a.pct}% · {a.tokens}</span>
              </div>
            ))}
          </div>

          {stats?.contractAddress && (
            <div style={css("background:#161616;border:1px solid rgba(255,255,255,0.08);border-radius:14px;padding:20px;font:400 13px var(--font-hanken);color:#9A9AA0")}>
              <div style={css("font:600 14px var(--font-hanken);color:#fff;margin-bottom:10px")}>Contrato · {stats.network}</div>
              <div style={css("font-family:var(--font-mono);font-size:12px;word-break:break-all;color:#C9A227;margin-bottom:8px")}>{stats.contractAddress}</div>
              {stats.owner && (
                <div style={css("margin-bottom:6px")}>
                  Owner: <span style={css("font-family:var(--font-mono);color:#C8C8CE")}>{stats.owner.slice(0, 10)}…{stats.owner.slice(-6)}</span>
                </div>
              )}
              <a
                href={`${explorerBase}/token/${stats.contractAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                style={css("color:#C9A227;text-decoration:none;font-weight:600")}
              >
                Ver en BscScan →
              </a>
            </div>
          )}
        </div>
      </div>

      <div style={css("background:#161616;border:1px solid rgba(255,255,255,0.08);border-radius:14px;overflow:hidden")}>
        <div style={css("padding:16px 20px;border-bottom:1px solid rgba(255,255,255,0.08);font:600 16px var(--font-hanken)")}>
          Mints desde este backoffice (sesión)
        </div>
        {mints.length === 0 ? (
          <p style={css("padding:20px;margin:0;color:#6B6B76;font:400 14px var(--font-hanken)")}>Aún no hay mints registrados en esta instancia.</p>
        ) : (
          <div data-admin-table-wrap data-table-wrap>
            <table style={css("width:100%;border-collapse:collapse;font:400 13px var(--font-hanken);min-width:640px")}>
              <thead>
                <tr style={css("color:#9A9AA0;text-align:left")}>
                  <th style={css("padding:12px 20px;font-weight:500")}>ID</th>
                  <th style={css("padding:12px 20px;font-weight:500")}>Categoría</th>
                  <th style={css("padding:12px 20px;font-weight:500")}>Destino</th>
                  <th style={css("padding:12px 20px;font-weight:500")}>Cantidad</th>
                  <th style={css("padding:12px 20px;font-weight:500")}>Tx</th>
                  <th style={css("padding:12px 20px;font-weight:500")}>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {mints.map((m) => (
                  <tr key={m.id} style={css("border-top:1px solid rgba(255,255,255,0.06)")}>
                    <td style={css("padding:12px 20px;font-family:var(--font-mono);color:#C9A227")}>{m.id}</td>
                    <td style={css("padding:12px 20px;color:#C8C8CE")}>{m.category}</td>
                    <td style={css("padding:12px 20px;font-family:var(--font-mono);font-size:12px;color:#9A9AA0")}>{m.to.slice(0, 8)}…{m.to.slice(-4)}</td>
                    <td style={css("padding:12px 20px;color:#fff")}>{fmtN(Number(m.amount), 0)} {TOKEN_SYMBOL}</td>
                    <td style={css("padding:12px 20px")}>
                      <a href={`${explorerBase}/tx/${m.txHash}`} target="_blank" rel="noopener noreferrer" style={css("color:#C9A227;text-decoration:none;font-family:var(--font-mono);font-size:11px")}>
                        {m.txHash.slice(0, 10)}…
                      </a>
                    </td>
                    <td style={css("padding:12px 20px;color:#9A9AA0")}>{new Date(m.createdAt).toLocaleString("es-ES")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
