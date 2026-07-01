"use client";

import { useState } from "react";
import Link from "next/link";
import { css } from "@/lib/css";
import { OPS_CENTER_NAME, TOKEN_SYMBOL } from "@/lib/brand";
import type { CreateTransferInput, CryptohostTransfer, TransferKind } from "@/lib/cryptohost/types";
import { fmtN } from "@/lib/format";

const CHAINS = ["BNB Chain", "Ethereum", "Polygon", "Solana"];
const PAY_ASSETS = ["USDT", "USDC", "ETH", "BTC", "USD", "EUR"];
const KINDS: { value: TransferKind; label: string }[] = [
  { value: "buy", label: "Compra cripto" },
  { value: "fiat_credit", label: "Compra fiat (tarjeta)" },
  { value: "swap", label: "Swap" },
  { value: "sell", label: "Venta" },
];

function randomWallet() {
  const hex = "0123456789abcdef";
  let w = "0x";
  for (let i = 0; i < 40; i++) w += hex[Math.floor(Math.random() * 16)];
  return w;
}

type Props = {
  onCreated?: (t: CryptohostTransfer) => void;
  compact?: boolean;
};

export default function NewTransferForm({ onCreated, compact }: Props) {
  const [kind, setKind] = useState<TransferKind>("buy");
  const [wallet, setWallet] = useState("");
  const [payAsset, setPayAsset] = useState("USDT");
  const [payAmount, setPayAmount] = useState("1000");
  const [receiveAmount, setReceiveAmount] = useState("280");
  const [chain, setChain] = useState("BNB Chain");
  const [provider, setProvider] = useState(OPS_CENTER_NAME);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [last, setLast] = useState<CryptohostTransfer | null>(null);

  function autofill() {
    setWallet(randomWallet());
    const k = KINDS[Math.floor(Math.random() * KINDS.length)].value;
    setKind(k);
    setChain(CHAINS[Math.floor(Math.random() * CHAINS.length)]);
    const pay = k === "fiat_credit" ? "USD" : PAY_ASSETS[Math.floor(Math.random() * 4)];
    setPayAsset(pay);
    const pAmt = pay === "BTC" ? (Math.random() * 0.5 + 0.01).toFixed(4) : pay === "ETH" ? (Math.random() * 5 + 0.2).toFixed(3) : String(Math.floor(Math.random() * 180000) + 500);
    setPayAmount(pAmt);
    setReceiveAmount(String(Math.floor(Math.random() * 400000) + 800));
    setProvider(k === "fiat_credit" ? (Math.random() > 0.5 ? "Transak" : "MoonPay") : OPS_CENTER_NAME);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      let priceUsd = 3.34;
      try {
        const g = await fetch("/api/gold");
        const d = await g.json();
        priceUsd = Number(d.usdPerOz) * 0.001;
      } catch {
        /* fallback */
      }

      const body: CreateTransferInput = {
        kind,
        wallet: wallet.trim() || randomWallet(),
        pay_asset: payAsset,
        pay_amount: Number(payAmount) || 0,
        receive_asset: "CGOLD",
        receive_amount: Number(receiveAmount) || 0,
        fee_usd: Number(receiveAmount) * priceUsd * 0.012,
        price_usd: priceUsd,
        provider,
        chain,
      };

      const res = await fetch("/api/cryptohost/transfers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al registrar");

      setLast(data.transfer);
      onCreated?.(data.transfer);
      if (!wallet.trim()) setWallet(body.wallet!);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = css(
    "width:100%;box-sizing:border-box;background:#0D0D0D;border:1px solid rgba(255,255,255,0.12);border-radius:8px;padding:10px 12px;font:400 14px var(--font-hanken);color:#fff"
  );
  const labelStyle = css("display:block;font:500 12px var(--font-hanken);color:#9A9AA0;margin-bottom:6px");

  return (
    <div style={css(`background:#161616;border:1px solid rgba(255,255,255,0.08);border-radius:14px;padding:${compact ? "20px" : "24px"}`)}>
      <div style={css("display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:20px;flex-wrap:wrap")}>
        <div>
          <h2 style={css(`font:600 ${compact ? "16px" : "18px"} var(--font-hanken);margin:0 0 6px;color:#fff`)}>
            Nueva transferencia
          </h2>
          <p style={css("font:400 13px var(--font-hanken);color:#9A9AA0;margin:0")}>
            Registra una liquidación en {OPS_CENTER_NAME}. Aparecerá al instante en el monitor con ID CGD.
          </p>
        </div>
        <button
          type="button"
          onClick={autofill}
          style={css("appearance:none;cursor:pointer;background:transparent;border:1px solid rgba(255,255,255,0.15);color:#C9A227;border-radius:8px;padding:8px 14px;font:600 12px var(--font-hanken);white-space:nowrap")}
        >
          Rellenar automático
        </button>
      </div>

      <form data-admin-form onSubmit={submit} style={css("display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:14px")}>
        <label style={css("grid-column:span 1")}>
          <span style={labelStyle}>Tipo</span>
          <select value={kind} onChange={(e) => setKind(e.target.value as TransferKind)} style={inputStyle}>
            {KINDS.map((k) => (
              <option key={k.value} value={k.value}>
                {k.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span style={labelStyle}>Red</span>
          <select value={chain} onChange={(e) => setChain(e.target.value)} style={inputStyle}>
            {CHAINS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span style={labelStyle}>Proveedor</span>
          <input value={provider} onChange={(e) => setProvider(e.target.value)} style={inputStyle} />
        </label>
        <label style={css("grid-column:1/-1")}>
          <span style={labelStyle}>Wallet destino</span>
          <input value={wallet} onChange={(e) => setWallet(e.target.value)} placeholder="0x… (vacío = generar)" style={{ ...inputStyle, fontFamily: "var(--font-mono)", fontSize: 13 }} />
        </label>
        <label>
          <span style={labelStyle}>Activo de pago</span>
          <select value={payAsset} onChange={(e) => setPayAsset(e.target.value)} style={inputStyle}>
            {PAY_ASSETS.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span style={labelStyle}>Importe pagado</span>
          <input type="number" min="0" step="any" value={payAmount} onChange={(e) => setPayAmount(e.target.value)} style={inputStyle} />
        </label>
        <label>
          <span style={labelStyle}>{TOKEN_SYMBOL} acreditado</span>
          <input type="number" min="0" step="any" value={receiveAmount} onChange={(e) => setReceiveAmount(e.target.value)} style={inputStyle} />
        </label>
        <div style={css("grid-column:1/-1;display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-top:4px")}>
          <button
            type="submit"
            disabled={loading}
            style={css("appearance:none;cursor:pointer;background:#C9A227;color:#0D0D0D;border:none;border-radius:10px;padding:12px 22px;font:600 14px var(--font-hanken)")}
          >
            {loading ? "Liquidando…" : "Registrar liquidación"}
          </button>
          {error && <span style={css("font:400 13px var(--font-hanken);color:#E05252")}>{error}</span>}
        </div>
      </form>

      {last && (
        <div style={css("margin-top:18px;padding:14px 16px;background:#0D0D0D;border:1px solid #3A3010;border-radius:10px")}>
          <div style={css("font:600 12px var(--font-mono);color:#26A17B;margin-bottom:6px")}>✓ Confirmada · {last.id}</div>
          <div style={css("font:400 13px var(--font-hanken);color:#C8C8CE")}>
            {fmtN(last.receive_amount ?? 0, 2)} {last.receive_asset} → {last.wallet?.slice(0, 10)}…
          </div>
          <div style={css("margin-top:10px;display:flex;gap:12px;flex-wrap:wrap")}>
            <Link href={`/admin/transfers/${last.id}`} style={css("font:500 12px var(--font-hanken);color:#C9A227;text-decoration:none")}>
              Ver detalle →
            </Link>
            <Link href="/cryptohost" style={css("font:500 12px var(--font-hanken);color:#9A9AA0;text-decoration:none")}>
              Ver en monitor →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
